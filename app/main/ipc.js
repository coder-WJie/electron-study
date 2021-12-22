const {ipcMain, clipboard} = require('electron')
const {send: sendMainWindow} = require('./windows/main')
const {create: createControlWindow} = require('./windows/control')
// ipcMain.handle('login', async () => {
//     let {code} = await signal.invoke('login', null, 'logined')
//     return code
// })

module.exports = function() {
    ipcMain.handle('login', async () => {
        let code = Math.floor(Math.random()*(999999 - 100000)) + 100000
        return code
    })
    ipcMain.on('control', (e, remoteCode) => {
        // 这里跟服务器交互， 但mock数据返回
        sendMainWindow('control-state-change', remoteCode, 1)
        createControlWindow()
    } )
}

