const { ipcMain, clipboard } = require('electron');
const { send: sendMainWindow } = require('./windows/main');
const { create: createControlWindow, send: sendControlWindow } = require('./windows/control');
const signal = require('./signal');
// ipcMain.handle('login', async () => {
//     let {code} = await signal.invoke('login', null, 'logined')
//     return code
// })

module.exports = function () {
  ipcMain.handle('login', async () => {
    let { code } = await signal.invoke('login', null, 'logined');
    console.log('code', code);
    return code;
  });
  ipcMain.on('control', async (e, remote) => {
    signal.send('control', { remote });
  });
  signal.on('controlled', (data) => {
    sendMainWindow('control-state-change', data.remote, 1);
    createControlWindow();
  });
  signal.on('be-controlled', (data) => {
    sendMainWindow('control-state-change', data.remote, 2);
  });

  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });
  signal.on('offer', (data) => {
    sendMainWindow('offer', data);
  });
  signal.on('answer', (data) => {
    sendControlWindow('answer', data);
  });
  // 收到傀儡端的candidate,需要将其转发到控制端
  signal.on('puppet-candidate', (data) => {
    sendControlWindow('candidate', data);
  });
  // 收到控制端的candidate,需要将其转发到傀儡端
  signal.on('control-candidate', (data) => {
    sendMainWindow('candidate', data);
  });
};
