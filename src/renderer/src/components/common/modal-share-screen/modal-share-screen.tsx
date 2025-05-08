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
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    getDisplayMedia()
  }, [])

  // const applications = [
  //   {
  //     id: 'app1',
  //     name: 'Arc picture in picture',
  //     thumbnail: '/placeholder.svg'
  //   },
  //   {
  //     id: 'app2',
  //     name: 'brain-storming | Beyond App',
  //     thumbnail: '/placeholder.svg'
  //   },
  //   {
  //     id: 'app3',
  //     name: 'VS Code - Project',
  //     thumbnail: '/placeholder.svg'
  //   },
  //   {
  //     id: 'app4',
  //     name: 'Terminal',
  //     thumbnail: '/placeholder.svg'
  //   }
  // ]

  // const screens = [
  //   {
  //     id: 'screen1',
  //     name: 'Main Display',
  //     thumbnail: '/placeholder.svg'
  //   },
  //   {
  //     id: 'screen2',
  //     name: 'Secondary Display',
  //     thumbnail: '/placeholder.svg'
  //   }
  // ]

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Screen Share</DialogTitle>
          <DialogDescription>
            Select something to stream and have your friends grab a seat!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="screens">Screens</TabsTrigger>
            <TabsTrigger value="capture">Capture Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-2">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {applications.map(
                  (app) =>
                    app.thumbnail && (
                      <Card
                        key={app.id}
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary py-0 overflow-hidden gap-0',
                          selectedItem === app.id && 'border-primary'
                        )}
                        onClick={() => onSelectedItem(app.id)}
                      >
                        <div className="relative">
                          <img
                            src={app.thumbnail}
                            alt={app.name}
                            className="w-full h-32 object-cover"
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

          <TabsContent value="screens" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {screens.map(
                  (screen) =>
                    screen.thumbnail && (
                      <Card
                        key={screen.id}
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary py-0 overflow-hidden gap-0',
                          selectedItem === screen.id && 'border-primary'
                        )}
                        onClick={() => onSelectedItem(screen.id)}
                      >
                        <div className="relative">
                          <img
                            src={screen.thumbnail || '/placeholder.svg'}
                            alt={screen.name}
                            className="w-full h-32 object-cover rounded-t-lg"
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

          <TabsContent value="capture" className="mt-4">
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No capture devices found
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch id="share-audio" checked={shareAudio} onCheckedChange={setShareAudio} />
            <Label htmlFor="share-audio">Share system audio</Label>
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
