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

export function ExampleMeeting2(props: {
  liveKitUrl: string
  token: string
  codec: VideoCodec | undefined
}) {
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
    room.connect(props.liveKitUrl, props.token, connectOptions).catch((error) => {
      console.error(error)
    })
    room.localParticipant.enableCameraAndMicrophone().catch((error) => {
      console.error(error)
    })
  }, [room, props.liveKitUrl, props.token, connectOptions])

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
