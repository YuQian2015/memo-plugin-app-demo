import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.scss'
import { Bridge } from '@aim-packages/iframe-ipc'
import manifest from "../../main/manifest.json";

if (!window.AIM) {
  // @ts-ignore
  window.AIM = new Bridge({
    methods: [
      "copyText",
      "transcriptionData",
      "chat.getProviders",
      "chat.getModels",
      "chat.chat",
      "storage.removeItem",
      "storage.setItem",
      "storage.getItem",
      "storage.clear",
      "closeWindow",
      "file.saveFile",
    ],
    appId: manifest.pluginId,
  }) || {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
