import { X, Minus } from '@phosphor-icons/react'
import { ipcRenderer } from 'electron/renderer'

declare global {
  interface Window {
    electron: {
      send: (channel: string, data?: unknown) => void
      receive: (channel: string, func: (...args: unknown[]) => void) => void
    }
    ipcRenderer: typeof ipcRenderer
  }
}

type TitlebarProps = {
  onClose?: () => void
  onMinimize?: () => void
  title?: string
}
export const Titlebar = (props: TitlebarProps) => {
  const handleMin = () => {
    // appWindow.minimize()
    // window.electron.send('minimize-app')
    props.onMinimize?.()
  }
  // const handleMax = () => {
  //   appWindow.toggleMaximize()
  // }
  const handleClose = () => {
    // appWindow.close()
    // window.electron.send('close-app')
    // console.log('close app')
    props.onClose?.()
  }
  return (
    <div className="w-full h-10 app-drag flex items-center">
      {props.title && (
        <h1 className="mx-4 text-base font-medium">{props.title && 'Electron Livekit'}</h1>
      )}
      <div className="titlebar z-[99999]" style={{ right: 0 }}>
        {props.onMinimize && (
          <div className="titlebar-button no-drag" onClick={handleMin} id="titlebar-minimize">
            <Minus size={18} />
          </div>
        )}
        {/* <div className="titlebar-button" onClick={handleMax} id="titlebar-maximize">
          <Cards size={18} />
        </div> */}
        {props.onClose && (
          <div
            className="titlebar-button btn-danger no-drag"
            onClick={handleClose}
            id="titlebar-close"
          >
            <X size={18} />
          </div>
        )}
      </div>
      {/* <div className="h-9 w-full" /> */}
    </div>
  )
}
