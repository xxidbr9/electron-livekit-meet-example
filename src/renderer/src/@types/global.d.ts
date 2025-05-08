import { ipcRenderer } from 'electron/renderer'

declare global {
  interface Window {
    electron: {
      send: (channel: string, data?: unknown) => void
      receive: (channel: string, func: (...args: unknown[]) => void) => void
      openScreenSecurity: () => void
      getScreenAccess: () => Promise<boolean>
      getScreenSources: () => Promise<Electron.DesktopCapturerSource[]>
    }
    ipcRenderer: typeof ipcRenderer
  }
}
