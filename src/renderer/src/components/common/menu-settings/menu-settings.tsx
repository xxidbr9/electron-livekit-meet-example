import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { useLocalStorage } from '@renderer/hooks'
import { useState } from 'react'
import { Titlebar } from '../titlebar'
import { ArrowClockwise } from '@phosphor-icons/react'

const MenuSettings = () => {
  const [serverUrl, setServerUrl] = useLocalStorage('serverUrl', 'localhost')
  const [tempServerUrl, setTempServerUrl] = useState(serverUrl)
  const handleClose = () => {
    window.electron.send('close-setting-window')
  }
  const handleSaveServerUrl = () => {
    setServerUrl(tempServerUrl)
    handleClose()
  }

  const [isLoading, setIsLoading] = useState(false)
  const handleScanServerIP = async () => {
    setIsLoading(true)
    const serverIP = await window.electron.scanForServerIP()
    setTempServerUrl(serverIP)
    setIsLoading(false)
  }
  return (
    <>
      <Titlebar onClose={handleClose} />
      <Card className="shadow-none border-0 py-0">
        <CardContent>
          <CardHeader className="px-0">
            <CardTitle>Change Server URL</CardTitle>
            <CardDescription>Enter the new server URL for your meetings.</CardDescription>
          </CardHeader>
          <div className="py-4">
            <div className="flex items-center justify-between h-4">
              <Label htmlFor="create-code">Insert IP</Label>
              <button
                onClick={handleScanServerIP}
                className="px-2 text-xs flex items-center cursor-pointer text-right"
              >
                {isLoading && <ArrowClockwise className="mr-1 h-3 w-3 animate-spin" />}
                Scan IP
              </button>
            </div>
            <Input
              id="server-url"
              value={tempServerUrl}
              onChange={(e) => setTempServerUrl(e.target.value)}
              placeholder="localhost:7880"
              className="mt-2"
            />
          </div>
          <CardFooter className="flex gap-x-4 px-0 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveServerUrl}>Save Changes</Button>
          </CardFooter>
        </CardContent>
      </Card>
    </>
  )
}

export { MenuSettings }
