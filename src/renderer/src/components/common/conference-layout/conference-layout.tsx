import { useEffect, useState } from 'react'
import { ModalShareScreen } from '../modal-share-screen'
import { Titlebar } from '../titlebar'
import { useParams } from '@tanstack/react-router'
import { ControlBar } from '../control-bar'

const ConferenceLayout = () => {
  const params = useParams({ from: '/room/$roomId' })
  const meetingCode = params.roomId

  useEffect(() => {
    console.log(meetingCode)
  }, [meetingCode])
  const onCloseWindows = () => {
    window.electron.send('close-conference-window')
  }

  const onMinimizeWindows = () => {
    window.electron.send('minimize-conference-window')
  }

  const handleSettingClick = () => {
    window.electron.send('show-setting-window')
  }

  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [shareAudio, setShareAudio] = useState(false)

  return (
    <div
    // className="dark bg-background text-foreground"
    >
      <Titlebar
        onClose={onCloseWindows}
        onMinimize={onMinimizeWindows}
        title
        subTitle={meetingCode}
      />
      <ModalShareScreen
        onClose={() => setOpen(false)}
        onSelectedItem={setSelectedItem}
        open={open}
        selectedItem={selectedItem}
        setShareAudio={setShareAudio}
        shareAudio={shareAudio}
      />
      <div className="h-[calc(100vh_-_2.5rem)]">
        <ControlBar
          totalOnline={4}
          onExit={onCloseWindows}
          onShareScreenClick={() => setOpen(true)}
          onSettingClick={handleSettingClick}
        />
      </div>
    </div>
  )
}

export { ConferenceLayout }
