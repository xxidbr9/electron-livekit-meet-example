import { useState } from 'react'
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

export default function ScreenShare() {
  const [open, setOpen] = useState(true)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [shareAudio, setShareAudio] = useState(false)

  const applications = [
    {
      id: 'app1',
      name: 'Arc picture in picture',
      thumbnail: '/placeholder.svg'
    },
    {
      id: 'app2',
      name: 'brain-storming | Beyond App',
      thumbnail: '/placeholder.svg'
    },
    {
      id: 'app3',
      name: 'VS Code - Project',
      thumbnail: '/placeholder.svg'
    },
    {
      id: 'app4',
      name: 'Terminal',
      thumbnail: '/placeholder.svg'
    }
  ]

  const screens = [
    {
      id: 'screen1',
      name: 'Main Display',
      thumbnail: '/placeholder.svg'
    },
    {
      id: 'screen2',
      name: 'Secondary Display',
      thumbnail: '/placeholder.svg'
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
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

          <TabsContent value="applications" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {applications.map((app) => (
                  <Card
                    key={app.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary',
                      selectedItem === app.id && 'border-primary'
                    )}
                    onClick={() => setSelectedItem(app.id)}
                  >
                    <div className="relative">
                      <img
                        src={app.thumbnail || '/placeholder.svg'}
                        alt={app.name}
                        width={240}
                        height={180}
                        className="w-full h-32 object-cover rounded-t-lg"
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
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="screens" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {screens.map((screen) => (
                  <Card
                    key={screen.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary',
                      selectedItem === screen.id && 'border-primary'
                    )}
                    onClick={() => setSelectedItem(screen.id)}
                  >
                    <div className="relative">
                      <img
                        src={screen.thumbnail || '/placeholder.svg'}
                        alt={screen.name}
                        width={240}
                        height={180}
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
                ))}
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!selectedItem}>Go Live</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
