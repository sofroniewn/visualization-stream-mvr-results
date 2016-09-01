var writer = require('to2')
var raf = require('raf')

module.exports = {
  createStream: function () {
    var results = {
      trialNumber: 0,
      velocityForward: 0,
      velocityLateral: 0,
      wallLeft: 0,
      wallRight: 0,
      wallForward: 0,
      reward: false,
      collision: false,
      link: false,
      advance: false,
      response: false,
      elapsedTime: 0
    }
    var rewards = 0
    var responses = 0
    var timeEl =  document.createElement('h2')
    
    timeEl.innerHTML = 'Time: ' + (results.elapsedTime/1000).toFixed(1)
    document.body.appendChild(timeEl)

    var trialNumEl =  document.createElement('h2')
    trialNumEl.innerHTML = 'Trial number: ' + results.trialNumber
    document.body.appendChild(trialNumEl)

    createLED = function () {
      var LED = document.createElement('canvas')
      LED.width = 40
      LED.height = 40
      LED.style.backgroundColor = '#000000'
      LED.style.border = '2px solid white'
      return LED
    }
    
    var rewardLED = createLED()
    var responseLED = createLED()
    var collisionLED = createLED()
    document.body.appendChild(rewardLED)
    document.body.appendChild(responseLED)
    document.body.appendChild(collisionLED)


    var wdL =  document.createElement('h2')
    wdL.innerHTML = 'Left wall distance: ' + results.wallLeft + ' mm'
    document.body.appendChild(wdL)
    var wdR =  document.createElement('h2')
    wdR.innerHTML = 'Right wall distance: ' + results.wallRight + ' mm'
    document.body.appendChild(wdR)
    var wdF =  document.createElement('h2')
    wdF.innerHTML = 'Forward wall distance: ' + results.wallForward + ' mm'
    document.body.appendChild(wdF)
    var speedEl =  document.createElement('h2')
    var speed = (results.velocityForward**2 + results.velocityLateral**2)**(0.5)
    speedEl.innerHTML = 'Speed: ' + speed.toFixed(1) + ' cm/s'
    document.body.appendChild(speedEl)


    var line = require('lightning-line-streaming')
    var divG = document.createElement('div')
    divG.style.width='500px'
    var elG = document.body.appendChild(divG)
    var xTime = new Array(300).fill(0)
    var ySpeed = new Array(300).fill(0)
    var yDeltaTime = new Array(300).fill(0)
    var vizGraph = new line(elG, {
      'series': ySpeed,
      'index': xTime,
      'xaxis': 'Time (s)',
      'yaxis': 'Speed (cm/s)',
      'thickness': 7,
      'color': [255, 100, 0]
    }, [], {'zoom': false})
    var yDomain = [0, 50]
    var xDomain = [-7, 0]

    var ySpread = Math.abs(yDomain[1] - yDomain[0]) || 1;
    var xSpread = Math.abs(xDomain[1] - xDomain[0]) || 1;

    vizGraph.x.domain([xDomain[0] - 0.05 * xSpread, xDomain[1] + 0.05 * xSpread])
    vizGraph.y.domain([yDomain[0] - 0.05 * ySpread, yDomain[1] + 0.05 * ySpread])

    vizGraph.updateAxis()
    vizGraph.updateData({
      'series': [ySpeed, yDeltaTime],
      'index': xTime,
      'thickness': [2, 2],
      'color': [[255, 0, 0], [0, 0, 0]]
    })



    raf(function tick() {
      if (results.reward) {
        rewardLED.style.backgroundColor = '#00ff00'
      } else {
        rewardLED.style.backgroundColor = '#000000'
      }
      if (results.response) {
        responseLED.style.backgroundColor = '#ff00ff'
      } else {
        responseLED.style.backgroundColor = '#000000'
      }
      if (results.collision) {
        collisionLED.style.backgroundColor = '#ff0000'
      } else {
        collisionLED.style.backgroundColor = '#000000'
      }

      trialNumEl.innerHTML = 'Trial number: ' + results.trialNumber
      timeEl.innerHTML = 'Time: ' + (results.time/1000).toFixed(1)
      wdL.innerHTML = 'Left wall distance: ' + results.wallLeft.toPrecision(3) + ' mm'
      wdR.innerHTML = 'Right wall distance: ' + results.wallRight.toPrecision(3) + ' mm'
      wdF.innerHTML = 'Forward wall distance: ' + results.wallForward.toPrecision(3) + ' mm'
      speed = (results.velocityForward**2 + results.velocityLateral**2)**(0.5)*50
      speedEl.innerHTML = 'Speed: ' + speed.toFixed(1) + ' cm/s'

      ySpeed.push(speed) 
      yDeltaTime.push(results.deltaTime) 
      xTime.push(results.time/1000)
      yDeltaTime.shift()
      ySpeed.shift()
      xTime.shift()

      xDomain[0] = -5+results.time/1000
      xDomain[1] = results.time/1000
      xSpread = Math.abs(xDomain[1] - xDomain[0]) || 1;
      vizGraph.x.domain([xDomain[0] - 0.05 * xSpread, xDomain[1] + 0.05 * xSpread])

      vizGraph.updateAxis()
      vizGraph.updateData({
        'series': [ySpeed, yDeltaTime],
        'index': xTime,
        'thickness': [2, 2],
        'color': [[255, 0, 0], [0, 0, 0]]
      })

      raf(tick)
    })

    return writer.obj(function (data, enc, callback) {
      results = data
      callback()
    })
  }
}

// add wall distances histograms (thresholded on movement)
// add speed histogram
// add rolling speed plot - should smooth speed ????