import { useEffect, useState } from 'react'
import { Clipboard, Copy, ArrowClockwise, Gear, SpinnerGap, Check, Skull } from '@phosphor-icons/react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { useLocalStorage } from '@renderer/hooks'
import { Titlebar } from '../titlebar'
import { initLivekitHealthCheck } from '@renderer/network'

export function MainMenu() {
  const [activeTab, setActiveTab] = useState('join')
  const [meetingCode, setMeetingCode] = useState('')
  // const [meetingName, setMeetingName] = useState('')
  const [createCode, setCreateCode] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [serverUrl] = useLocalStorage('serverUrl', 'localhost:7880')

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 7; i++) {
      if (i === 3) {
        result += '-'
      } else {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
      }
    }
    setCreateCode(result)
  }

  const handlePaste = () => {
    // Instead of programmatically accessing clipboard, prompt the user
    alert('Please use Ctrl+V / Cmd+V to paste the meeting code into the input field')
  }

  const handleCopyCode = () => {
    // Instead of programmatically copying to clipboard, prompt the user
    alert('Please use Ctrl+C / Cmd+C to copy the meeting code to your clipboard')
  }

  const handleSettingShow = () => {
    // Instead of showing a settings window, prompt the user
    window.electron.send('show-setting-window')
  }

  const onCloseWindows = () => {
    window.electron.send('close-app')
  }
  const onMinimizeWindows = () => {
    window.electron.send('minimize-app')
  }

  const [serverHealth, setServerHealth] = useState({ isHealthy: false, serverUrl: '' })
  const [isCheckLoading, setIsCheckLoading] = useState(false)

  useEffect(() => {
    const livekitHealth = initLivekitHealthCheck()
    setIsCheckLoading(true)
    // Get initial health status
    setServerHealth(livekitHealth.getHealth())

    // Set up interval to check health periodically in the component
    const healthCheckInterval = setInterval(() => {
      setServerHealth(livekitHealth.getHealth())
    }, 1000) // Update UI every 1 seconds

    // Clean up interval when component unmounts
    return () => {
      clearInterval(healthCheckInterval)
    }
  }, [])

  useEffect(() => {
    if (serverHealth.isHealthy) {
      setIsCheckLoading(false)
    }
  }, [serverHealth.isHealthy])
  return (
    <>
      <Titlebar title="Electron Livekit" onClose={onCloseWindows} onMinimize={onMinimizeWindows} />
      <Card className="w-full max-w border-0 shadow-none">
        <CardHeader className="text-center select-none">
          <div className="absolute right-6 top-16">
            <Button variant="outline" size="icon" onClick={handleSettingShow}>
              <Gear className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">Meeting App</CardTitle>
          <CardDescription>Join or create a meeting</CardDescription>
          <CardDescription className="text-xs mt-1 text-muted-foreground flex items-center justify-center">
            <div className="flex items-center gap-x-1">
              <span>Connected to:</span>
              <div className="flex items-center gap-x-0.5">
                <span className="underline">{serverUrl}</span>
                <span>
                  {isCheckLoading ? (
                    <SpinnerGap className="animate-spin" />
                  ) : serverHealth.isHealthy ? (
                    <Check />
                  ) : (
                    <Skull />
                  )}
                </span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">Join Meeting</TabsTrigger>
              <TabsTrigger value="create">Create Meeting</TabsTrigger>
            </TabsList>
            <TabsContent value="join" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-code">Meeting Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="meeting-code"
                    placeholder="Enter meeting code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="create" className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="create-code">Meeting Code</Label>
                  <button
                    onClick={generateRandomCode}
                    className="h-2 px-2 text-xs flex items-center cursor-pointer"
                  >
                    <ArrowClockwise className="mr-1 h-3 w-3" />
                    Generate
                  </button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    id="create-code"
                    placeholder="Enter or generate code"
                    value={createCode}
                    onChange={(e) => setCreateCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full cursor-pointer"
            onClick={() =>
              console.log('Join or create meeting with code:', meetingCode || createCode)
            }
          >
            {activeTab === 'join' ? 'Join Meeting' : 'Create Meeting'}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
