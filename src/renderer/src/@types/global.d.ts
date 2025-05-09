import { ipcRenderer } from 'electron/renderer'
// import { ScreenShareCaptureOptions } from 'livekit-client'
declare global {
  interface Window {
    electron: {
      send: (channel: string, data?: unknown) => void
      receive: (channel: string, func: (...args: unknown[]) => void) => void
      openScreenSecurity: () => void
      getScreenAccess: () => Promise<boolean>
      getScreenSources: () => Promise<Electron.DesktopCapturerSource[]>
      getLocalIP: () => string
      scanForServerIP: () => Promise<string>
    }
    ipcRenderer: typeof ipcRenderer
  }
}
declare module 'livekit-client' {
  interface ScreenShareCaptureOptions {
    video?: MediaTrackConstraints
  }
}
