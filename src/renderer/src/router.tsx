import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet
} from '@tanstack/react-router'
import { ConferenceLayout, MainMenu, MenuSettings } from './components/common'
import { z } from 'zod'
// import z from 'zod'

export const rootRoute = createRootRoute({
  component: Outlet
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainMenu
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: MenuSettings
})

const RoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$roomId',
  params: z.object({
    roomId: z.string()
  }),
  component: ConferenceLayout
  // component: () => (
  //   <ExampleMeeting2
  //     codec="h264"
  //     // liveKitUrl={import.meta.env.VITE_LIVEKIT_URL}
  //     // token={import.meta.env.VITE_LIVEKIT_TOKEN}
  //   />
  // )
  // component: ExampleMeeting
})

const routeTree = rootRoute.addChildren([indexRoute, settingsRoute, RoomRoute])

const hashHistory = createHashHistory()
export const router = createRouter({ routeTree, history: hashHistory })
