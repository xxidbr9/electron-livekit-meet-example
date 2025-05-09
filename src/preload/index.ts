/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
// import { desktopCapturer } from 'electron/main'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      send: (channel: string, data: never) => {
        // whitelist channels
        // const validChannels = ['toMain', 'close-app', 'minimize-app']
        // if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
        // }
      },
      receive: (channel: string, func: any) => {
        const validChannels = ['fromMain']
        if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender`
          ipcRenderer.on(channel, (_event, ...args) => func(...args))
        }
      },
      openScreenSecurity: () => ipcRenderer.invoke('electronMain:openScreenSecurity'),
      getScreenAccess: () => ipcRenderer.invoke('electronMain:getScreenAccess'),
      getScreenSources: () => ipcRenderer.invoke('electronMain:screen:getSources'),
      getLocalIP: () => ipcRenderer.invoke('electronMain:getLocalIP'),
      scanForServerIP: () => ipcRenderer.invoke('electronMain:scanForServerIP')
    })
    contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
