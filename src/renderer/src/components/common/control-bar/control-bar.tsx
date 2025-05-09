import React, { useEffect, useState } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import {
  Icon,
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
  MonitorArrowUp,
  Gear,
  PhoneX,
  ChatDots,
} from '@phosphor-icons/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@renderer/lib/utils'

const controlBarVariants = cva(
  'absolute w-full bottom-0 flex items-center justify-between px-4 py-2 bg-base-background border-t',
  {
    variants: {
      variant: {
        default: ''
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface ControlBarProps extends VariantProps<typeof controlBarVariants> {
  totalOnline?: number
  onExit?: () => void
  onShareScreenClick?: () => void
  onSettingClick?: () => void
}

const ControlBar = ({ variant, totalOnline, ...props }: ControlBarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [localeTime] = useState<string>('en-US')
  const [isOnlineListOpen, setIsOnlineListOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const formattedTime = currentTime.toLocaleTimeString(localeTime, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const formattedDate = currentTime.toLocaleDateString(localeTime, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Mock online users data
  const onlineUsers = [
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Charlie Brown' }
    // ... add more users as needed
  ]

  return (
    <div className={cn(controlBarVariants({ variant }))}>
      <div className="text-sm font-semibold text-muted-foreground w-52 flex h-8 items-center gap-x-2">
        <span className="w-14">{formattedTime}</span>
        <Separator orientation="vertical" />
        <span className="flex-1 w-full">{formattedDate}</span>
      </div>

      <div className="flex items-center gap-2 justify-center">
        <ActionItem active icon={Microphone} deactiveIcon={MicrophoneSlash} tooltip={'Mic'} />
        {/* TODO: output always active so it will be removed in production, use setting or mic setting popup for changing the output */}
        {/* <ActionItem icon={Headphones} deactiveIcon={HeadphoneOff} tooltip={t('audio')} /> */}
        <ActionItem icon={VideoCamera} deactiveIcon={VideoCameraSlash} tooltip={'Camera'} />
        <ActionItem
          icon={MonitorArrowUp}
          deactiveIcon={MonitorArrowUp}
          tooltip={'Share Screen'}
          onClick={props.onShareScreenClick}
        />
        {/* TODO: bellow this can't be active or deactive */}
        {/* TODO: record will have change to other component with timer and end record icon */}
        <ActionItem icon={Gear} tooltip={'Setting'} onClick={props.onSettingClick}/>
        <Button
          onClick={props.onExit}
          variant="destructive"
          className="rounded-full cursor-pointer"
          size="sm"
        >
          <PhoneX className="h-4 w-4" />
          End Call
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm w-52 justify-end">
        <Popover open={isOnlineListOpen} onOpenChange={setIsOnlineListOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 p-2 font-medium">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <span>{totalOnline} Online</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <h3 className="font-semibold">{'Online User'}</h3>
              {onlineUsers.map((user) => (
                <div key={user.id} className="text-sm">
                  {user.name}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" className="flex items-center gap-2 font-medium">
          <ChatDots className="h-4 w-4" />
          Chat
        </Button>
      </div>
    </div>
  )
}
export { ControlBar }

/* INFO
- [ ] add variant dropdown for handle switching for example for camera or mic picker
  - [ ] add title bar for example `Input Device or Output Device == like Discord`
  - [ ] add preview camera
- [ ] add volume if it a mic or audio output
- [ ] add tester for input or output
*/
type ActionItemProps = {
  children?: React.ReactNode
  onClick?: () => void
  suffix?: React.ReactNode
  tooltip?: string
  icon?: Icon
  deactiveIcon?: Icon
  // TODO: handle active toggle
  active?: boolean
}
// TODO: handle prefix for setting menu dropdown
const ActionItem = ({ onClick, tooltip, icon, active, deactiveIcon }: ActionItemProps) => {
  const Icon = active ? deactiveIcon : icon
  const BasedItem = () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'destructive' : 'outline'}
          size="icon"
          className="rounded-full"
          onClick={onClick}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )

  return <BasedItem />
}
