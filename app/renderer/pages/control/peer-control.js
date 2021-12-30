// P2P控制端的逻辑都写在peer-control.js文件下

const EventEmitter = require('events');
const peer = new EventEmitter();
const { ipcRenderer } = require('electron');
// const ipc = require('../../../main/ipc');

// 视频流传输

const pc = new window.RTCPeerConnection({});

let dc = pc.createDataChannel('robotchannel', { reliable: false });
dc.onopen = function () {
  peer.on('robot', (type, data) => {
    dc.send(JSON.stringify({ type, data }));
  });
};
dc.onmessage = function (event) {
  console.log('message', event);
};

dc.onerror = (e) => {
  console.log('error', e);
};

async function createOffer() {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer);
  console.log('pc offer', JSON.stringify(pc.localDescription));
  return pc.localDescription;
}
createOffer().then((offer) => {
  ipcRenderer.send('forward', 'offer', { type: offer.type, sdp: offer.sdp });
});
/**
 * 1.创建连接
 * 2.创建连接offer
 * 3.将连接offer发送到傀儡端
 * 4.傀儡端进行一些操作后，返回给客户端响应offer
 * 5.控制端设置响应offer(远程SDP)
 */

ipcRenderer.on('answer', (e, answer) => {
  setRemote(answer);
});

ipcRenderer.on('candidate', (e, candidate) => {
  console.log('收到傀儡端的candidate -------candidate', candidate);
  addIceCandidate(candidate);
});

async function setRemote(answer) {
  await pc.setRemoteDescription(answer);
}

// onicecandidate
// addIceCandidate
// onicecandidate事件在RTCPeerConnection连接创建后就会调用
pc.onicecandidate = function (e) {
  console.log('candidate', e, JSON.stringify(e.candidate));
  if (e.candidate) {
    ipcRenderer.send(
      'forward',
      'control-candidate',
      JSON.stringify(e.candidate)
    );
  }
};

const candidates = [];
async function addIceCandidate(candidate) {
  if (!candidate || !candidate.type) return;
  candidates.push(candidate);
  if (pc.remoteDescription && pc.remoteDescription.type) {
    for (let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    candidates = [];
  }
}

window.addIceCandidate = addIceCandidate;

// 监听流增加
pc.onaddstream = function (e) {
  console.log('add stream', e);
  peer.emit('add-stream', e.stream);
};

// window.setRemote = setRemote

module.exports = peer;
