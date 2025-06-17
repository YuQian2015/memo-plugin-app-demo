import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.scss'
import { Bridge } from '@aim-packages/iframe-ipc'
import manifest from "../../main/manifest.json";

if (!window.AIM) {
  // @ts-ignore
  window.AIM = new Bridge({
    methods: manifest.apis,
    appId: manifest.pluginId,
  }) || {}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
