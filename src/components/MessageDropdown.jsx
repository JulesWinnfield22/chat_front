import { useState, useEffect, useCallback, memo } from 'react'
import useDropdown from '@/components/Dropdown'
import CreateGroup from '@/components/CreateGroup'
import ConfirmationModal from '@/modals/ConfirmationModal'
import Ripple from '@/components/Ripple/Ripple'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { FaCheck } from 'react-icons/fa'
import usePortal from '@/hooks/usePortal'
import useSocket from '@/hooks/useSocket'
import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import { useLocation, useNavigate } from 'react-router-dom'

function MessageDropdown({ user }) {
	const [ Modal, nav, hide ] = usePortal('deletemessage')
  const [Dropdown, toggleDropdown] = useDropdown()
  const { auth, setAuth } = useStore()
  const socket = useSocket()
  const { setMessagesWithUsers } = useMessages()
  const navigate = useNavigate()
  const [alsoUsersMessage, setAlsoUsersMessage] = useState(false)
  const { pathname } = useLocation()

  function deleteMessage(id) {
    hide()
    socket.emit('delete-private-message', user._id, alsoUsersMessage, (err, response) => {
      console.log(err, response)
      if(!err) {
        navigate('/', {
          replace: true
        })

        setMessagesWithUsers({
          type: 'remove',
          data: user._id
        })

        return
      }
    })
  }

  useEffect(() => {
    if(pathname != '/deletemessage') {
      setAlsoUsersMessage(false)
    }
  }, [pathname])

  function alsoUsers() {
    setAlsoUsersMessage(!alsoUsersMessage)
  }

	return (
		<div className='relative px-2 sm:px-0'>
      <Ripple onClick={toggleDropdown} className='w-10 h-10 rounded-full flex items-center justify-center ml-auto'>
        <HiOutlineDotsVertical />
      </Ripple>
      <Dropdown>
        <div className='flex text-gray-800 flex-col min-w-[10rem]'>
          <Ripple onClick={nav} className='p-2 hover:bg-gray-800 hover:text-sky-400 text-sm'>
            <span>delete chat</span>
            <Modal>
              <ConfirmationModal msg='are you sure? you will not get back your messages if you continue!' no={() => navigate(-1)} yes={deleteMessage}>
                <div onClick={alsoUsers} className='cursor-pointer flex justify-start w-full items-center gap-2 p-1'>
                  <div className={`${alsoUsersMessage ? 'border-sky-400 text-sky-400' : ''} w-6 h-6 flex-center border-2 rounded-md `}>
                    {
                      alsoUsersMessage ?
                        <FaCheck className='text-sm' />
                      : ''
                    }
                  </div>
                  <p className='text-sm'>also delete from {user.firstName}</p>
                </div>
              </ConfirmationModal>
            </Modal>
          </Ripple>
          {
            auth.user._id != user._id ? 
              <Ripple className='p-2 hover:bg-gray-800 hover:text-sky-400 text-sm'>
                Block user
              </Ripple>
            : ''
          }
        </div>
      </Dropdown>
    </div>
	)
}

export default memo(MessageDropdown, (prevProp, nextProp) => {
  if(prevProp.user._id === nextProp.user._id || prevProp.user.firstName === nextProp.user.firstName) return true

  return false
})