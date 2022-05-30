import  { useState, useMemo, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import { useLocation, useNavigate } from 'react-router-dom'
import UserImgWithMessage from '@/components/UserImgWithMessage'

function Dm({ active }) {
  const { messagesWithUsers, openedMessages } = useMessages()
  const { auth } = useStore()

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

  const isActive = id => !!openedMessages.find(el => el.id == id)?.active

  return (
    <div className={`${active != 'dm' ? 'z-10' : 'z-20'} absolute w-full h-full bg-white flex-1 flex flex-col overflow-y-auto`}>
      {!fevourites.length && !others.length && (<div className='flex flex-1 justify-center items-center'>no chats</div>)}
      {
        fevourites.length ?
          <div className='flex flex-col p-2 gap-1 border-b border-gray-800/30'>
            <span className='text-base case uppercase'>fevourites</span>
            {
              fevourites.map(item => {                                                                                                                                                                                            
                return <UserImgWithMessage className='rounded-lg' active={isActive(item.id)} key={item.id
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
                return <UserImgWithMessage active={isActive(item.id)} key={item.id
                } online={item.online} user={item.user} unread={item.unread} message={item.messages?.[0] || 'no messages yet'} />
              })
            }
          </>
        : ''
      }
    </div>
  )
}

export default Dm