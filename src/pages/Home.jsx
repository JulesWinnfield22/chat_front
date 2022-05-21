import  { useState, useMemo, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import { CgMenuLeft, CgSearch, CgLogOut } from 'react-icons/cg'
import { FcSettings } from 'react-icons/fc'
import { FaSignOutAlt, FaCogs } from 'react-icons/fa'
import UserImgWithMessage from '@/components/UserImgWithMessage'
import OpenedMessage from '@/components/OpenedMessage'
import UserImgWithMessageSkeleton from '@/skeleton/UserImgWithMessageSkeleton'
import messageReducer from '@/pages/messageReducer'
import { useStore } from '@/store/store'
import { useLocation, useNavigate, } from 'react-router-dom'
import OpenedMessageSidepanel from '@/components/OpenedMessageSidepanel'
import {screens} from 'tailwindcss/defaultTheme'
import Ripple from '@/components/Ripple/Ripple'
import UserImage from '@/components/UserImage'
import Panel from '@/components/Panel'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import useSocket from '@/hooks/useSocket'
import axios from "@/api/axios"

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
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showMessage, setShowMessage] = useState('')
  const { auth, setAuth } = useStore()
  const [showDrawer, setShowDrawer] = useState(false)
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

      if(!pathname.endsWith('/info')) {
        setShowSidePanel(false)
      } else {
        setShowSidePanel(true)
      }
      
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

      setShowMessage('left-0')
    } else if(pathname == '/') {
      if(window.innerWidth > parseInt(screens.lg)) {
        if(openedMessages.length) {
          setOpenedMessages([])
        }
      } else {
        setShowMessage('left-full hidden')
      }
    }

    if(pathname.includes('drawer')) {
      setShowDrawer(true)
    } else {
      setShowDrawer(false)
    }
  }, [pathname])

  const togglePanel = useCallback(() => {
    if(window.innerWidth < parseInt(screens.lg)) {
      navigate(pathname+'/info')
      setShowSidePanel(!showSidePanel)
    }
  }, [showSidePanel, pathname])

  const toggleMessage = useCallback(() => {
    setOpenedMessages([
      ...openedMessages.map(el => {
        el.active = false
        return el
      })
    ])
    setShowMessage('left-full hidden')
    navigate(-1)
  }, [])

  useEffect(() => {
    let observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        const width = entry.contentRect.width
        if(width < parseInt(screens.sm) && openedMessages.length && pathname.startsWith('/message')) {
          setShowMessage('left-0')
        } else if(width > parseInt(screens.sm) && pathname.startsWith('/message')) {
          setShowMessage('left-0')
        } else if(width < parseInt(screens.sm)) {
          setShowMessage('left-full hidden')
        }

        if(pathname == '/' && width > parseInt(screens.sm)) {
          if(openedMessages.length) {
            setOpenedMessages([])
          }
        }

        if(pathname.endsWith('/info') && width > parseInt(screens.lg)) {
          navigate(-1)
        }

        const lastWindowWith = parseInt(sessionStorage.getItem('fl_window_width'))
        if(pathname == '/drawer' && lastWindowWith < width && width > parseInt(screens.lg)) {
          if(openedMessages.length) {
            setOpenedMessages([])
          }
        }

        sessionStorage.setItem('fl_window_width', width)
      })
    })

    observer.observe(document.body)

    return () => {
      observer.unobserve(document.body)
    }
  }, [pathname, openedMessages])

  async function logout() {
    try {
      await axios({
        url: '/c/lt',
        method: 'post',
        withCredentials: true,
      })

      location = location.origin + '/login'
      // socket.disconnect()
      // // socket.close()
      
      // navigate('/login', {
      //   state: {
      //     type: 'logout'
      //   }
      // })   
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <Context.Provider value={{
      messagesWithUsers,
      setMessagesWithUsers,
      openedMessages,
      typing,
      showMessage
    }}>
      <main className="max-w-[1366px] relative m-auto h-screen grid grid-cols-12 bg-gradient-to-r">
        {
          !loadingMessage ?
            <Panel />
          : <UserImgWithMessageSkeleton />
        }
        <div className={`${showMessage} z-40 w-full h-full bg-white fixed top-0 sm:relative sm:col-start-6 sm:col-end-13 md:col-start-5 lg:col-start-4 lg:col-end-10`}>
          {
            !loadingMessage ?
            openedMessages.map(item => {
              return <OpenedMessage back={toggleMessage} togglePanel={togglePanel} messageId={item.id} active={item.active} key={item.id} />
            }) : ''
          }
        </div>
        <div onClick={() => navigate(-1)} className={`${showSidePanel ? 'left-0' : 'left-full'} fixed w-full h-screen top-0 lg:left-0 lg:h-full z-50 lg:relative col-start-10 col-end-13 bg-black/30 lg:bg-transparent lg:bg-gradient-to-r lg:from-white lg:via-black/10 lg:to-black/20`}>
          {
            !loadingMessage ?
            openedMessages.map(item => {
              return (
                <OpenedMessageSidepanel user={(messagesWithUsers.find(el => el.id == item.id))?.user} active={item.active} key={item.id} />
              )
            }) : ''
          }
        </div>
        {
          showDrawer &&
          <div onClick={() => navigate(-1)} className='fixed z-50 top-0 left-0 h-screen w-full bg-black/50'>
            <div onClick={(ev) => ev.stopPropagation()} className='h-full overflow-y-auto w-80 bg-gray-800 flex flex-col'>
              <div className='p-2 flex gap-1 bg-black/50'>
                <UserImage id={auth.user._id} size='2xl' className='bg-transparent' />
                <div className='p-4 flex-1 text-gray-300 text-sm font-semibold flex flex-col justify-end'>
                  <p>{ auth.user.firstName } { auth.user.lastName }</p>
                  <p className='text-sky-500'>{ auth.user.username }</p>
                </div>
              </div>
              <Ripple color='#ddd8' type='div' className='mt-1 gap-2 hover:bg-black/50 cursor-pointer p-2 text-base font-semibold text-gray-300 flex items-center'>  
                <FaCogs className='text-2xl' />
                Settings
              </Ripple>
              <Ripple onClick={logout} color='#ddd8' type='div' className='mt-1 gap-2 hover:bg-black/50 cursor-pointer p-2 text-base font-semibold text-gray-300 flex items-center'>  
                <FaSignOutAlt className='text-xl text-red-500' />
                Logout
              </Ripple>
            </div>
          </div>
        }
      </main>
    </Context.Provider>
  )
}

export default Home