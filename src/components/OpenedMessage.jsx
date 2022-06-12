import { useRef, useEffect, useTransition, useLayoutEffect, useState, useMemo } from 'react'
import { CgArrowLeft, CgChevronDoubleDown } from 'react-icons/cg'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa'
import { IoMdSend } from 'react-icons/io'
import { HiOutlineDotsVertical } from 'react-icons/hi'

import TextareaAutosize from 'react-textarea-autosize'
import UserImage from '@/components/UserImage'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import Message from '@/components/Message'
import useDropdown from '@/components/Dropdown'
import StickyDate from '@/components/StickyDate'
import usePortal from '@/hooks/usePortal'
import Ripple from '@/components/Ripple/Ripple'
import ConfirmationModal from '@/modals/ConfirmationModal'
import useSocket from '@/hooks/useSocket'
import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import { formatMessagesByTime } from '@/helper/helper'
import { useWhenVisible } from './whenVisible'
import {screens} from 'tailwindcss/defaultTheme'

function isThereNotSeen() {
  return !!document.querySelector('.not-seen')
}

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

function OpenedMessage() {
  const { messagesWithUsers, openedMessages, chatType } = useMessages()
  const [loading, check] = useMultipleLoading(true, 2)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [showMessage, setShowMessage] = useState('')

  function messa(messageId) {
    let m = messagesWithUsers.find(el => el.id == messageId)
    return {
      ...m,
      skip: m.messages.length
    }
  }

  const unreadCount = (messageId) => {
    let m = messagesWithUsers.find(el => el.id == messageId)

    let count = m.messages.reduce((sum, payload) => {
      if(payload.from == messageId && !payload.seen ) sum++
      return sum
    }, 0)

    return count
  }

  const formatedMessages = (messages) => {
    let m = formatMessagesByTime(messages || [])
    return m
  }

  useEffect(() => {
    const observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        const width = entry.contentRect.width
        if(width < parseInt(screens.sm) && openedMessages.length && pathname.startsWith('/message')) {
          setShowMessage('left-0')
        } else if(width > parseInt(screens.sm) && pathname.startsWith('/message')) {
          setShowMessage('left-0')
        } else if(width < parseInt(screens.sm) && !openedMessages.length ) {
          setShowMessage('left-full')
        }
      })
    })
    
    observer.observe(document.body)
    return () => {
      observer.unobserve(document.body)
    }
  }, [pathname, openedMessages])
  
  return (
    <div className={`${showMessage} ${chatType == 'regular' ? 'z-50' : 'z-40 hidden' } w-full h-full bg-white fixed top-0 sm:absolute`}>
      {
        openedMessages.map(item => {
          let mes = messa(item.id)
          let messages = formatedMessages(mes.messages)

          return (
            <View messageId={item.id} active={item.active} key={item.id} unreadCount={unreadCount(item.id)} messages={{
              ...mes,
              messages
            }} />
          )
        })
      }
    </div>
  )
}

function View({messages, active, unreadCount}) {
  const openedMessage = useRef(null)
  const textarea = useRef(null)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [done, setDone] = useState(false)
  const [addWatcher, setAddWatcher] = useState(false)
  const [message, setMessage] = useState('')
  const [doneWatch, setDoneWatch] = useState(false)
  const { setMessagesWithUsers, messagesWithUsers, typing } = useMessages()

  const [showGoToBottom, setShowGoToBottom] = useState(false)
  const { auth } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const socket = useSocket()
  const whenVisible = useWhenVisible()

  const [Dropdown, toggleDropdown] = useDropdown()

  const [Modal, nav, hide] = usePortal('areyousure')

  const togglePanel = () => {
    if(window.innerWidth < parseInt(screens.lg)) {
      navigate('/info')
    }
  }

  const back = () =>  navigate(-1)

  useLayoutEffect(() => {
    let pos = sessionStorage.getItem(`${messages.id}_position`)
    if(pos) openedMessage.current.scrollTop = pos
  }, [])

  useEffect(() => {
    if(messages.skip < 20) {
      socket.emit('get-more-messages', messages.id, messages.skip, messages.unread, async (err, response) => {

        if(err) console.log(err)
  
        if(response?.length) {
          setLoadingMessages(false)
          response[0].last = true
          setMessagesWithUsers({
            type: 'push',
            data: {
              id: messages.id,
              messages: response
            }
          })
  
          if(isThereNotSeen()) {
            if(addWatcher) {
              setAddWatcher('')
              setAddWatcher(true)
            } else {
              setAddWatcher(true)
            }
          } else {
            setDoneWatch(true)
          }
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
      setLoadingMessages(false)
      if(isThereNotSeen()) {
        setAddWatcher(true)
      } else {
        setDoneWatch(true)
      }
    }
  }, [])

  useEffect(() => {
    /* 
      since when we update the messages we are spicing the
      message and creating a new object the reference to the old one
      is still being used by the scroll handler so initialize the 
      skip and manually update it. and maybe the magic value [20]
      should be changed to a variable
    */

    let skip = messages.skip // ? messages.unread + messages.skip : messages.skip
    const scrollHandler = function({ target }) {

      let currentPosition = target.scrollTop
      if(currentPosition < sessionStorage.getItem(`${messages.id}_position`)) {
        setShowGoToBottom(true)
      } else {
        setShowGoToBottom(false)
      }

      sessionStorage.setItem(`${messages.id}_position`, currentPosition)

      let height = target.scrollHeight - target.offsetHeight
      if(-target.scrollTop == height && !done) {
        setLoadingMessages(true)
        socket.emit('get-more-messages', messages.id, skip, 0, (err, moreMessages) => {
          if(moreMessages.length) {
            moreMessages[0].last = true
            setLoadingMessages(false)
            if(moreMessages.length < 20) setDone(true)
            setMessagesWithUsers({
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

    let el = openedMessage.current
    el.addEventListener('scroll', scrollHandler)

    return () => {
      el.removeEventListener('scroll', scrollHandler)
    }
  }, [done, messages])

  useEffect(() => {
    if(doneWatch) {
      // TODO this is not working as expected so change it
      const notSeen = openedMessage.current.querySelectorAll('.not-seen')

      // if(notSeen.length > 1) setShowGoToBottom(true)

      notSeen.forEach(el => {
        if(!el['watched']) {
          el['watched'] = 'watched'
          whenVisible(el, whenVisibleCallback, {
            root: openedMessage.current,
            threshold: 1
          })
        }
      })
    }
  }, [messages])

  function whenVisibleCallback(entry) {
    let ca = entry.target.dataset['createdat']
    socket.emit('seen', messages.id, ca, (err, response) => {
      if(!err) {
        setMessagesWithUsers({
          type: 'update_seen',
          data: {
            id: messages.id,
            createdAt: ca
          }
        })

        if(!isThereNotSeen()) {
          setShowGoToBottom(false)
        }
      }
    })
  }

  const getLastSeen = () => {
    let m = messagesWithUsers.find(el => el.id == messages.id)

    let lastseen
    m.messages.forEach((el) => {
      if(!el.seen && el.from == messages.id) {
        if(lastseen && el.createdAt < lastseen) {
          lastseen = el.createdAt
        } else {
          lastseen = el.createdAt
        }
      }
    })

    return lastseen
  }

  useEffect(() => {
    if(addWatcher) {
      let lastNotSeen = getLastSeen()
      const lastSeen = openedMessage.current.querySelector(`p[data-createdat='${lastNotSeen}']`)
      const notSeen = openedMessage.current.querySelectorAll('.not-seen')
      let message = showNotSeenMessage(lastSeen)

      message?.scrollIntoView()
      if(notSeen.length > 1) setShowGoToBottom(true)

      notSeen.forEach(el => {
        if(!el['watched']) {
          el['watched'] = 'watched'
          whenVisible(el, whenVisibleCallback, {
            root: openedMessage.current,
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
      if(el && unreadCount > 0 && openedMessage.current.scrollTop + openedMessage.current.offsetHeight < el.offsetTop) {
        el.remove()
        let lastNotSeen = getLastSeen()
        const notSeen = openedMessage.current.querySelector(`p[data-createdat='${lastNotSeen}']`)
        el = showNotSeenMessage(notSeen)
        el?.scrollIntoView()
      } else if(unreadCount) {
        let lastNotSeen = getLastSeen()
        const notSeen = openedMessage.current.querySelector(`p[data-createdat='${lastNotSeen}']`)
        el = showNotSeenMessage(notSeen)
        el?.scrollIntoView()
      } else {
        openedMessage.current.scrollTop = openedMessage.current.scrollHeight - openedMessage.current.offsetHeight
      }
    } else {
      openedMessage.current.scrollTop = openedMessage.current.scrollHeight - openedMessage.current.offsetHeight
    }
  }

  function send() {
    if(message) {

      let tempId = Math.floor(Math.random() * 100)

      setMessagesWithUsers({
        type: 'push',
        data: {
          id: messages.id,
          messages: {
            _id: tempId,
            status: 'pending',
            from: auth.user._id,
            to: messages.id,
            message,
            createdAt: new Date().toLocaleString(),
            seen: false
          }
        }
      })

      socket.emit('private-message', {to: messages.id, message}, (err, response) => {
        if(err) console.log(err)
        else {
          setMessagesWithUsers({
            type: 'message-delevered',
            data: {
              id: messages.id,
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

  useEffect(() => {
    if(message) {
      socket.emit('typing', messages.id)
    } else {
      socket.emit('done_typing', messages.id)
    }
  }, [message])

  const getLastOnline = (time) => {
    let now = new Date()
    let lastOnline = new Date(time)

    let t = Math.floor((now - lastOnline) / (1000 * 60)) // changing it in to min

    if(t < 3) {
      return 'just now'
    } else if (t < 60) {
      return `${t}min ago`
    } else if (t < 60 * 24) {
      let hours = Math.floor(t / 60)
      return `${hours}h ago`
    } else { 
      return lastOnline.toDateString().toLowerCase() 
    }
  }

  const no = () => hide()

  const yes = () => {
    hide()
    socket.emit('delete-private-message', messages.id, (err, response) => {
      console.log(err, response)
      if(!err) {
        navigate('/', {
          replace: true
        })

        setMessagesWithUsers({
          type: 'remove',
          data: messages.id
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
          <UserImage id={messages?.id} src={messages.user?.profile} size='xs' />
          <div className='ml-2 flex flex-col w-full h-full'>
            <span className='text-base font-medium h-1/2'>{messages.user.username}</span>
            <span className='text-xs text-gray-600 tracking-wider h-1/2'>{
              typing?.includes(messages?.id) ?
                'typing'
              : messages.online ?
                'online'
              : 'active ' + getLastOnline(messages?.user?.active) ?? 'active long time ago'
            }</span>
          </div>
        </div> 
        <div className='relative px-2 sm:px-0'>
          <Ripple onClick={toggleDropdown} className='w-10 h-10 rounded-full flex items-center justify-center ml-auto'>
            <HiOutlineDotsVertical />
          </Ripple>
          <Dropdown>
            <div className='flex flex-col min-w-[10rem]'>
              <Ripple onClick={nav} className='p-2 text-sm'>
                <span>delete chat</span>
              </Ripple>
              <Modal>
                <ConfirmationModal msg='are you sure? you will not get back your messages if you continue!' no={no} yes={yes} />
              </Modal>
            </div>
          </Dropdown>
        </div>
      </div>
      <div className='relative flex-1 overflow-hidden'>
        <div ref={openedMessage} className='w-full h-full px-2 py-2 flex flex-col-reverse gap-2 overflow-y-scroll'>
          {
            messages.messages.concat().reverse().map(({year, messages}) => {
              return messages.concat().reverse().map(({month, messages}) => {
                return messages.concat().reverse().map(({date, messages}) => {
                  return (
                    <div id={'date-' + date} key={`${year}-${month}-${date}`} className='flex flex-col gap-2 z-0'>
                      {
                        openedMessage?.current ?
                          <StickyDate root={openedMessage?.current} date={`${year}-${month}-${date}`} />
                        : ''
                      }
                      {
                        <Message messages={messages} />
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
              unreadCount?
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

export default OpenedMessage