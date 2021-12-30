
const peer = require('./peer-control')

peer.on('add-stream', (stream) => {
    console.log('stream', stream);
    play(stream)
})

// 获取桌面流
let video = document.getElementById('screen-video')
function play(stream) {
  console.log('DOM元素 ----- video',video);
  console.log('桌面流播放------stream', stream);
    video.srcObject = stream
    video.onloadedmetadata = function() {
        video.play()
    }
} 

window.onkeydown = function(e) {
  // data {keyCode, meta, alt, ctrl, shift}
  let data = {
    keyCode: e.keyCode,
    shift: e.shiftKey,
    meta: e.metaKey,
    control: e.ctrlKey,
    alt: e.altKey,
  };
  peer.emit('robot', 'key', data);
}


window.onmouseup = function(e) {
  // data {clientX, clientY, screen: {width, height}, video: {width, height}}
  let data = {};
  data.clientX = e.clientX;
  data.clientY = e.clientY;
  data.video = {
    width: video.getBoundingClientRect().width,
    height: video.getBoundingClientRect().height,
  };
  peer.emit('robot', 'mouse', data);
}




