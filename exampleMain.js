var electron = require('electron')
var IPCStream = require('electron-ipc-stream')

var app = electron.app
var BrowserWindow = electron.BrowserWindow
var mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    resizable: false,
    frame: false,
  })
  mainWindow.loadURL(`file://${__dirname}/example.html`)
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

/////////////////////////////////////////////////////////////////
var map = {
  area: [[-15, 0], [-15, 20], [-45.2, 47.7], [-45.2, 57.7],
    [-15.3, 57.7], [-15.3, 47.7], [0, 33.7], [15.3, 47.7], [15.3, 57.7],
    [-15, 85.4], [-15, 95.4], [15, 95.4], [15, 85.4], [30.3, 71.4],
    [45.6, 85.4], [45.6, 95.4], [75.6, 95.4], [75.6, 85.4], [45.3, 57.7],
    [45.3, 47.7], [15, 20], [15, 0], [-15, 0]],
  borders: [
    [[-15, -0.5], [-15, 20], [-45.2, 47.7], [-45.2, 57.7],
      [-15.3, 57.7], [-15.3, 47.7], [0, 33.7], [15.3, 47.7], [15.3, 57.7],
      [-15, 85.4], [-15, 95.9]],
    [[15, 95.9], [15, 85.4], [30.3, 71.4], [45.6, 85.4], [45.6, 95.4],
      [75.6, 95.4], [75.6, 85.4], [45.3, 57.7],
      [45.3, 47.7], [15, 20], [15, -0.5]]
    ],
  links: [
      [[-15, 95.4], [15, 95.4]], [[-15, 0], [15, 0]],
    ],
  triggers: [
    [[4.7, 72.8], [-7.5, 84], [10.5, 84], [22.7, 72.8]]
  ],
  playerStart: [0, 5],
  playerShape: [
    [-2,-1.5], [0, 1.5], [2, -1.5]
  ]
}

var experiment = require('experiment-stream-mvr-map')()
var device = require('device-stream-mvr-stdin')()

// ipcMain.on('updateMap', function (event, arg) {
//   return event.sender.send('updateMap', 'helllooooo')
// })

app.on('ready', function() {
  createWindow()
  var ipcsD = new IPCStream('device', mainWindow)
  var ipcsT = new IPCStream('trial', mainWindow)
  var ipcsR = new IPCStream('results', mainWindow)

  var deviceStream = device.createStream()
  var expState = true
  device.start()
  var expt = experiment.createStream()
  experiment.initTrial(map)
//  mainWindow.webContents.send('initViz', 'map')

  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.webContents.send('initViz', map)
  })

  var results = deviceStream.pipe(expt)
  results.pipe(deviceStream)
  results.pipe(ipcsD)
  results.pipe(ipcsR)
  experiment.trialStream.pipe(ipcsT)

  process.stdin.on('data', function(data) {
    if (data.toString().trim() === 'n') {
      experiment.updateTrial(mapNEW)
    }
    if (data.toString().trim() === 'm') {
      experiment.updateTrial(map)
    }
    if (data.toString().trim() === 'r') {
      experiment.advanceTrial()
    }
    if (data.toString().trim() === 'p') {
      if (expState) {
        device.stop()
      } else {
        device.start()
      }
      expState = !expState
    }
  })

  mainWindow.on('close', function () {
    ipcsD.pause()
    results.pause()
    ipcsT.pause()
    deviceStream.pause()
  })
})

process.stdin.on('data', function(data) {
  if (data.toString().trim() === 'q') app.quit()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})