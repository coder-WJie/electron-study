const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const handleIPC = require('./ipc');
const { create } = require('./windows/main');

let win;
app.on('ready', () => {
  create();
  handleIPC();
  require('./robot')()
});
