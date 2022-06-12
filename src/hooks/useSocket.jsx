import { io } from 'socket.io-client'
import { useStore } from '@/store/store'

let socket

function useSocket() {
  const { auth } = useStore()

  if(!socket) {
    socket = io(location.origin.replace(/:(\d+)$/, ':3001'), {
      auth: {
        accessToken: auth.accessToken
      },
      // transports: ['websocket', 'polling']
    })

    socket.on('disconnect', (ev) =>{
      console.log(ev)
      console.log('%cdisconnected', 'font-size: 20px; color: red')
    }) 
  }
  
  return socket
}

export default useSocket