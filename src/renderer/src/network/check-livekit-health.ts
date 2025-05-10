/* eslint-disable prettier/prettier */

import { STORAGE_SERVER_URL } from "@renderer/lib/constants"

/* eslint-disable @typescript-eslint/no-explicit-any */
let isHealthy: boolean = false
let currentServerIP: string = ''
let loading: boolean = true

const pingServer = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache'
    })
    loading = false
    return response.ok
  } catch (error) {
    console.error('Failed to ping LiveKit server:', error)
    loading = false
    return false
  }
}

/**
 * Initialize LiveKit health check and return health status
 * @returns Object containing server health status and URL
 */
export const initLivekitHealthCheck = () => {
  // Get server URL from localStorage and parse it if it's JSON
  const storedUrl = localStorage.getItem(STORAGE_SERVER_URL)
  try {
    currentServerIP = storedUrl ? JSON.parse(storedUrl) : ''
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // If parsing fails, use the raw value
    currentServerIP = storedUrl || ''
  }

  const startHealthCheck = async () => {
    loading = true
    // Clear existing interval if any

    currentServerIP = `http://${currentServerIP}:8080/health`
    // Initial check

    isHealthy = await pingServer(currentServerIP)
  }

  // Watch for localStorage changes
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'serverUrl') {
      try {
        currentServerIP = e.newValue ? JSON.parse(e.newValue) : ''
      } catch (e: any) {
        currentServerIP = e.newValue || ''
      }
      startHealthCheck()
    }
  })

  // Initial setup
  if (currentServerIP) {
    startHealthCheck()
  }

  // Return health status object
  return {
    getHealth: () => ({
      isHealthy,
      serverUrl: currentServerIP,
      loading
    })
  }
}

