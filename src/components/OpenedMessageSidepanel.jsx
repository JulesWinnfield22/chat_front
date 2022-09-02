import {memo, useEffect, useRef, useMemo, useState} from 'react'
import { useLocation, useNavigate, } from 'react-router-dom'
import UserImage from '@/components/UserImage.jsx'
import Ripple from '@/components/Ripple/Ripple'
import SharedMedia from '@/components/SharedMedia'
import MessageDropdown from '@/components/MessageDropdown'
import useSocket from '@/hooks/useSocket'
import {useStore} from '@/store/store'
import { useMessages } from '@/pages/Home'
import {screens} from 'tailwindcss/defaultTheme'
import { CgArrowLeft, CgChevronDoubleDown } from 'react-icons/cg'

function Toggle({ handler, value = false, className}) {
  return (
    <button onClick={() => {
      handler(value)
    }} className={`${value ? 'bg-teal-700' : 'bg-gray-800'} transition-all duration-300 ease-in relative h-4 w-8 rounded-full`}>
      <span style={{backgroundColor: '#138666'}} className={`${value ? 'left-full' : 'left-0'} transition-all duration-300 ease-in absolute h-[1.2rem] -translate-x-1/2 -translate-y-1/2 flex w-[1.2rem] rounded-full shadow-toggle`}>
      </span>
    </button>
  )
}

function OpenedMessageSidepanel() {
  const [showSidePanel, setShowSidePanel] = useState(false)
  
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { openedMessages, messagesWithUsers, chatType } = useMessages()

  useEffect(() => {
    const observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        const width = entry.contentRect.width
        if(pathname == '/info' && width > parseInt(screens.lg)) {
          navigate(-1)
          setShowSidePanel(false)
        } else if(pathname == '/info' && width < parseInt(screens.lg)) {
          setShowSidePanel(true)
        } else {
          setShowSidePanel(false)
        }
        // if(width)
      })
    })

    observer.observe(document.body)
    return () => {
      observer.unobserve(document.body)
    }
  }, [pathname])

  function clickHandler(ev) {
    if(ev.target.className.includes('bg-click')) {
      navigate(-1)
    }
  }

  return (
    <div onClick={clickHandler} className={`${chatType == 'regular' ? 'z-50' : 'z-40 hidden'} ${showSidePanel ? 'left-0' : 'left-full'}  bg-click fixed w-full h-screen top-0 lg:left-0 lg:h-full lg:relative col-start-10 col-end-13 bg-black/30 lg:bg-white`}>
      {
        openedMessages.map(item => {
          return (
            <View user={(messagesWithUsers.find(el => el.id == item.id))?.user} active={item.active} key={item.id} />
          )
        })
      }
    </div> 
  )
}

function View({ user, active }) {
  const { auth, setAuth } = useStore()
  const socket = useSocket()
  const navigate = useNavigate()

  return (
    <div className={`${active ? 'z-20' : 'z-10'} border-0 lg:border-l border-gray-800/40 absolute absolute-center w-full sm:max-w-[22rem] sm:w-[22rem] flex flex-col gap-2 items-center lg:w-full h-full overflow-y-auto bg-white`}>
      <div className='w-full bg-white flex flex-col justify-center items-center'>
        <div className='lg:hidden bg-gray-900 lg:bg-transparent lg:text-gray-900 text-gray-400 w-full h-12 flex items-center justify-between'>
          <Ripple onClick={() => navigate(-1)} className='h-10 w-10 flex-center rounded-full'>
            <CgArrowLeft />
          </Ripple>
          <p className='uppercase'>{user.firstName} {user.lastName}</p>
          <MessageDropdown user={user} />
        </div>
        <div className='bg-gray-900 lg:bg-transparent flex w-full px-2 gap-2'>
          <UserImage className='bg-transparent shadow-none' id={user._id} src={user?.profile} size='xl' />
          <div className='flex-1 flex flex-col justify-end w-full pb-3'>
            <span className='text-lg font-bold text-sky-500'>{user?.username}</span>
            <p className='text-sm leading-none text-gray-300 lg:text-gray-500 w-full'>a very fun guy</p>
          </div>
        </div>
        <div className='pr-4 border-y border-gray-300/20 lg:border-gray-300/50 bg-gray-900 lg:bg-transparent flex justify-between p-2 w-full items-center'>
          <span className='text-sm font-medium text-gray-300 lg:text-gray-900'>Add to Fevourites</span>
          <Toggle value={auth?.user?.fevourites?.includes(user._id)} handler={(value) => {
            socket.emit('fevourite', user._id, (err, res) => {
              if(!err) {
                setAuth({
                  type: 'update',
                  data: {
                    name: 'fevourites',
                    value: res
                  }
                })
              }
            })
          }}></Toggle>
        </div>
      </div>
     <SharedMedia className='border-0' />
    </div>
  )
}

export default memo(OpenedMessageSidepanel)