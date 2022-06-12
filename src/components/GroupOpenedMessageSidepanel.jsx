import {memo, useEffect, useRef, useMemo, useState} from 'react'
import { FaStar } from 'react-icons/fa'
import { useLocation, useNavigate, } from 'react-router-dom'
import UserImage from '@/components/UserImage.jsx'
import Ripple from '@/components/Ripple/Ripple'
import { LoadingElli } from '@/components/Loading'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import SharedMedia from '@/components/SharedMedia'

import useSocket from '@/hooks/useSocket'
import {useStore} from '@/store/store'
import { useMessages } from '@/pages/Home'
import {screens} from 'tailwindcss/defaultTheme'

function GroupOpenedMessageSidepanel() {
  const [showSidePanel, setShowSidePanel] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { openedGroupMessages, groupMessages, chatType } = useMessages()

  useEffect(() => {
    const observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        const width = entry.contentRect.width
        if(pathname == '/infogroup' && width > parseInt(screens.lg)) {
          navigate(-1)
          setShowSidePanel(false)
        } else if(pathname == '/infogroup' && width < parseInt(screens.lg)) {
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

  return (
    <div onClick={() => navigate(-1)} className={`${chatType == 'group' ? 'z-50' : 'z-40 hidden'} ${showSidePanel ? 'left-0' : 'left-full'} fixed w-full h-screen top-0 lg:left-0 lg:h-full lg:relative col-start-10 col-end-13 sm:bg-black/30 bg-white`}>
      {
        openedGroupMessages.map(item => {
          return (
            <View group={groupMessages.find(el => el.group._id == item.id)} active={item.active} key={item.id} />
          )
        })
      }
    </div> 
  )
}

function View({ group, active }) {
  const { auth } = useStore()
  const { openedGroupMessages, groupMessages, setGroupMessages } = useMessages()

  const  getGroup = () => group.group 
  const  getMembers = () => group.members 
  
  const [loading, setLoading] = useState(false)
  const socket = useSocket()

  function getMore() {
    setLoading(true)

    socket.emit('group-members', group.id, getMembers().map(el => el._id), (err, response) => {
      console.log(err, response)
      setLoading(false)

      if(!err) {
        setGroupMessages({
          type: 'users',
          data: {
            id: group.id,
            users: response
          }
        })
      }
    })
  }

  return (
    <div onClick={ev => ev.stopPropagation()} className={`${active ? 'z-20' : 'z-10'} border-l border-gray-800/40 absolute absolute-center w-full sm:max-w-[22rem] sm:w-[22rem] p-2 flex flex-col gap-2 items-center lg:w-full h-full overflow-y-auto bg-white`}>
      <div className='w-full bg-white border border-gray-800/40 rounded-md pt-2 flex flex-col justify-center items-center gap-2'>
        <div className='flex w-full p-2 gap-2'>
          <UserImage className='bg-transparent shadow-none' id={getGroup()._id} size='xl' />
          <div className='flex-1 flex flex-col justify-end w-full pb-3'>
            <span className='text-lg font-bold text-sky-500'>
              {getGroup()?.name} <span className='ml-2 text-xs lowercase underline underline-sky-400 text-gray-800 font-mono'>
              {
                getGroup()?.members.length > 1 ?
                  getGroup()?.members.length + ' members'
                : getGroup()?.members.length + ' member'
              }
              </span>
            </span>
            <p className='text-sm leading-none text-gray-500 w-full'>
              {
                getGroup()?.description || 'no description for this group'
              }
            </p>
          </div>
        </div>
        <div className='border-t flex flex-col w-full'>
          <span className='text-sm p-2 font-medium uppercase'>members</span>
          {
            getMembers()?.map(el => {
              return (
                <div key={el._id} className='group cursor-pointer flex gap-2 p-1 hover:bg-gray-800'>
                  <UserImage className='bg-transparent' id={el._id} size='xs' />
                  <div className='flex-1 flex flex-col'>
                    <span className='group-hover:text-gray-300 text-gray-800 text-sm'>{el.firstName} {el.lastName}</span>
                    <span className='text-xs text-sky-600'>{el.username}</span>
                  </div>
                  {
                    getGroup().creator == el._id ?
                      <div className='w-12 flex justify-center items-center text-sky-600'>
                        <FaStar />
                      </div>
                    : ''
                  }
                </div>
              )
            })
          }
          {/* {
            getMembers().length != getGroup().members.length ?
              <Ripple type='button' color='#0008' onClick={() => !loading ? getMore() : ''} className='relative h-8 text-sm w-full border-t border-gray-800/40 justify-center items-center'>
                {
                  loading ?
                    <span className='absolute text-3xl absolute-center bottom-[0px] leading-[0]'>. . .</span>
                  : <span>more</span>
                }
              </Ripple>
            : ''
          } */}
        </div>
      </div>
      <SharedMedia />
    </div>
  )
}

export default GroupOpenedMessageSidepanel