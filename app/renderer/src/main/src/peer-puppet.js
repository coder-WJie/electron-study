// P2P傀儡端逻辑
/**
 * createAnswer
 * addstream
 */
// import {desktopCapturer} from 'electron'
const { desktopCapturer, ipcRenderer } = window.require('electron');

async function getScreenStream() {
  // 先获取源
  const sources = await desktopCapturer.getSources({ types: ['screen'] });

  return new Promise((resolve, reject) => {
    // 捕获桌面流, 抛出添加流的事件，这样app.js可以拿到add-stream事件和我们的流
    navigator.webkitGetUserMedia(
      {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[0].id,
            maxWidth: window.screen.width,
            maxHeight: window.screen.height,
          },
        },
      },
      (stream) => {
        resolve(stream);
        // peer.emit('add-stream', stream);
      },
      (err) => {
        // handle err
        console.log('err', err);
      }
    );
  });
}

getScreenStream();
// 视频传输
const pc = new window.RTCPeerConnection({});
pc.ondatachannel = (e) => {
  console.log('datachannel', e);
  e.channel.onmessage = (e) => {
    let { type, data } = JSON.parse(e.data);
    if (type === 'mouse') {
      data.screen = {
        width: window.screen.width,
        height: window.screen.height,
      };
    }
    ipcRenderer.send('robot', type, data);
  };
};
// onicecandidate
// addIceCandidate
// onicecandidate事件在RTCPeerConnection连接创建后就会调用
pc.onicecandidate = function (e) {
  console.log('candidate', JSON.stringify(e.candidate));
  if (e.candidate) {
    ipcRenderer.send('forward', 'puppet-candidate', e.candidate);
  }
};
ipcRenderer.on('candidate', (e, candidate) => {
  addIceCandidate(candidate);
});

let candidates = [];
async function addIceCandidate(candidate) {
  // 有个细节，在添加candidate的时候，只有在pc.remoteDescription设置上之后才能添加
  // 而在设置上之前，需要将其先放到一个缓冲池中
  if (candidate) {
    candidates.push(candidate);
  }

  if (pc.remoteDescription && pc.remoteDescription.type) {
    for (let i = 0; i < candidates.length; i++) {
      await pc.addIceCandidate(new RTCIceCandidate(candidates[i]));
    }
    candidates = [];
  }
}
window.addIceCandidate = addIceCandidate;

ipcRenderer.on('offer', async (e, offer) => {
  let answer = await createAnswer(offer);
  ipcRenderer.send('forward', 'answer', { type: answer.type, sdp: answer.sdp });
});

async function createAnswer(offer) {
  let screenStream = await getScreenStream();
  pc.addStream(screenStream);
  await pc.setRemoteDescription(offer);
  await pc.setLocalDescription(await pc.createAnswer());
  console.log('answer', JSON.stringify(pc.localDescription));
  return pc.localDescription;
}

window.createAnswer = createAnswer;
