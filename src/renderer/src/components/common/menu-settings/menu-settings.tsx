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

const MenuSettings = () => {
  const [serverUrl, setServerUrl] = useLocalStorage('serverUrl', 'localhost:7880')
  const [tempServerUrl, setTempServerUrl] = useState(serverUrl)
  const handleClose = () => {
    window.electron.send('close-setting-window')
  }
  const handleSaveServerUrl = () => {
    setServerUrl(tempServerUrl)
    handleClose()
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
            <Label htmlFor="server-url">Server URL</Label>
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
