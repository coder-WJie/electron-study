import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import './peer-puppet';
// import { ipcRenderer } from 'electron'
const { ipcRenderer } = window.require('electron');
// console.log('------window.require------', window.require);
// console.log(`----------ipc------------`, ipcRenderer);

function App() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [controlText, setControlText] = useState('');
  const login = async () => {
    let code = await ipcRenderer.invoke('login')
    setLocalCode(code)
  }

  const startControl = (remoteCode) => {
    ipcRenderer.send('control', remoteCode)
  } 

  const handleControlState = (e, name, type) => {
    let text = ''
    if(type === 1) {
      text = `正在远程控制${name}`
    } else if(type === 2) {
      text = `被${name}控制中`
    } else {
      text = ``
    }
    setControlText(text)
  }

  useEffect(() => {
    login()
    ipcRenderer.on('control-state-change', handleControlState)
    return () => {
      ipcRenderer.removeListener('control-state-change', handleControlState)
    }
  }, [])

  return (
    <div className="App">
      {controlText === '' ? (
        <>
          <div>
            你的控制码
            <span >{localCode}</span>
          </div>
          <input
            type="text"
            value={remoteCode}
            onChange={(e) => setRemoteCode(e.target.value)}
          ></input>
          <button onClick={() => {startControl(remoteCode)}}>确认</button>
        </>
      ) : (
        <div>{controlText}</div>
      )}
    </div>
  );
}

export default App;
