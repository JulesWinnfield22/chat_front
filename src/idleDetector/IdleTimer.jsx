import { IdleTimerProvider } from 'react-idle-timer'
import useSocket from '@/hooks/useSocket'

function IdleTimer({ children }) {
  const socket = useSocket()

  const onIdle = () => {
    socket.emit('idle')
    console.log(`%cidle`, 'color: green; font-size: 15px')
  }

  const onActive = () => {
    console.log(`%cactive`, 'color: green; font-size: 15px')
  }

  const onAction = () => {
    socket.emit('activity')
    console.log(`%caction`, 'color: green; font-size: 15px')
  }

  return (
    <IdleTimerProvider
      timeout={1000 * 60}
      onIdle={onIdle}
      onActive={onActive}
      onAction={onAction}
      throttle={1000 * 30}
    >
      {
        children
      }
    </IdleTimerProvider>
  )
}

export default IdleTimer