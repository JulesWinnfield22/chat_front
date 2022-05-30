import  { useState, useMemo, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import Ripple from '@/components/Ripple/Ripple'
import Dm from '@/components/Panel/Dm'
import { useStore } from '@/store/store'
import {useMessages} from '@/pages/Home'
import GroupChat from '@/components/Panel/GroupChat'
import { CgMenuLeft, CgSearch, CgLogOut } from 'react-icons/cg'
import { BsFillChatSquareTextFill } from 'react-icons/bs'
import { MdGroup } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

function Panel() {
  const {groupMessages} = useMessages()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dm')
  const { auth } = useStore()
  const activeTabClass = 'bg-gray-800 text-sky-300 shadow-md'
  
  const group_unread = useMemo(() => {
    return groupMessages.reduce((total, payload) => {
      
      let g = auth.user.groups.find(g => g.id == payload.id)
      let unread = payload.messages.reduce((sum, el) => {
        if(!g.lastSeenMessage && el.from != auth.user._id) sum++
        else if(new Date(el.createdAt) > new Date(g.lastSeenMessage) && el.from != auth.user._id) {
          sum++
        }
        return sum
      }, 0)

      return total += (payload.unread > unread ? payload.unread : unread)
    }, 0)
  }, [groupMessages])

  return (
    <div className='relative col-start-1 col-span-12 sm:col-end-6 md:col-end-5 lg:col-end-4 flex flex-col justify-start border-r border-gray-800/30 bg-gradent-to-r from-black/20 via-black/10 to-white shadw-lg'>
      <div className='w-full flex items-center border-b border-gray-800/30 px-1 gap-1 overflow-hidden h-12'>
        <Ripple color='#0008' type='button' onClick={() => navigate('drawer')} className='w-10 h-10 flex items-center justify-center'>
          <CgMenuLeft className='text-2xl pointer-events-none' />
        </Ripple>
        <Ripple color='#ddd' type='button' onClick={() => setActiveTab('dm')} className={`${activeTab == 'dm' ? activeTabClass : ''} text-xl w-10 h-10 rounded-full flex justify-center items-center`}>
          <BsFillChatSquareTextFill />
        </Ripple>
        <div className='relative w-10 h-10 inline-flex'>
          <Ripple color='#ddd' type='button' onClick={() => setActiveTab('group')} className={`${activeTab == 'group' ? activeTabClass : ''} text-2xl w-full h-full rounded-full flex justify-center items-center`}>
            <MdGroup />
          </Ripple>
          {
            group_unread > 0 ?
              <span className='pointer-events-none absolute flex items-center justify-center border border-gray-300 shadow-lg isolate top-0 bg-gray-800 text-sky-400 left-[70%] z-10 p-1 h-4 rounded-full text-xs font-semibold'>
                {group_unread}
              </span> : ''
          }
        </div>                                                                                                                                                                                                                                                                                    
        <Ripple color='#ddd' type='button' className='ml-auto text-2xl w-10 h-10 rounded-full flex justify-center items-center'>
          <CgSearch className='text-xl pointer-events-none' />
        </Ripple>
      </div>

      <div className='relative flex-1'>
        <Dm active={activeTab} />
        <GroupChat active={activeTab} />
        {/* <Dm active={activeTab} /> */}
      </div>
    </div>
  )
}

export default Panel