var resultsViz = require('./')
var IPCStream = require('electron-ipc-stream')
var ipcsR = new IPCStream('results')

var resultsStream = resultsViz.createStream()
ipcsR.pipe(resultsStream)


//var ipcRenderer = require('electron').ipcRenderer
//var stream = null
// ipcsT.on('data', function (data) {
//   viz.updateTrial(data.map)
// })

// ipcRenderer.on('initViz', function (event, map) {
//   stream = viz.createStream(map)
//   ipcsD.pipe(stream)
// })