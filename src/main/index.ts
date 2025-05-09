import { app, shell, BrowserWindow, ipcMain, desktopCapturer, systemPreferences } from 'electron'
import { join } from 'path'
import os from 'os'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { openSystemPreferences } from 'electron-util'
import { fetch } from 'undici'

let mainWindow: BrowserWindow | null = null
function createMainWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Electron Livekit',
    width: 420,
    height: 382,
    show: false,
    titleBarStyle: 'hidden',
    resizable: false,
    // frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

let settingWindow: BrowserWindow | null = null
function createSettingMainWindow(): void {
  // Create the browser window.
  settingWindow = new BrowserWindow({
    title: 'Server Setting',
    width: 580,
    height: 232,
    show: false,
    titleBarStyle: 'hidden',
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  settingWindow.on('ready-to-show', () => {
    settingWindow?.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/settings')
  } else {
    settingWindow.loadFile(join(__dirname, '../renderer/index.html' + '#/settings'))
  }
}

let conferenceWindow: BrowserWindow | null = null
type CreateConferenceWindowParams = {
  roomId: string
  roomName: string
}

function createConferenceWindow({ roomId, roomName }: CreateConferenceWindowParams): void {
  // Create the browser window.
  conferenceWindow = new BrowserWindow({
    title: `${roomName} | Meeting`,
    // Fullscreen: true,
    fullscreen: true,
    show: false,
    titleBarStyle: 'hidden',
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  conferenceWindow.on('ready-to-show', () => {
    conferenceWindow?.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    conferenceWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + `#/room/${roomId}`)
  } else {
    conferenceWindow.loadFile(join(__dirname, '../renderer/index.html' + `#/room/${roomId}`))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  app.commandLine.appendSwitch('log-level', '3') // '3' = WARNING and above only
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createMainWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  ipcMain.on('close-app', () => {
    mainWindow?.close()
    mainWindow = null
    app.quit()
  })

  ipcMain.on('minimize-app', () => {
    mainWindow?.minimize()
  })

  // ipc render show setting window
  ipcMain.on('show-setting-window', () => {
    if (settingWindow) {
      settingWindow.show()
    } else {
      createSettingMainWindow()
    }
  })
  // ipc render close setting window
  ipcMain.on('close-setting-window', () => {
    settingWindow?.close()
    settingWindow = null
  })

  ipcMain.handle('electronMain:openScreenSecurity', () =>
    openSystemPreferences('security', 'Privacy_ScreenCapture')
  )
  ipcMain.handle('electronMain:openCameraSecurity', () =>
    openSystemPreferences('security', 'Privacy_Camera')
  )
  ipcMain.handle('electronMain:openMicrophoneSecurity', () =>
    openSystemPreferences('security', 'Privacy_Microphone')
  )

  ipcMain.handle(
    'electronMain:getScreenAccess',
    () => systemPreferences.getMediaAccessStatus('screen') === 'granted'
  )
  ipcMain.handle(
    'electronMain:getCameraAccess',
    () => systemPreferences.getMediaAccessStatus('camera') === 'granted'
  )
  ipcMain.handle(
    'electronMain:getMicrophoneAccess',
    () => systemPreferences.getMediaAccessStatus('microphone') === 'granted'
  )
  ipcMain.handle('electronMain:screen:getSources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      fetchWindowIcons: true,
      thumbnailSize: {
        width: 854,
        height: 480
      }
    })
    return sources
      .map((source) => {
        return {
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL(), // convert image for transfer
          appIcon: source.appIcon ? source.appIcon.toDataURL() : null
        }
      })
      .filter((sources) => sources.thumbnail !== 'data:image/png;base64,')
  })
  // ipc render show conference window
  ipcMain.on('show-conference-window', (_, params: CreateConferenceWindowParams) => {
    // TODO: split this as function
    mainWindow?.close()
    mainWindow = null
    if (conferenceWindow) {
      conferenceWindow.show()
    } else {
      params.roomId = params.roomId || 'GLOBALS'
      console.log(params)
      createConferenceWindow({
        roomId: params.roomId,
        roomName: params.roomName
      })
    }
  })

  // ipc render close conference window
  ipcMain.on('close-conference-window', () => {
    conferenceWindow?.close()
    conferenceWindow = null
    createMainWindow()
  })

  ipcMain.on('minimize-conference-window', () => {
    conferenceWindow?.minimize()
  })

  // get local ip
  const scanLocalIP = () => {
    const ifaces = os.networkInterfaces()
    let ip = ''
    for (const devName in ifaces) {
      const iface = ifaces[devName]
      if (!iface) {
        continue
      }
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i]
        if (alias.family === 'IPv4' && alias.address !== '1IP_ADDRESS' && !alias.internal) {
          ip = alias.address
          return ip
        }
      }
    }
    return ip
  }
  ipcMain.handle('electronMain:getLocalIP', scanLocalIP)

  ipcMain.handle('electronMain:scanForServerIP', async () => {
    const ip = scanLocalIP()
    const ipArray = ip.split('.')
    const ipPrefix = ipArray.slice(0, 3).join('.')
    const ipList: string[] = []
    for (let i = 1; i < 255; i++) {
      ipList.push(`${ipPrefix}.${i}`)
    }

    const ipListWithPort: string[] = ipList.map((ip) => `http://${ip}:8080/health`)

    const fetchPromises = ipListWithPort.map(async (url) => {
      try {
        const response = await fetch(url) // add timeout if supported
        if (response.ok) {
          return url.replace('/health', '') // Only keep base IP:port
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Ignore failed fetch
        return null
      }
      return null
    })
    const results = await Promise.all(fetchPromises.filter(Boolean))
    const ipListWithPortAlive = results.filter(Boolean) as string[]

    if (ipListWithPortAlive.length === 0) {
      return null
    }
    return ipListWithPortAlive[0].replace('http://', '').replace(':8080', '')
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
