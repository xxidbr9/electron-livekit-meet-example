/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
let isHealthy: boolean = false
let pingInterval: NodeJS.Timeout
let currentServerUrl: string = ''

const pingServer = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache'
    })
    return response.ok
  } catch (error) {
    console.error('Failed to ping LiveKit server:', error)
    return false
  }
}

/**
 * Initialize LiveKit health check and return health status
 * @returns Object containing server health status and URL
 */
export const initLivekitHealthCheck = (setLoading?: (arg: boolean) => void) => {
  // Get server URL from localStorage and parse it if it's JSON
  const storedUrl = localStorage.getItem('serverUrl')
  try {
    currentServerUrl = storedUrl ? JSON.parse(storedUrl) : ''
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // If parsing fails, use the raw value
    currentServerUrl = storedUrl || ''
  }

  const startHealthCheck = async () => {
    setLoading?.(true)
    // Clear existing interval if any
    if (pingInterval) {
      clearInterval(pingInterval)
    }

    currentServerUrl = 'http://' + currentServerUrl + "/health"
    // Initial check

    isHealthy = await pingServer(currentServerUrl)

    // Set up periodic checking
    // pingInterval = setInterval(async () => {
    //   isHealthy = await pingServer(currentServerUrl)
    // }, 10000) // Check every 10 seconds
  }

  // Watch for localStorage changes
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'serverUrl') {
      try {
        currentServerUrl = e.newValue ? JSON.parse(e.newValue) : ''
      } catch (e: any) {
        currentServerUrl = e.newValue || ''
      }
      startHealthCheck()
    }
  })

  // Initial setup
  if (currentServerUrl) {
    startHealthCheck()
  }

  // Return health status object
  return {
    getHealth: () => ({
      isHealthy,
      serverUrl: currentServerUrl
    })
  }
}

export const getLivekitHealth = () => ({
  isHealthy,
  serverUrl: currentServerUrl
})
