import { useCallback, useEffect, useMemo, useState } from 'react'
import { ModalShareScreen } from '../modal-share-screen'
import { Titlebar } from '../titlebar'
import { useParams } from '@tanstack/react-router'
import { ControlBar } from '../control-bar'
import { RoomComponent } from '../room'
import {
  RoomContext,
  useParticipants,
  usePersistentUserChoices,
  useRoomContext
} from '@livekit/components-react'
import { useLocalStorage } from '@renderer/hooks'
import { LIVEKIT_PORT } from '@renderer/lib/config'
import { STORAGE_SERVER_URL, STORAGE_TOKEN } from '@renderer/lib/constants'
import {
  LocalVideoTrack,
  Room,
  RoomConnectOptions,
  RoomOptions,
  Track,
  VideoPresets
} from 'livekit-client'

const ConferenceLayout = () => {
  const [serverIp] = useLocalStorage(STORAGE_SERVER_URL, 'localhost')
  const [token] = useLocalStorage(STORAGE_TOKEN, '')
  const { userChoices } = usePersistentUserChoices()
  const liveKitUrl = useMemo(() => {
    return `ws://${serverIp}:${LIVEKIT_PORT}`
  }, [serverIp])
  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId ?? undefined,
        facingMode: 'user',
        resolution: VideoPresets.h1080
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers: [VideoPresets.h1080, VideoPresets.h1440, VideoPresets.h2160],
        red: !false,
        videoCodec: 'vp9'
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined
      },
      dynacast: true,
      e2ee: undefined
    }
  }, [])
  const room = useMemo(() => new Room(roomOptions), [roomOptions])

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true
    }
  }, [])
  useEffect(() => {
    room.connect(liveKitUrl, token, connectOptions).catch((error) => {
      console.error(error)
    })
  }, [room, liveKitUrl, token, connectOptions])

  return (
    <RoomContext.Provider value={room}>
      <ConferenceMainLayout />
    </RoomContext.Provider>
  )
}

const ConferenceMainLayout = () => {
  const room = useRoomContext()
  const params = useParams({ from: '/room/$roomId' })
  const meetingCode = params.roomId
  const { userChoices } = usePersistentUserChoices()

  useEffect(() => {
    room.localParticipant.setCameraEnabled(userChoices.videoEnabled).catch((error) => {
      console.log(error)
    })
    room.localParticipant.setMicrophoneEnabled(userChoices.audioEnabled).catch((error) => {
      console.log(error)
    })
  }, [room, userChoices.audioEnabled, userChoices.videoEnabled])
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
  const [shareAudio, setShareAudio] = useState(false)
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false)

  const shareScreen = useCallback(
    async (id: string) => {
      const has_access = await window.electron.getScreenAccess()
      if (!has_access) {
        return
      }
      const audioMandatory = shareAudio
        ? ({
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        } as unknown as MediaTrackConstraints)
        : false

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioMandatory,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: id,
            maxFrameRate: 60
          }
        } as unknown as MediaTrackConstraints
      })
      const track = stream.getVideoTracks()[0]
      const localVideoTrack = new LocalVideoTrack(track)
      const respVideo = await room.localParticipant.publishTrack(localVideoTrack, {
        source: Track.Source.ScreenShare,
        ...VideoPresets.h1440,
        simulcast: false,
        videoEncoding: {
          ...VideoPresets.h1440.encoding,
          maxFramerate: 60
        }
      })
      if (shareAudio) {
        await room.localParticipant.publishTrack(track, {
          source: Track.Source.ScreenShareAudio
        })
      }
      if (respVideo.trackSid) setIsScreenShareEnabled(true)
    },
    [room.localParticipant, shareAudio]
  )

  const handleShareScreen = (id: string, share_audio: boolean) => {
    setOpen(false)
    setShareAudio(share_audio)
    shareScreen(id)
  }
  const participants = useParticipants()

  return (
    <main
      data-lk-theme="default"
      className="dark bg-background text-foreground"
    >
      <Titlebar
        onClose={onCloseWindows}
        onMinimize={onMinimizeWindows}
        title
        subTitle={meetingCode}
      />
      <ModalShareScreen
        onStartShare={handleShareScreen}
        onClose={() => setOpen(false)}
        open={open}
      />
      {/* ROOM HERE */}
      <div className="lk-room-container !h-[calc(100vh_-_2.5rem)] ">
        <RoomComponent />
        <ControlBar
          shareAudio={shareAudio}
          totalOnline={participants.length}
          onExit={onCloseWindows}
          onShareScreenClick={() => setOpen(true)}
          onShareScreenChange={setIsScreenShareEnabled}
          onSettingClick={handleSettingClick}
          isOnShareScreen={isScreenShareEnabled}
        />
      </div>
    </main>
  )
}

export { ConferenceLayout }
