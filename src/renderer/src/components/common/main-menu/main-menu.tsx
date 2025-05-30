import { useCallback, useEffect, useState } from 'react'
import {
  Clipboard,
  Copy,
  ArrowClockwise,
  Gear,
  SpinnerGap,
  Check,
  Skull
} from '@phosphor-icons/react'

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
import { createRoomNetwork, initLivekitHealthCheck } from '@renderer/network'
import { STORAGE_SERVER_URL, STORAGE_TOKEN } from '@renderer/lib/constants'
import { faker } from '@faker-js/faker'

export function MainMenu() {
  const [activeTab, setActiveTab] = useState('join')
  const [meetingCode, setMeetingCode] = useState('')
  // const [meetingName, setMeetingName] = useState('')
  const [createCode, setCreateCode] = useState('')

  const [serverUrl] = useLocalStorage(STORAGE_SERVER_URL, 'localhost')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setToken] = useLocalStorage(STORAGE_TOKEN, '')

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

  const handlePaste = async () => {
    // Instead of programmatically accessing clipboard, prompt the user
    const pastedText = await navigator.clipboard.readText()
    setMeetingCode(pastedText)
  }

  const handleCopyCode = async () => {
    const textCopy = createCode
    await navigator.clipboard.writeText(textCopy)
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

  const [serverHealth, setServerHealth] = useState({
    isHealthy: false,
    serverUrl: '',
    loading: true
  })

  useEffect(() => {
    const livekitHealth = initLivekitHealthCheck()
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

  const handleGoToMeeting = useCallback(async () => {
    type ParamsType = {
      roomId: string
      roomName: string
    }
    const params: ParamsType = {
      roomId: meetingCode || createCode,
      roomName: meetingCode || createCode
    }

    try {
      // TODO: create pre-join later
      const res = await createRoomNetwork(
        {
          identity: faker.name.firstName(),
          roomName: meetingCode || 'GLOBALS'
        },
        { serverUrl }
      )
      setToken(res.data.token)
      window.electron.send('show-conference-window', params)
    } catch (err) {
      alert(err)
    }
  }, [createCode, meetingCode, serverUrl, setToken])

  return (
    <>
      <Titlebar title onClose={onCloseWindows} onMinimize={onMinimizeWindows} />
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
          <CardDescription className="text-xs text-muted-foreground flex items-center justify-center">
            <div className="flex items-center gap-x-1">
              <span>Connected to server IP:</span>
              <div className="flex items-center gap-x-0.5">
                <span className="underline">{serverUrl}</span>
                <span>
                  {serverHealth.loading ? (
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
                <Label htmlFor="meeting-code" className="h-4">
                  Meeting Code
                </Label>
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
                <div className="flex items-center justify-between h-4">
                  <Label htmlFor="create-code">Meeting Code</Label>
                  <button
                    onClick={generateRandomCode}
                    className="px-2 text-xs flex items-center cursor-pointer text-right"
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
          <Button className="w-full cursor-pointer" onClick={handleGoToMeeting}>
            {activeTab === 'join' ? 'Join Meeting' : 'Create Meeting'}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
