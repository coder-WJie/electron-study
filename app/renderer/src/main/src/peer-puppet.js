// P2P傀儡端逻辑
/**
 * createAnswer
 * addstream
 */
// import {desktopCapturer} from 'electron'
const { desktopCapturer } = window.require('electron');

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
          resolve(stream)
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

const pc = new window.RTCPeerConnection({});
async function createAnswer(offer) {
    let screenStream = await getScreenStream()
    pc.addStream(screenStream)
    await pc.setRemoteDescription(offer)
    await pc.setLocalDescription(await pc.createAnswer())
    console.log('answer', JSON.stringify(pc.localDescription));
    return pc.localDescription
}

window.createAnswer = createAnswer
window.a = 333