// P2P控制端的逻辑都写在peer-control.js文件下

const EventEmitter = require('events')
const peer = new EventEmitter()
const {ipcRenderer, desktopCapturer} = require('electron')

// mock操作
// async function getScreenStream() {
//     // 先获取源
//     const sources = await desktopCapturer.getSources({types: ['screen']})

//     // 捕获桌面流, 抛出添加流的事件，这样app.js可以拿到add-stream事件和我们的流
//     navigator.webkitGetUserMedia({
//         audio: false,
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: sources[0].id,
//                 maxWidth: window.screen.width,
//                 maxHeight: window.screen.height
//             }
//         }
//     }, (stream) => {
//         peer.emit('add-stream', stream)
//     }, (err) => {
//         // handle err
//         console.log('err',err);
//     })
// }

// getScreenStream()

// peer.on('robot', (type, data) => {
//     if(type === 'mouse') {
//         data.screen = {
//             width: window.screen.width,
//             height: window.screen.height
//         }

//     }
//     ipcRenderer.send('robot', type, data)
// })


// 视频流传输
const pc = new window.RTCPeerConnection({})
async function createOffer() {
     const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })
    await pc.setLocalDescription(offer)
    console.log('pc offer', JSON.stringify(pc.localDescription));
    return pc.localDescription
}
createOffer()
/**
 * 1.创建连接
 * 2.创建连接offer
 * 3.将连接offer发送到傀儡端
 * 4.傀儡端进行一些操作后，返回给客户端响应offer
 * 5.控制端设置响应offer(远程SDP)
 */

async function setRemote(answer) {
    await pc.setRemoteDescription(answer)
}

window.setRemote = setRemote
// 监听流增加
pc.onaddstream = function(e) {
    console.log('add stream', e)
    peer.emit('add-stream', e.stream)
}
module.exports = peer