import  { useState, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import OpenedMessage from '@/components/OpenedMessage'
import GroupOpenedMessage from '@/components/GroupOpenedMessage'
import UserImgWithMessageSkeleton from '@/skeleton/UserImgWithMessageSkeleton'
import messageReducer from '@/pages/messageReducer'
import groupReducer from '@/pages/groupReducer'
import { useLocation, useNavigate, } from 'react-router-dom'
import OpenedMessageSidepanel from '@/components/OpenedMessageSidepanel'
import GroupOpenedMessageSidepanel from '@/components/GroupOpenedMessageSidepanel'
import {screens} from 'tailwindcss/defaultTheme'
import Panel from '@/components/Panel/Panel'
import Drawer from '@/components/Drawer'
import CreateGroup from '@/components/CreateGroup'
import Loading from '@/components/Loading'
import Restriction from '@/components/Restriction'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import useSocket from '@/hooks/useSocket'

const Context = createContext()
export const useMessages = () => useContext(Context)

function Home() {
  const [messagesWithUsers, setMessagesWithUsers] = useReducer(messageReducer, [])
  const [groupMessages, setGroupMessages] = useReducer(groupReducer, [])

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
  const [openedGroupMessages, setOpenedGroupMessages] = useState([])
  const [chatType, setChatType] = useState('regular')
  const [loadingMessage, check] = useMultipleLoading(true, 2)
  const socket = useSocket()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {

    (async () => {

      const getAllMessages = async () => {
        return new Promise((res, rej) => {
          socket.emit('get-all-messages', (err, messages) => {
            if(err) res(false)
            else {
              setMessagesWithUsers({
                type: 'initial',
                data: messages
              })
              res(true)
            }
            check()
          })
        })
      }

      const getAllGroupMessages = async () => {
        return new Promise((res, rej) => {
          socket.emit('get-all-group-messages', (err, messages) => {
            if(!err) {
              setGroupMessages({
                type: 'initial',
                data: messages
              })
              res(true)
            }
            check()
          })
        })
      }
       
      await getAllMessages()
      await getAllGroupMessages()  
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

    socket.on('user-disconnected', (id, active) => {
      setMessagesWithUsers({
        type: 'offline',
        data: {id, active}
      })
    })

    socket.on('deleted-both-messages', (id) => {
      setMessagesWithUsers({
        type: 'remove_my_messages',
        data: id
      })
    })

    socket.on('private-message', message => {
      setMessagesWithUsers({
        type: 'push',
        data: {id: message.from, messages:message}
      })
    })

    socket.on('group-message', message => {
      setGroupMessages({
        type: 'push',
        data: {id: message.to, messages: message}
      })
    })

    socket.on('group-join-accepted', (messages) => {
      console.log('why!')
      setGroupMessages({
        type: 'initial',
        data: messages
      })
    })

    socket.on('group-member-online', (group, id) => {
      setGroupMessages({
        type: 'member-online',
        data: {
          group,
          member: id
        }
      })
    })

    socket.on('group-member-offline', (group, id) => {
      setGroupMessages({
        type: 'member-offline',
        data: {
          group,
          member: id
        }
      })
    })

    socket.on('group-updated', (id, group) => {
      setGroupMessages({
        type: 'update_group',
        data: {
          id,
          group
        }
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

    // socket.emit('join', '628cf5b15596f58f52339575', (err, message) => {
    //   console.log(err, message)
    // })

    return () => {
      socket.removeAllListeners()
    }
  }, [])


  useEffect(() => {
    if(pathname.startsWith('/message')) {
      setChatType('regular')
      setOpenedGroupMessages([])
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

    } else if(pathname.startsWith('/group')) {
      setChatType('group')
      setOpenedMessages([])
      let id = (pathname + '/').match(/\/group\/(.+?)\//)?.[1]
      
      if(!openedGroupMessages.find(el => el.id == id)) {
        setOpenedGroupMessages([
          ...openedGroupMessages.map(el => {
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

      setOpenedGroupMessages([
        ...openedGroupMessages.map(el => {
          if(el.id == id) {
            el.active = true
          } else el.active = false

          return el
        })
      ])
    } else if(pathname == '/') {
      setOpenedMessages([])
      setOpenedGroupMessages([])
      setChatType('regular')
    }
  }, [pathname])
 
  return (
    <Context.Provider value={{
      messagesWithUsers,
      setMessagesWithUsers,
      openedMessages,
      setOpenedGroupMessages,
      typing,
      chatType,
      groupMessages,
      setGroupMessages,
      openedGroupMessages
    }}>
      <main className="max-w-[1366px] relative m-auto h-screen grid grid-cols-12 bg-gradient-to-r bg-white">
        {
          !loadingMessage ?
            <>
              <Panel />
              <div className='fixed z-40 sm:relative sm:col-start-6 sm:col-end-13 md:col-start-5 lg:col-start-4 lg:col-end-10'>
                <OpenedMessage />
                <GroupOpenedMessage />
              </div>
              <OpenedMessageSidepanel />
              <GroupOpenedMessageSidepanel />
            </>
          : <Loading />
        }
      </main>
    </Context.Provider>
  )
}

export default Home