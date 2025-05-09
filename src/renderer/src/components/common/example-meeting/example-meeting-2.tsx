import './example-meeting.css'
import '@livekit/components-styles'
import '@livekit/components-styles/prefabs'
import { formatChatMessageLinks, RoomContext, VideoConference } from '@livekit/components-react'
import {
  Room,
  RoomConnectOptions,
  RoomOptions,
  Track,
  VideoPresets,
  type VideoCodec
} from 'livekit-client'
import { useEffect, useMemo } from 'react'
import { STORAGE_SERVER_URL, STORAGE_TOKEN } from '@renderer/lib/constants'
import { useLocalStorage } from '@renderer/hooks'
import { LIVEKIT_PORT } from '@renderer/lib/config'

export function ExampleMeeting2(props: {
  // liveKitUrl: string
  // token: string
  codec: VideoCodec | undefined
}) {
  const [serverIp] = useLocalStorage(STORAGE_SERVER_URL, 'localhost')
  const [token] = useLocalStorage(STORAGE_TOKEN, '')

  const liveKitUrl = useMemo(() => {
    return `ws://${serverIp}:${LIVEKIT_PORT}`
  }, [serverIp])

  const roomOptions = useMemo((): RoomOptions => {
    return {
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        red: !false,
        videoCodec: props.codec
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
      e2ee: undefined
    }
  }, [props.codec])

  const room = useMemo(() => new Room(roomOptions), [roomOptions])

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true
    }
  }, [])
  useEffect(() => {
    console.log(props)
  }, [props])

  useEffect(() => {
    room.connect(liveKitUrl, token, connectOptions).catch((error) => {
      console.error(error)
    })
    room.localParticipant.enableCameraAndMicrophone().catch((error) => {
      console.error(error)
    })
  }, [room, liveKitUrl, token, connectOptions])

  const shareScreen = async () => {
    const has_access = await window.electron.getScreenAccess()
    if (!has_access) {
      return
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: 'screen:0:0'
        }
      } as unknown as MediaTrackConstraints
    })
    const track = stream.getVideoTracks()[0]
    const resp = await room.localParticipant.publishTrack(track, {
      source: Track.Source.ScreenShare
    })
    console.log(resp)
  }

  return (
    <div className="lk-room-container">
      <button onClick={shareScreen}>Share Screen</button>
      <RoomContext.Provider value={room}>
        <VideoConference chatMessageFormatter={formatChatMessageLinks} />
      </RoomContext.Provider>
    </div>
  )
}
