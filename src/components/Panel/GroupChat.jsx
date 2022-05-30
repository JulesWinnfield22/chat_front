import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import UserImage from '@/components/UserImage'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Ripple from '@/components/Ripple/Ripple'

function GroupChat({ active }) {
  const {groupMessages, openedGroupMessages} = useMessages()
  const navigate = useNavigate()
  const { auth } = useStore()

  function getName(groupId, id) {
    let group = groupMessages.find(el => el.id == groupId)

    return group.members.find(el => el._id == id)?.username
  }

  function getnread(group) {
    let ls = auth.user.groups.find(el => el.id == group.id)?.lastSeenMessage
    
    let unread = group.messages.reduce((sum, payload) => {

      if(!ls && payload.from != auth.user._id) sum++
      else if(new Date(payload.createdAt) > new Date(ls) && payload.from != auth.user._id) {
        sum++
      }
      return sum
    }, 0)

    return group.unread > unread ? group.unread : unread
  }

  const isActive = (id) => !!openedGroupMessages.find(item => item.id == id)?.active
  
  return (
    <div className={`${active != 'group' ? 'z-10' : 'z-20'} absolute w-full h-full bg-white`}>
      {/* <p className='uppercase px-2 sm:p-0 sm:py-1'>groups</p> */}
      {
        groupMessages.map(el => {
          let active = isActive(el.group._id)

          return (
            <Ripple style={{
              boxShadow: '0 0 8px -4px #000'
            }} onClick={() => navigate(`/group/${el.group._id}`)} className={`${active ? 'bg-gray-900' : 'bg-black/20'} p-2 flex gap-1 w-full cursor-pointer group hover:bg-gray-900`} color='#ddd' key={el.group._id} >
              <UserImage id={el.group._id} />
              <div style={{
                  width: `calc(100% - 3rem + .25rem)`
                }} className='flex-1 flex flex-col py-1'>
                <p className='flex justify-between pr-2'>
                  <span className={`${active ? 'text-gray-100' : ''} flex-1 text-sm group-hover:text-gray-100 font-medium`}>{el.group.name}</span>
                  {
                    getnread(el) ?
                     <span className='text-xs self-center px-2 bg-sky-400 rounded-lg text-gray-800 font-medium'>not seen {getnread(el)}</span>
                    : ''
                  }
                </p>
                <span className='flex-1 text-gray-500 text-sm'>
                  {
                    el.messages.length ?
                      <p><span className='text-sky-600'>{getName(el.id, el.messages[0].from)}</span> : {el.messages[0].message}</p>
                    : 'no messagess yet'
                  }
                </span>
              </div>
            </Ripple>
          )
        })
      }
    </div>
  )
}

export default GroupChat