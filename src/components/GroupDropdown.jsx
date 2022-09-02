import useDropdown from '@/components/Dropdown'
import CreateGroup from '@/components/CreateGroup'
import ConfirmationModal from '@/modals/ConfirmationModal'
import Ripple from '@/components/Ripple/Ripple'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import usePortal from '@/hooks/usePortal'
import useSocket from '@/hooks/useSocket'
import { useMessages } from '@/pages/Home'
import { useStore } from '@/store/store'
import { useLocation, useNavigate } from 'react-router-dom'

function GroupDropdown({ group }) {
	const [ Modal, nav, hide ] = usePortal('deletegroup')
  const [ EditGroupModal, editGroupNav, hideEditGroup ] = usePortal('editgroup/'+group._id)
  const [Dropdown, toggleDropdown] = useDropdown()
  const { auth, setAuth } = useStore()
  const socket = useSocket()
  const { setGroupMessages, openedGroupMessages, setOpenedGroupMessages } = useMessages()
  const navigate = useNavigate()

  function deleteGroup(id) {
    hide()
    socket.emit('delete-group', id, (err, response) => {
      if(!err) {
        navigate('/', {
          replace: true
        })

        setGroupMessages({
          type: 'remove',
          data: id
        })
      }
    })
  }

  function joinOrLeave() {
    let member = group.members.includes(auth.user._id)

    socket.emit('join', group._id, '', (err, response) => {
      if(member) {
        setAuth({
          type: 'update',
          data: {
            name: 'groups',
            value: response?.groups
          }
        })


        if(group.restriction) {
          navigate('/', {
            replace: true
          })

          let r = openedGroupMessages.filter(el => el.id != group._id)
          setOpenedGroupMessages(r)
          setGroupMessages({
            type: 'remove',
            data: group._id
          })
        } else {
          setGroupMessages({
            type: 'remove_member',
            data: {
              id: group._id,
              member: auth.user._id
            }
          })
        }
      } else {
        setAuth({
          type: 'update',
          data: {
            name: 'groups',
            value: [...(new Set([...auth.user.groups, {id: group._id, lastSeenMessage: Date.now(), pending: false}]))]
          }
        })

        
        setGroupMessages({
          type: 'add_member',
          data: {
            id: group._id,
            members: response.members
          }
        })
      }
    })

  }

	return (
		<div className='relative'>
      <Ripple onClick={toggleDropdown} className='w-10 h-10 dropdown-handler rounded-full flex items-center justify-center ml-auto'>
        <HiOutlineDotsVertical />
      </Ripple>
      <Dropdown>
        <div className='flex flex-col text-gray-900 min-w-[10rem]'>
          {
            group.creator != auth.user._id &&
              <Ripple onClick={joinOrLeave} className='p-2 w-full text-sm hover:bg-gray-800 hover:text-sky-400'>
                {group.members.includes(auth.user._id) ? 'leave group' : 'join'}
              </Ripple>
          }
          {
            group.creator == auth.user._id &&
              <>
                <Ripple onClick={nav} className='p-2 w-full text-sm hover:bg-gray-800 hover:text-sky-400'>
                  delete group
                  <Modal>
                    <ConfirmationModal msg='are you sure? there is no going back after this!' yes={() => deleteGroup(group._id)} no={() => hide()} />
                  </Modal>
                </Ripple>
                <Ripple onClick={editGroupNav} className='p-2 w-full text-sm hover:bg-gray-800 hover:text-sky-400'>
                  edit
                  <EditGroupModal>
                    <CreateGroup></CreateGroup>
                  </EditGroupModal>
                </Ripple>
              </>
          }
        </div>
      </Dropdown>
    </div>
	)
}

export default GroupDropdown