import { useState } from 'react'
import { ModalShareScreen } from '../modal-share-screen'
import { Titlebar } from '../titlebar'
import { Button } from '@renderer/components/ui/button'

const ConferenceLayout = () => {
  const onCloseWindows = () => {
    window.electron.send('close-conference-window')
  }

  const onMinimizeWindows = () => {
    window.electron.send('minimize-conference-window')
  }

  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [shareAudio, setShareAudio] = useState(false)

  return (
    <>
      <Titlebar onClose={onCloseWindows} onMinimize={onMinimizeWindows} />
      <ModalShareScreen
        onClose={() => setOpen(false)}
        onSelectedItem={setSelectedItem}
        open={open}
        selectedItem={selectedItem}
        setShareAudio={setShareAudio}
        shareAudio={shareAudio}
      />
      <div>
        Conference Layout
        <Button onClick={() => setOpen(true)}>Share Screen</Button>
      </div>
    </>
  )
}

export { ConferenceLayout }
