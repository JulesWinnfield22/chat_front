import { useMessages } from '@/pages/Home'
import { formatGroupMessagesByTime } from '@/helper/helper'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { screens } from 'tailwindcss/defaultTheme'
import { CgArrowLeft, CgChevronDoubleDown } from 'react-icons/cg'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import UserImage from '@/components/UserImage'
import Message from '@/components/Message'
import useDropdown from '@/components/Dropdown'
import Ripple from '@/components/Ripple/Ripple'
import StickyDate from '@/components/StickyDate'
import TextareaAutosize from 'react-textarea-autosize'
import { IoMdSend } from 'react-icons/io'
import useSocket from '@/hooks/useSocket'
import { FaSpinner } from 'react-icons/fa'
import { useStore } from '@/store/store'
import { useWhenVisible } from './whenVisible'

function showNotSeenMessage(el, options) {
  let m = document.querySelector('.not-seen-messages')
  if(!m && el) {
    let div = document.createElement('div')
    let p = document.createElement('p')
    div.className = 'not-seen-messages min-h-[2rem] w-full flex justify-center z-20 items-center'
    p.className = 'text-sm  rounded-sm bg-gray-600 w-full text-center text-gray-300'
    p.textContent = 'unread messages'

    div.appendChild(p)
    el.before(div)

    return div
  }

  return m
}

function GroupOpenedMessage() {
  const { groupMessages, openedGroupMessages, chatType } = useMessages()
  // const [loading, check] = useMultipleLoading(true, 2)
  const { pathname } = useLocation()
  // const navigate = useNavigate()
  const [showMessage, setShowMessage] = useState('')
  const { auth } = useStore()

  function messa(messageId) {
    let m = groupMessages.find(el => el.id == messageId) || {}
    return {
      ...m,
      skip: m?.messages?.length || 0
    }
  }

  const unreadCount = (messageId) => {
    let m = groupMessages.find(el => el.id == messageId)
    let group = auth.user.groups.find(el => el.id == messageId)
    
    if(!group) return 0

    let ls = group?.lastSeenMessage

    let count = m?.messages?.reduce((sum, payload) => {
      if(!ls) sum++
      else if(new Date(payload.createdAt) > new Date(ls) && payload.from != auth.user._id) sum++
      return sum
    }, 0)

    return count
  }

  const formatedMessages = (messages) => {
    let m = formatGroupMessagesByTime(messages || [])
    return m
  }

  useEffect(() => {
    const observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        const width = entry.contentRect.width
        if(width < parseInt(screens.sm) && openedGroupMessages.length && pathname.startsWith('/group')) {
          setShowMessage('left-0')
        } else if(width > parseInt(screens.sm) && pathname.startsWith('/group')) {
          setShowMessage('left-0')
        } else if(width < parseInt(screens.sm)) {
          setShowMessage('left-full')
        }
      })
    })
    
    observer.observe(document.body)
    return () => {
      observer.unobserve(document.body)
    }
  }, [pathname, openedGroupMessages])
  
  return (
    <div className={`${showMessage} ${chatType == 'group' ? 'z-50' : 'z-40 hidden' } w-full h-full bg-white fixed top-0 sm:absolute`}>
      {
        openedGroupMessages.map(item => {
          let mes = messa(item.id)
          let messages = formatedMessages(mes.messages)

          return (
            <View groupId={item.id} active={item.active} unreadCount={unreadCount(item.id)} key={item.id} messages={{
              ...mes,
              messages
            }} />
          )
        })
      }
    </div>
  )
}

function isThereNotSeen() {
  return !!document.querySelector('.not-seen')
}

function View({groupId, messages, active, unreadCount}) {
  const openedGroupMessage = useRef(null)
  const [message, setMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(true)
  const textarea = useRef(null)
  const { groupMessages, setGroupMessages, openedGroupMessages, setOpenedGroupMessages, chatType } = useMessages()
  const [addWatcher, setAddWatcher] = useState(false)
  const socket = useSocket()
  const [done, setDone] = useState(false)
  const [showGoToBottom, setShowGoToBottom] = useState(false)
  const { auth, setAuth } = useStore()
  const whenVisible = useWhenVisible()
  const [doneWatch, setDoneWatch] = useState(false)
  const navigate = useNavigate()
  const [Dropdown, toggleDropdown] = useDropdown()

  useEffect(() => {
    if(active) {
      socket.emit('opened-group', groupId , (err, online) => {
        if(!err) {
          setGroupMessages({
            type: 'member-online',
            data: {
              group: groupId,
              member: online
            }
          })
        }
      })
    }

    return () => {
      socket.emit('closed-group', groupId)
    }
  }, [active])

  useLayoutEffect(() => {
    let pos = sessionStorage.getItem(`${messages.id}_position`)
    if(pos) openedGroupMessage.current.scrollTop = pos
  }, [])

  useEffect(() => {
    if(messages.skip < 20) {
      socket.emit('get-more-group-messages', messages.id, messages.skip, messages.unread, async (err, response) => {
        if(err) console.log(err)
        
        if(response.length) {
          setLoadingMessages(false)
          // response[0].last = true
          setGroupMessages({
            type: 'push',
            data: {
              id: messages.id,
              messages: response
            }
          })

          if(isThereNotSeen()) {
            setAddWatcher(true)
          } else {
            setDoneWatch(true)
          }
          
          if(response.length < 20) setDone(true)
        } else {
          setLoadingMessages(false)
          setDone(true)
          if(isThereNotSeen()) {
            setAddWatcher(true)
          } else {
            setDoneWatch(true)
          }
        }
      })
    } else {
      if(isThereNotSeen()) {
        setAddWatcher(true)
      } else {
        setDoneWatch(true)
      }
    }
  }, [])

  useEffect(() => {
    let skip = messages.skip // ? messages.unread + messages.skip : messages.skip
    const scrollHandler = function({ target }) {

      let currentPosition = target.scrollTop
      if(currentPosition < sessionStorage.getItem(`${messages.id}_position`) && unreadCount == 0) {
        setShowGoToBottom(true)
      } else {
        setShowGoToBottom(false)
      }

      sessionStorage.setItem(`${messages.id}_position`, currentPosition)

      let height = target.scrollHeight - target.offsetHeight
      if(-target.scrollTop == height && !done) {
        setLoadingMessages(true)
        socket.emit('get-more-group-messages', messages.id, skip, 0, (err, moreMessages) => {
          if(moreMessages.length) {
            // moreMessages?.allMessaegs[0].last = true
            setLoadingMessages(false)
            if(moreMessages?.length < 20) setDone(true)
            setGroupMessages({
              type: 'push',
              data: {
                id: messages.id,
                messages: moreMessages
              }
            })

          } else {
            setLoadingMessages(false)
            setDone(true)
          }

        })
      }
    }

    let el = openedGroupMessage.current
    el.addEventListener('scroll', scrollHandler)

    return () => {
      el.removeEventListener('scroll', scrollHandler)
    }
  }, [done, messages])
  

  function whenVisibleCallback(entry) {
    let ca = entry.target.dataset['createdat']
    console.log(`%c${ca}`, 'color: red')
    let groups = [...auth.user.groups]

    let update = false
    let group = groups.find(el => el.id == groupId)

    if(!group) return

    if(!group.lastSeenMessage) {
      group.lastSeenMessage = ca
      update = true
    } else if(new Date(ca) > new Date(group.lastSeenMessage)) {
      group.lastSeenMessage = ca
      update = true
    }

    if(update) {
      setAuth({
        type: 'update',
        data: {
          name: 'groups',
          value: groups
        }
      })

      setGroupMessages({
        type: 'update_seen',
        data: {
          id: groupId,
          createdAt: ca
        }
      })

      socket.emit('group-seen', groupId, ca, (err, response) => {
        if(!err) {
          
        }
      })
    }

    if(!isThereNotSeen()) {
      setShowGoToBottom(false)
    }
  }

  const getLastSeen = () => {
    let m = groupMessages.find(el => el.id == messages.id)
    let group = auth.user.groups.find(el => el.id == groupId)
    let lastseen

    if(!group) return ''

    let ls = group?.lastSeenMessage

    if(!ls) {
      let cc = m.messages.concat().reverse()
      for(let i = 0; i < cc.length; i++) {
        if(cc[i].from != auth.user._id) {
          return cc[i].createdAt
        }
      }
    }

    for(let i = 0; i < m.messages.length; i++) {
      if(new Date(m.messages[i].createdAt) > new Date(ls) && m.messages[i].from != auth.user._id) {
        lastseen = m.messages[i].createdAt
        break
      }
    }

    return lastseen
  }

  useEffect(() => {
    if(doneWatch) {
      let group = auth.user.groups.find(el => el.id == groupId)

      if(!group) return
      // TODO this is not working as expected so change it
      const notSeen = openedGroupMessage.current.querySelectorAll('.not-seen')

      // if(notSeen.length > 1) setShowGoToBottom(true)

      notSeen.forEach(el => {
        if(!el['watched']) {
          el['watched'] = 'watched'
          whenVisible(el, whenVisibleCallback, {
            root: openedGroupMessage.current,
            threshold: 1
          })
        }
      })
    }
  }, [messages])

  useEffect(() => {
    if(addWatcher) {
      let group = auth.user.groups.find(el => el.id == groupId)

      if(!group) return

      let lastNotSeen = getLastSeen()
      const lastSeen = openedGroupMessage.current.querySelector(`p[data-createdat='${lastNotSeen}']`)
      const notSeen = openedGroupMessage.current.querySelectorAll('.not-seen')
      let message = showNotSeenMessage(lastSeen)
      message?.scrollIntoView()

      if(notSeen.length > 1) setShowGoToBottom(true)

      notSeen.forEach(el => {
        if(!el['watched']) {
          el['watched'] = 'watched'
          whenVisible(el, whenVisibleCallback, {
            root: openedGroupMessage.current,
            threshold: 1
          })
        }
      })

      setDoneWatch(true)
    }
  }, [addWatcher])

  function goToBottom(checkShowMessage = true) {
    if(checkShowMessage) {
      let el = showNotSeenMessage()
      if(el && unreadCount > 0 && openedGroupMessage.current.scrollTop + openedGroupMessage.current.offsetHeight < el.offsetTop) {
        el.remove()
        let lastNotSeen = getLastSeen()
        const notSeen = openedGroupMessage.current.querySelector(`p[data-createdat='${lastNotSeen}']`)
        el = showNotSeenMessage(notSeen)
        el?.scrollIntoView()
      } else if(unreadCount) {
        let lastNotSeen = getLastSeen()
        const notSeen = openedGroupMessage.current.querySelector(`p[data-createdat='${lastNotSeen}']`)
        el = showNotSeenMessage(notSeen)
        el?.scrollIntoView()
      } else {
        openedGroupMessage.current.scrollTop = openedGroupMessage.current.scrollHeight - openedGroupMessage.current.offsetHeight
      }
    } else {
      openedGroupMessage.current.scrollTop = openedGroupMessage.current.scrollHeight - openedGroupMessage.current.offsetHeight
    }
  }

  const togglePanel = () => {
    if(window.innerWidth < parseInt(screens.lg)) {
      navigate('/infogroup')
    }
  }

  const back = () =>  navigate(-1)

  function send() {
    if(message) {

      let tempId = Math.floor(Math.random() * 100)

      setGroupMessages({
        type: 'push',
        data: {
          id: groupId,
          messages: {
            _id: tempId,
            status: 'pending',
            from: auth.user._id,
            to: groupId,
            message,
            createdAt: new Date().toLocaleString(),
          }
        }
      })

      socket.emit('group-message', {to: groupId, message}, (err, response) => {
        if(err) console.log(err)
        else {
          setGroupMessages({
            type: 'message-delevered',
            data: {
              id: groupId,
              tempId,
              message: response
            }
          })
        }
      })

      textarea.current.focus()
      goToBottom(false)
      setMessage('')
    }
  }

  function joinOrLeave() {
    let member = messages.group.members.includes(auth.user._id)

    socket.emit('join', groupId, '', (err, response) => {
      if(member) {
        setAuth({
          type: 'update',
          data: {
            name: 'groups',
            value: response?.groups
          }
        })


        if(messages.group.restriction) {
          navigate('/', {
            replace: true
          })

          let r = openedGroupMessages.filter(el => el.id != groupId)
          setOpenedGroupMessages(r)
          setGroupMessages({
            type: 'remove',
            data: groupId
          })
        } else {
          setGroupMessages({
            type: 'remove_member',
            data: {
              id: groupId,
              member: auth.user._id
            }
          })
        }
      } else {
        setAuth({
          type: 'update',
          data: {
            name: 'groups',
            value: [...(new Set([...auth.user.groups, {id: groupId, lastSeenMessage: Date.now(), pending: false}]))]
          }
        })

        
        setGroupMessages({
          type: 'add_member',
          data: {
            id: groupId,
            members: response.members
          }
        })
      }
    })

  }

  return (
    <div
      className={`${active ? 'opened-message z-20' : 'hidden z-10'} w-full flex flex-col h-full bg-white absolute absolute-center`}
    >
      <div className='cursor-pointer h-12 sm:px-2 flex items-center border-b'>
        <button onClick={back} className="sm:hidden h-full w-10 flex items-center justify-center">
          <CgArrowLeft className='text-xl pointer-events-none' />
        </button>
        <div onClick={togglePanel} className='flex-1 flex items-center h-full'>
          <UserImage id={messages?.id} size='xs' />
          <div className='ml-2 flex py-1 flex-col w-full h-full'>
            <span className='text-base font-medium h-1/2'>{messages.group.name}</span>
            <span className='text-xs text-gray-600 tracking-wider h-1/2'>
              {
                messages.group.members.length > 1 ?
                  <span>
                    {messages.group.members.length} members,
                  </span>
                : <span>
                    {messages.group.members.length} member,
                  </span>
              } 
              {
                messages.online && messages.online.length? 
                  <span> {messages.online.length} {messages.online.length > 1 ? messages.group.membersnickName || '' + ' are' : ''} online</span>
                : ''
              } 
            </span>
          </div>
        </div>
        <div className='relative'>
          <Ripple onClick={toggleDropdown} className='w-10 h-10 dropdown-handler rounded-full flex items-center justify-center ml-auto'>
            <HiOutlineDotsVertical />
          </Ripple>
          <Dropdown>
            <div className='flex  min-w-[10rem]'>
              <Ripple onClick={joinOrLeave} className='p-2 w-full text-sm hover:bg-gray-800 hover:text-sky-400'>
                {
                  messages.group.members.includes(auth.user._id) ?
                  'leave group' : 'join'
                }
              </Ripple>
            </div>
          </Dropdown>
        </div>
      </div>
      <div className='relative flex-1 overflow-hidden'>
        <div ref={openedGroupMessage} className='w-full h-full px-2 py-2 flex flex-col-reverse gap-2 overflow-y-scroll'>
          {
            messages.messages.concat().reverse().map(({year, messages}) => {
              return messages.concat().reverse().map(({month, messages}) => {
                return messages.concat().reverse().map(({date, messages}) => {
                  return (
                    <div id={'date-' + date} key={`${year}-${month}-${date}`} className='flex flex-col gap-2 z-0'>
                      {
                        openedGroupMessage?.current ?
                          <StickyDate root={openedGroupMessage?.current} date={`${year}-${month}-${date}`} />
                        : ''
                      }
                      {
                        <Message group={groupId} messages={messages} />
                      }
                    </div>
                  )
                })
              })
            })
          }
          {
            <div key='rotate' className='min-h-[2rem] flex justify-center items-center w-full'>
              {
                loadingMessages ?
                  <FaSpinner className='text-lg rotate' />
                : ''
              }
              {
                done ? <p className='text-base'>no more messages</p> : ''
              }
            </div> 
          }
        </div>
        {
          showGoToBottom || unreadCount  ?
          <button onClick={goToBottom} className={`${showGoToBottom ? 'go-to-bottom' : ''} absolute text-2xl pt-2 text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center bottom-4 right-4`}>
            <CgChevronDoubleDown />
            {
              unreadCount ?
              <span className='text-xs pointer-events-none font-bold p-1 shadow-md rounded-full absolute bottom-5 flex justify-center items-center bg-blue-500'>
                {
                  unreadCount
                }
              </span> : ''
            }
          </button> : ''
        }
      </div>
      <div className='flex lg:p-2'>
        <div className='bg-white shadow-textarea flex w-full lg:rounded-lg overflow-hidden'>
          <TextareaAutosize autoFocus value={message} ref={textarea} onChange={({target}) => setMessage(target.value)} maxRows='6' className='resize-none h-12 flex-1 text-base p-2' placeholder='write a message...' />
          <div className='self-end max-h-12 lg:max-h-14 h-full w-10 lg:w-12 flex items-center justify-center'>
            <button onClick={send} className='pl-[4px] h-8 w-8 rounded-full bg-black/10 flex items-center justify-center'>
              <IoMdSend className='text-2xl'/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupOpenedMessage