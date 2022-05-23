import  { useState, useMemo, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import Ripple from '@/components/Ripple/Ripple'
import { CgMenuLeft, CgSearch, CgLogOut } from 'react-icons/cg'
import UserImgWithMessage from '@/components/UserImgWithMessage'
import { useLocation, useNavigate, } from 'react-router-dom'

function Panel() {
  const { messagesWithUsers, openedMessages } = useMessages()
  const { auth, setAuth } = useStore()
  const navigate = useNavigate()

  const fevourites = useMemo(() => {
    let fevs =  messagesWithUsers.filter(el => {
      if(auth.user?.fevourites.includes(el.id)) return true
      return false
    })
    return fevs
  }, [messagesWithUsers, auth])

  const others = useMemo(() => {
    let other = messagesWithUsers.filter(el => {
      if(!auth.user?.fevourites.includes(el.id)) return true
      return false
    })
    return other
  }, [messagesWithUsers, auth])

  return (
    <div className='col-start-1 col-span-12 sm:col-end-6 md:col-end-5 lg:col-end-4 flex flex-col justify-start p-1 pr-4 lg:p-2 bg-gradient-to-r from-black/20 via-black/10 to-white shadw-lg'>

      <div className='rounded-md bg-white flex justify-between h-12 items-center shadow-sidenav-b'>
        <Ripple type='button' onClick={() => navigate('drawer')} className='h-full w-10 lg:w-12 flex items-center justify-center'>
          <CgMenuLeft className='text-2xl pointer-events-none' />
        </Ripple>
        <span className='tracking-wider text-lg'>LESSFACE</span>
        <button className='h-full w-10 lg:w-12 flex items-center justify-center'>
          <CgSearch className='text-xl pointer-events-none' />
        </button>  
      </div>

      <div className='flex-1 flex flex-col gap-1 py-1 lg:py-2 overflow-y-auto'>
        {!fevourites.length && !others.length && (<div className='flex flex-1 justify-center items-center'>no chats</div>)}
        {
          fevourites.length ?
            <div className='flex flex-col p-2 gap-1 border-b border-gray-800/30'>
              <span className='text-base case uppercase'>fevourites</span>
              {
                fevourites.map(item => {                                                                                                                                                                                            
                  return <UserImgWithMessage active={
                    openedMessages.find(el => el.id == item.id)?.active} key={item.id
                  } online={item.online} user={item.user} unread={item.unread} message={item.messages?.[0] || 'no messages yet'} />
                })
              }
            </div>
          : ''
        }
        {
          others.length ?
            <>
              {
                others.map(item => {
                  return <UserImgWithMessage active={
                    openedMessages.find(el => el.id == item.id)?.active} key={item.id
                  } online={item.online} user={item.user} unread={item.unread} message={item.messages?.[0] || 'no messages yet'} />
                })
              }
            </>
          : ''
        }
      </div>

    </div>
  )
}

export default Panel