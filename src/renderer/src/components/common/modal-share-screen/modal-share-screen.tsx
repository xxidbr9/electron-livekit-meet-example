// import { useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Switch } from '@renderer/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Label } from '@renderer/components/ui/label'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useEffect, useRef, useState } from 'react'
import placeholderImage from '@/assets/images/screen_placeholder.svg'

const isPathLike = (name: string) => {
  // A simple check for Windows-style file paths
  return /[a-zA-Z]:\\/.test(name) || name.endsWith('.ini') || name.endsWith('.exe')
}

export type DesktopSourceDTO = {
  id: string
  name: string
  thumbnail: string // base64 data URL
  appIcon: string | null // base64 data URL or null
}

type ModalShareScreenProps = {
  open: boolean
  onClose: () => void
  onSelectedItem: (item: string | null) => void
  selectedItem: string | null
  shareAudio: boolean
  setShareAudio: (shareAudio: boolean) => void
}

export function ModalShareScreen({
  onClose,
  open,
  onSelectedItem,
  selectedItem,
  setShareAudio,
  shareAudio
}: ModalShareScreenProps) {
  const [applications, setApplications] = useState<DesktopSourceDTO[]>([])
  const [screens, setScreens] = useState<DesktopSourceDTO[]>([])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  const getDisplayMedia = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (_resolve, reject) => {
      const has_access = await window.electron.getScreenAccess()
      if (!has_access) {
        return reject('none')
      }

      try {
        const sources = await window.electron.getScreenSources()
        const screens: DesktopSourceDTO[] = []
        const apps: DesktopSourceDTO[] = []

        sources.forEach((source) => {
          const newSource: DesktopSourceDTO = source as unknown as DesktopSourceDTO
          if (source.id.startsWith('screen:')) {
            screens.push(newSource)
          } else if (source.id.startsWith('window:') && !isPathLike(source.name)) {
            apps.push(newSource)
          }
        })
        console.log(sources)

        setScreens(screens)
        setApplications(apps)

        // screenPickerShow(sources, async (id) => {
        //   try {
        //     const source = sources.find(source => source.id === id);
        //     if (!source) {
        //       return reject('none');
        //     }

        //     const stream = await window.navigator.mediaDevices.getUserMedia({
        //       audio: false,
        //       video: {
        //         mandatory: {
        //           chromeMediaSource: 'desktop',
        //           chromeMediaSourceId: source.id
        //         }
        //       }
        //     });
        //     resolve(stream);
        //   }
        //   catch (err) {
        //     reject(err);
        //   }
        // }, {});
      } catch (err) {
        reject(err)
      }
    })
  }

  const getCapturerDevice = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoDevices = devices.filter((d) => d.kind === 'videoinput')
    setDevices(videoDevices)
  }
  useEffect(() => {
    getDisplayMedia()
    getCapturerDevice()
  }, [])

  const [tabNow, setTabNow] = useState<'applications' | 'screens' | 'capture' | string>(
    'applications'
  )
  const videoAppRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const videoScreenRefs = useRef<Record<string, HTMLVideoElement | null>>({})


  useEffect(() => {
    const setupAppStreams = async () => {
      for (const source of applications) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id,
                maxWidth: 854,
                maxHeight: 480
              }
            } as unknown as MediaTrackConstraints
          })

          const videoElement = videoAppRefs.current[source.id]
          if (videoElement) {
            videoElement.srcObject = stream
            videoElement.onloadedmetadata = () => {
              videoElement?.play()
            }
          }
        } catch (err) {
          console.error(`Failed to get stream for ${source.name}`, err)
        }
      }
    }
    const setupScreenStreams = async () => {
      for (const source of screens) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id,
                maxWidth: 854,
                maxHeight: 480
              }
            } as unknown as MediaTrackConstraints
          })

          const videoElement = videoScreenRefs.current[source.id]
          if (videoElement) {
            videoElement.srcObject = stream
            videoElement.onloadedmetadata = () => {
              videoElement?.play()
            }
          }
        } catch (err) {
          console.error(`Failed to get stream for ${source.name}`, err)
        }
      }
    }
    if (open && tabNow === 'applications') setupAppStreams()
    else if (open && tabNow === 'screens') setupScreenStreams()
  }, [applications, open, screens, tabNow])

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Screen Share</DialogTitle>
          <DialogDescription>
            Select something to stream and have your friends grab a seat!
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tabNow}
          defaultValue="applications"
          className="w-full"
          onValueChange={setTabNow}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="screens">Screens</TabsTrigger>
            <TabsTrigger value="capture">Capture Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-2">
            {applications.length <= 0 && (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No Application found
              </div>
            )}
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {applications.map(
                  (app) =>
                    app.thumbnail && (
                      <Card
                        key={app.id}
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary py-0 overflow-hidden gap-0 rounded-md',
                          selectedItem === app.id && 'border-primary'
                        )}
                        onClick={() => onSelectedItem(app.id)}
                      >
                        <div className="relative">
                          {/* <img
                            src={app.thumbnail}
                            alt={app.name}
                            className="w-full h-32 object-cover"
                          /> */}
                          <video
                            ref={(el) =>
                              (videoAppRefs.current[app.id] = el) as unknown as undefined
                            }
                            autoPlay
                            muted
                            className="w-full h-32 object-cover bg-black"
                          />
                          {selectedItem === app.id && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm truncate">{app.name}</p>
                        </CardContent>
                      </Card>
                    )
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="screens" className="mt-2">
            {screens.length <= 0 && (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No Screen found
              </div>
            )}
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {screens.map(
                  (screen) =>
                    screen.thumbnail && (
                      <Card
                        key={screen.id}
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary py-0 overflow-hidden gap-0 rounded-md',
                          selectedItem === screen.id && 'border-primary'
                        )}
                        onClick={() => onSelectedItem(screen.id)}
                      >
                        <div className="relative">
                          {/* <img
                            src={screen.thumbnail || '/placeholder.svg'}
                            alt={screen.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                          /> */}
                          <video
                            ref={(el) =>
                              (videoScreenRefs.current[screen.id] = el) as unknown as undefined
                            }
                            autoPlay
                            muted
                            className="w-full h-32 object-cover bg-black"
                          />
                          {selectedItem === screen.id && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm truncate">{screen.name}</p>
                        </CardContent>
                      </Card>
                    )
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="capture" className="mt-2">
            {devices.length <= 0 && (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No capture devices found
              </div>
            )}
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {devices.map((device) => (
                  <Card
                    key={device.deviceId}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary py-0 overflow-hidden gap-0 rounded-md',
                      selectedItem === device.deviceId && 'border-primary'
                    )}
                    onClick={() => onSelectedItem(device.deviceId)}
                  >
                    <div className="relative">
                      <img
                        src={placeholderImage}
                        alt={device.label}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      {device.deviceId === selectedItem && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm truncate">{device.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch id="share-audio" checked={shareAudio} onCheckedChange={setShareAudio} />
            <Label htmlFor="share-audio">Share audio</Label>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!selectedItem}>Go Live</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
