import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet
} from '@tanstack/react-router'
import { MainMenu, MenuSettings, ConferenceLayout } from './components/common'
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
})

const routeTree = rootRoute.addChildren([indexRoute, settingsRoute, RoomRoute])

const hashHistory = createHashHistory()
export const router = createRouter({ routeTree, history: hashHistory })
