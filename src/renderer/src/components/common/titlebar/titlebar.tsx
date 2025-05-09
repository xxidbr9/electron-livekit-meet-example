import { X, Minus, Copy } from '@phosphor-icons/react'
import { Button } from '@renderer/components/ui/button'
import { Separator } from '@renderer/components/ui/separator'

type TitlebarProps = {
  onClose?: () => void
  onMinimize?: () => void
  title?: boolean
  subTitle?: string
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
  const handleCopyCode = async () => {
    const textCopy = props.subTitle || ''
    await navigator.clipboard.writeText(textCopy)
  }

  return (
    <div className="w-full h-10 app-drag flex items-center">
      {props.title && (
        <div className="flex items-center gap-x-2 ml-4 h-full">
          <h1 className="text-base font-medium">{props.title && 'Electron Livekit'}</h1>
          <div className="flex gap-x-2 items-center h-full py-2">
            {props.subTitle && (
              <>
                <Separator orientation="vertical" />
                <div className="flex items-center gap-x-2">
                  <span className="text-sm font-medium">{props.subTitle}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
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
