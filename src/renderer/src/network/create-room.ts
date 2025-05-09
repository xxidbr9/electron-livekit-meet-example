import { SERVER_PORT } from '@renderer/lib/config'
import { NetworkOptions } from './network-types'

type CreateRoomReqType = {
  roomName: string
  identity: string
}

type CreateRoomResType = {
  message: string
  data: {
    room: {
      room_name: string
    }
    identity: string
    token: string
  }
}

export async function createRoomNetwork(args: CreateRoomReqType, opts: NetworkOptions) {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')

  const res = await fetch(`http://${opts.serverUrl}:${SERVER_PORT}/api/rooms`, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify({
      room_name: args.roomName,
      identity: args.identity
    })
  })
  const result = await res.json()
  return result as CreateRoomResType
}
