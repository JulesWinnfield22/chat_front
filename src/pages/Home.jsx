import  { useState, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import OpenedMessage from '@/components/OpenedMessage'
import UserImgWithMessageSkeleton from '@/skeleton/UserImgWithMessageSkeleton'
import messageReducer from '@/pages/messageReducer'
import { useLocation, useNavigate, } from 'react-router-dom'
import OpenedMessageSidepanel from '@/components/OpenedMessageSidepanel'
import {screens} from 'tailwindcss/defaultTheme'
import Panel from '@/components/Panel'
import Drawer from '@/components/Drawer'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import useSocket from '@/hooks/useSocket'

const Context = createContext()
export const useMessages = () => useContext(Context)

function Home() {
  const [messagesWithUsers, setMessagesWithUsers] = useReducer(messageReducer, [])
  const [typing, setTyping] = useReducer((state, payload) => {
    switch(payload.type) {
      case 'typing':  
        return !state?.includes(payload.data) ?
          [...state, payload.data]
          : state
      case 'done_typing':
        return state?.includes(payload.data) ? 
          state.filter(el => el != payload.data)
          : state
      default:
        return state
    }
  }, [])

  const [openedMessages, setOpenedMessages] = useState([])
  const [loadingMessage, check] = useMultipleLoading(true, 2)
  const socket = useSocket()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {

    (async () => {

      const getAllMessages = async () => {
        return new Promise((res, rej) => {
          socket.emit('get-all-messages', (err, messages) => {
            console.log(err, 'err')
            if(err) res(false)
            else {
              setMessagesWithUsers({
                type: 'initial',
                data: messages
              })
              res(true)
              check()
            }
          })
        })
      }
       
      await getAllMessages()
      
      socket.emit('online-users', (err, users) => {
        if(err) console.log(err)
        else {
          setMessagesWithUsers({
            type: 'create',
            data: users
          })
          check()
        }
      })
  
    })()
    
    socket.on('new-user-connected', (user) => {
      setMessagesWithUsers({
        type: 'create',
        data: user
      })
    })

    socket.on('connect_error', (err) => {
      console.log(err)
    })
    
    socket.on('typing', id => {
      setTyping({
        type: 'typing',
        data: id
      })
    })

    socket.on('done_typing', id => {
      setTyping({
        type: 'done_typing',
        data: id
      })
    })

    socket.on('user-disconnected', id => {
      setMessagesWithUsers({
        type: 'offline',
        data: id
      })
    })

    socket.on('private-message', message => {
      setMessagesWithUsers({
        type: 'push',
        data: {id: message.from, messages:message}
      })
    })

    socket.on('seen', (id, createdAt) => {
      setMessagesWithUsers({
        type: 'update_seen',
        data: {
          id,
          createdAt,
          confirmation: true
        }
      })
    })

    return () => {
      socket.removeAllListeners()
    }
  }, [])


  useEffect(() => {
    if(pathname.startsWith('/message')) {
      
      let id = (pathname + '/').match(/\/message\/(.+?)\//)?.[1]

      if(!openedMessages.find(el => el.id == id)) {
        setOpenedMessages([
          ...openedMessages.map(el => {
            el.active = false
            return el
          }),
          {
            active: true,
            id
          }
        ])
        return
      }

      setOpenedMessages([
        ...openedMessages.map(el => {
          if(el.id == id) {
            el.active = true
          } else el.active = false

          return el
        })
      ])

    } else if(pathname == '/') {
      setOpenedMessages([])
    }
  }, [pathname])

  const togglePanel = useCallback(() => {
    if(window.innerWidth < parseInt(screens.lg)) {
      navigate('/info')
    }
  }, [])

  const toggleMessage = useCallback(() => {
    setOpenedMessages([
      ...openedMessages.map(el => {
        el.active = false
        return el
      })
    ])
    navigate(-1)
  }, [])

  return (
    <Context.Provider value={{
      messagesWithUsers,
      setMessagesWithUsers,
      openedMessages,
      typing
    }}>
      <main className="max-w-[1366px] relative m-auto h-screen grid grid-cols-12 bg-gradient-to-r">
        {
          !loadingMessage ?
            <>
              <Panel />
              <OpenedMessage back={toggleMessage} togglePanel={togglePanel} />
              <OpenedMessageSidepanel />
            </>
          : 'loading'
        }
        {
          <Drawer />
        }
      </main>
    </Context.Provider>
  )
}

export default Home