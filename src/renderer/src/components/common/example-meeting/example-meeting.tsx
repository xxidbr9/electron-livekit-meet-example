/* eslint-disable @typescript-eslint/no-explicit-any */
import './example-meeting.css'
import '@livekit/components-styles'
import '@livekit/components-styles/prefabs'
import {
  formatChatMessageLinks,
  LocalUserChoices,
  PreJoin,
  RoomContext,
  VideoConference
} from '@livekit/components-react'
import { RoomOptions, VideoCodec, VideoPresets, Room, RoomEvent } from 'livekit-client'
import React from 'react'
import { LocalAudioTrack, LocalVideoTrack, videoCodecs } from 'livekit-client'

export interface SessionProps {
  roomName: string
  identity: string
  audioTrack?: LocalAudioTrack
  videoTrack?: LocalVideoTrack
  region?: string
  turnServer?: RTCIceServer
  forceRelay?: boolean
}

export interface TokenResult {
  identity: string
  accessToken: string
}

export function isVideoCodec(codec: string): codec is VideoCodec {
  return videoCodecs.includes(codec as VideoCodec)
}

export type ConnectionDetails = {
  serverUrl: string
  roomName: string
  participantName: string
  participantToken: string
}

// Return connection details
const data: ConnectionDetails = {
  serverUrl: import.meta.env.VITE_LIVEKIT_SERVER_URL,
  roomName: 'globals',
  participantToken: import.meta.env.VITE_LIVEKIT_TOKEN,
  participantName: 'Nando'
}

export function ExampleMeeting() {
  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined
  )
  const preJoinDefaults = React.useMemo(() => {
    return {
      username: '',
      videoEnabled: true,
      audioEnabled: true
    }
  }, [])
  const [connectionDetails, setConnectionDetails] = React.useState<any>(undefined)
  const handlePreJoinSubmit = React.useCallback(async (values: LocalUserChoices) => {
    setPreJoinChoices(values)
    setConnectionDetails(data)
  }, [])
  const handlePreJoinError = React.useCallback((e: any) => console.error(e), [])

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      {connectionDetails === undefined || preJoinChoices === undefined ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
          <PreJoin
            defaults={preJoinDefaults}
            onSubmit={handlePreJoinSubmit}
            onError={handlePreJoinError}
          />
        </div>
      ) : (
        <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          options={{ codec: 'vp8', hq: false }}
        />
      )}
    </main>
  )
}

function VideoConferenceComponent(props: {
  userChoices: LocalUserChoices
  connectionDetails: any
  options: {
    hq: boolean
    codec: VideoCodec
  }
}) {
  const roomOptions = React.useMemo((): RoomOptions => {
    const videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9'
    return {
      videoCaptureDefaults: {
        deviceId: props.userChoices.videoDeviceId ?? undefined,
        resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers: props.options.hq
          ? [VideoPresets.h1080, VideoPresets.h720]
          : [VideoPresets.h540, VideoPresets.h216],
        videoCodec
      },
      audioCaptureDefaults: {
        deviceId: props.userChoices.audioDeviceId ?? undefined
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true
    }
  }, [props.userChoices, props.options.hq, props.options.codec])

  const room = React.useMemo(() => new Room(roomOptions), [roomOptions])
  const handleOnLeave = React.useCallback(() => console.log('leave'), [])
  const handleError = React.useCallback((error: Error) => {
    console.error(error)
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`)
  }, [])
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error(error)
    alert(
      `Encountered an unexpected encryption error, check the console logs for details: ${error.message}`
    )
  }, [])
  React.useEffect(() => {
    room.on(RoomEvent.Disconnected, handleOnLeave)
    room.on(RoomEvent.EncryptionError, handleEncryptionError)
    room.on(RoomEvent.MediaDevicesError, handleError)

    return () => {
      room.off(RoomEvent.Disconnected, handleOnLeave)
      room.off(RoomEvent.EncryptionError, handleEncryptionError)
      room.off(RoomEvent.MediaDevicesError, handleError)
    }
  }, [
    room,
    props.connectionDetails,
    props.userChoices,
    handleOnLeave,
    handleEncryptionError,
    handleError
  ])

  return (
    <div className="lk-room-container">
      <RoomContext.Provider value={room}>
        <VideoConference chatMessageFormatter={formatChatMessageLinks} />
      </RoomContext.Provider>
    </div>
  )
}
