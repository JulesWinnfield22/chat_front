import { useRef, useEffect, useTransition, useLayoutEffect, useState, useMemo } from 'react'
import { CgArrowLeft, CgChevronDoubleDown } from 'react-icons/cg'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaSpinner } from 'react-icons/fa'
import { IoMdSend } from 'react-icons/io'
import TextareaAutosize from 'react-textarea-autosize'
import UserImage from '@/components/UserImage'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import Message from '@/components/Message'
import StickyDate from '@/components/StickyDate'
import useSocket from '@/hooks/useSocket'
import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import { formatMessagesByTime } from '@/helper/helper'
import { useWhenVisible } from './whenVisible'

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

function OpenedMessage({ messageId, ...props}) {
  const { messagesWithUsers } = useMessages()
  const [loading, check] = useMultipleLoading(true, 2)
  
  let messages = useMemo(() => {
    let m = messagesWithUsers.find(el => el.id == messageId)
    return {
      ...m,
      skip: m.messages.length
    }
  },[messagesWithUsers])

  const unreadCount = useMemo(() => {
    let m = messagesWithUsers.find(el => el.id == messageId)

    let count = m.messages.reduce((sum, payload) => {
      if(payload.from == messageId && !payload.seen ) sum++
      return sum
    }, 0)

    check()
    return count
  }, [messagesWithUsers])

  const formatedMessages = useMemo(() => {
    let m = formatMessagesByTime(messages.messages || [])
    check()
    return m
  }, [messages])
  
  return (
    <>
      {
        !loading ?
          <View {...props} unreadCount={unreadCount} messages={{
            ...messages,
            messages: formatedMessages
          }} />
        : ''
      }
    </>
  )
}

function View({messages, back, active, togglePanel, unreadCount}) {
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
  // useEffect(() => {
  //   if(active && doneWatch && isThereNotSeen) {
  //     addWatcher()
  //   }
  // }, [active])

  useLayoutEffect(() => {
    let pos = sessionStorage.getItem(`${messages.id}_position`)
    if(pos) openedMessage.current.scrollTop = pos
  }, [])

  useEffect(() => {
    console.log('skip', messages.skip, messages.unread, doneWatch)
    socket.emit('get-more-messages', messages.id, messages.skip, messages.unread, async (err, response) => {

      if(err) console.log(err)

      console.log(response)

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

        if(isThereNotSeen()) {
          setAddWatcher(true)
        } else {
          setDoneWatch(true)
        }
      }
    })
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
        console.log('skippp', skip)
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

      console.log(lastSeen)
      
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

  return (
    <div
      className={`${active ? 'opened-message z-20' : 'z-10'} w-full lg:w-11/12 shadow-lg lg:shadow-dark lg:rounded-lg flex flex-col h-full bg-white absolute absolute-center`}
    >
      <div className='cursor-pointer h-12 sm:px-2 flex items-center border-b'>
        <button onClick={back} className="sm:hidden h-full w-10 flex items-center justify-center">
          <CgArrowLeft className='text-xl pointer-events-none' />
        </button>
        <div onClick={togglePanel} className='flex-1 flex items-center h-full'>
          <UserImage id={messages?.id} src={messages.user?.profile} size='xs' />
          <div className='ml-2 flex py-1 flex-col w-full h-full'>
            <span className='text-base font-medium h-1/2'>{messages.user.username}</span>
            <span className='text-xs text-gray-500 tracking-wider font-medium h-1/2'>{
              typing?.includes(messages?.id) ?
                'typing'
              : messages.online ? 'online' : ''
            }</span>
          </div>
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