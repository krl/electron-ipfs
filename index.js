'use strict'

var app = require('app')
var BrowserWindow = require('browser-window')
var ipfsd = require('ipfsd-ctl')
var ipc = require('ipc')
var multiaddr = require('multiaddr')

require('crash-reporter').start()

var WEBUIPATH = '/ipfs/QmX4eQoPToCURdzuS8ddj11ve3xYqSotswzsZWp2TTFkxJ'

var mainWindow = null

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit()
})

var wizard = function (err) {
  mainWindow.loadUrl('file://' + __dirname + '/wizard/wizard.html')
  mainWindow.webContents.on('did-finish-load', function () {
    console.log('wizard finish')
    mainWindow.webContents.send('err', err.toString())
  })
}

var apiAddrToUrl = function (apiAddr) {
  var parts = multiaddr(apiAddr).nodeAddress()
  var url = 'http://' + parts.address + ':' + parts.port + WEBUIPATH
  console.log('url')
  console.log(url)
  return url
}

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.on('closed', function() {
    mainWindow = null
  })

  ipfsd.local(function (err, ipfs) {
    if (err) return wizard(err)
    ipfs.config.get("Addresses.API", function (err, apiAddr) {
      if (err) throw err
      mainWindow.loadUrl(apiAddrToUrl(apiAddr.Value))
    })
  })
})
