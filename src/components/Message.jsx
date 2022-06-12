import { memo, useEffect, useState } from 'react'
import { BsCheck2All, BsCheck2, BsClock } from 'react-icons/bs'
import { useStore } from '@/store/store'
import UserImage from '@/components/UserImage'
import { screens } from 'tailwindcss/defaultTheme'

function Message({messages, group = 0}) {
  const { auth } = useStore()
  const [visible, setVisible] = useState(false)
  
  const isThisMe = (id) => (id?._id || id) == auth.user._id

  useEffect(() => {
    let observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        if(window.innerWidth > parseInt(screens.sm)) {
          setVisible(true)
        } else {
          setVisible(false)
        }
      })
    })

    observer.observe(document.body)
    return () => {
      observer.unobserve(document.body)
    }
  }, [])

  const gLastSeen = () => {
    return ls
  }

  const gNotSeen = (createdAt) => {
    let ls = auth.user.groups.find(el => el.id == group)?.lastSeenMessage

    if(!ls) return true

    if(new Date(createdAt) > new Date(ls)) return true

    return false
  }

  const getMessage = (mess) => {
    if(group) return mess.concat().reverse()

    return mess
  }

  return (
    <>
      {
        messages.map(({messages: mess, from, status, to, time, seen, createdAt}) => {        
          return (
            <div key={createdAt} className={`flex gap-1 ${isThisMe(from) ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex-1 flex flex-col ${isThisMe(from) ? 'items-end order-1' : 'items-start order-2'}`} >
                {
                  getMessage(mess).map(({message, from, seen, _id, createdAt}) => {
                    return (
                      <p id={_id} data-createdat={createdAt} className={`${!isThisMe(from) && group ? (gNotSeen(createdAt) ? 'not-seen' : '') : !seen && !group ? 'not-seen' : ''} ${ isThisMe(from) ? 'rounded-l-lg rounded-tr-lg bg-gray-800 text-gray-300' : 'rounded-r-lg rounded-tl-lg bg-gray-300 text-gray-900'} max-w-[80%] whitespace-normal break-all px-2 py-1 mt-1 tracking-wide text-base`} key={_id + ' ' + message} >
                        {message}
                      </p>
                    )
                  })
                }
                <div className='flex gap-1 items-center justify-end'>
                  {
                    isThisMe(from) ?
                      <span className={`text-sm`}>
                        {
                          status == 'pending' ?
                            <BsClock />
                          : seen ?
                              <BsCheck2All />
                            : <BsCheck2 />
                        }
                      </span> : ''
                  }
                  <span className='text-xs'>{time}</span>
                </div>
              </div>
              <UserImage size='xxs' className={`${isThisMe(from) ? 'order-2' : 'order-1'} self-end ${!visible ? 'hidden' : ''}`} id={from?._id || from} />
            </div>
          )
        })
      }
    </>
  )
}

export default memo(Message)