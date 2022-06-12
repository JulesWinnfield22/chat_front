import  { useState, useMemo, useReducer, useEffect, createContext, useContext, useCallback, useLayoutEffect } from 'react'
import Ripple from '@/components/Ripple/Ripple'
import Dm from '@/components/Panel/Dm'
import Search from '@/components/Panel/Search'
import { useStore } from '@/store/store'
import {useMessages} from '@/pages/Home'
import Drawer from '@/components/Drawer'
import GroupChat from '@/components/Panel/GroupChat'
import { CgMenuLeft, CgSearch, CgLogOut } from 'react-icons/cg'
import { BsFillChatSquareTextFill } from 'react-icons/bs'
import { MdGroup } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import usePortal from '@/hooks/usePortal'

function Panel() {
  const {groupMessages} = useMessages()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dm')
  const [openSearch, setOpenSearch] = useState(false)
  const [search, setSearch] = useState(false)
  const [preTab, setPreTab] = useState('')
  const { auth } = useStore()
  const activeTabClass = 'bg-gray-800 text-sky-300 shadow-md'
    
  const [Modal, nav, hide] = usePortal('drawer')

  const group_unread = useMemo(() => {
    return groupMessages.reduce((total, payload) => {
      let g = auth.user.groups.find(g => g.id == payload.id)

      if(!g) return 0

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

  let opendSearchClass = 'transition-all duration-200 linear flex items-center left-0 top-0 bg-white z-20 h-full w-full'

  function openTab(tab) {
    if(activeTab != tab) {
      setPreTab(activeTab)
      setActiveTab(tab)
    } else if(tab == 'search') {
      setActiveTab(preTab)
    }
  }


  return (
    <div className='relative col-start-1 col-span-12 sm:col-end-6 md:col-end-5 lg:col-end-4 flex flex-col justify-start border-r border-gray-800/30 bg-gradent-to-r from-black/20 via-black/10 to-white shadw-lg'>
      <div className='relative w-full flex items-center border-b border-gray-800/30 px-1 gap-1 overflow-hidden h-12'>
        <Ripple color='#0008' type='button' onClick={nav} className='w-10 h-10 flex items-center justify-center'>
          <CgMenuLeft className='text-2xl pointer-events-none' />
          <Modal>
            <Drawer />
          </Modal>
        </Ripple>
        <Ripple color='#ddd' type='button' onClick={() => openTab('dm')} className={`${activeTab == 'dm' ? activeTabClass : ''} text-xl w-10 h-10 rounded-full flex justify-center items-center`}>
          <BsFillChatSquareTextFill />
        </Ripple>
        <div className='relative w-10 h-10 inline-flex'>
          <Ripple color='#ddd' type='button' onClick={() => openTab('group')} className={`${activeTab == 'group' ? activeTabClass : ''} text-2xl w-full h-full rounded-full flex justify-center items-center`}>
            <MdGroup />
          </Ripple>
          {
            group_unread > 0 ?
              <span className='pointer-events-none absolute flex items-center justify-center border border-gray-300 shadow-lg isolate top-0 bg-gray-800 text-sky-400 left-[70%] z-10 p-1 h-4 rounded-full text-xs font-semibold'>
                {group_unread}
              </span> : ''
          }
        </div>     
        <div className='ml-auto w-10 h-10 flex justify-center items-center'>
          <div className={`${openSearch ? opendSearchClass : 'w-10'} transition-all duration-200 linear absolute`}>
            <Ripple onClick={() => {
              setOpenSearch(!openSearch)
              openTab('search')
            }} color='#ddd' type='button' className='text-2xl min-w-[2.5rem] h-10 rounded-full flex justify-center items-center'>
              <CgSearch className='text-xl pointer-events-none' />
            </Ripple>
            {
              openSearch ?
                <form onSubmit={(ev) => ev.preventDefault()} className='w-full h-full p-1'>
                  <input onChange={(ev) => setSearch(ev.target.value)} autoFocus className='text-sm h-full w-full shadow-sm' placeholder='search...' type="text" name="search" id="search" />
                </form>
              : ''
            }
          </div>
        </div>
      </div>

      <div className='relative flex-1'>
        <Dm active={activeTab} />
        <GroupChat active={activeTab} />
        <Search val={search} active={activeTab} />
      </div>
    </div>
  )
}

export default Panel