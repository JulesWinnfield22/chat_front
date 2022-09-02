import {memo, useEffect, useRef, useMemo, useState} from 'react'
import { FaStar } from 'react-icons/fa'
import { useLocation, useNavigate, } from 'react-router-dom'
import UserImage from '@/components/UserImage.jsx'
import Ripple from '@/components/Ripple/Ripple'
import Tabs from '@/components/Tabs/Tabs'
import { LoadingElli } from '@/components/Loading'
import useMultipleLoading from '@/hooks/useMultipleLoading'
import useDropdown from '@/components/Dropdown'
import SharedMedia from '@/components/SharedMedia'
import GroupDropdown from '@/components/GroupDropdown'
import {useWhenVisible} from '@/components/whenVisible'
import { CgArrowLeft, CgChevronDoubleDown } from 'react-icons/cg'
import { HiOutlineDotsVertical } from 'react-icons/hi'

import useSocket from '@/hooks/useSocket'
import {useStore} from '@/store/store'
import { useMessages } from '@/pages/Home'
import {screens} from 'tailwindcss/defaultTheme'

function Members({ group }) {

  return (
    <div className='flex flex-col w-full'>
      {
        group.members.map(el => {
          return (
            <div key={el._id} className='group cursor-pointer flex gap-2 p-1 hover:bg-gray-800'>
              <UserImage className='bg-transparent' id={el._id} size='xs' />
              <div className='flex-1 flex flex-col'>
                <span className='group-hover:text-gray-300 text-gray-800 text-sm'>{el.firstName} {el.lastName}</span>
                <span className='text-xs text-sky-600'>{el.username}</span>
              </div>
              {
                group.group.creator == el._id ?
                  <div className='w-12 flex justify-center items-center text-sky-600'>
                    <FaStar />
                  </div>
                : ''
              }
            </div>
          )
        })
      }
    </div>
  )
}

function JoinRequest({ group }) {
  const [joinRequests, setJoinRequests] = useState([])
  const socket = useSocket()
  const whenVisible = useWhenVisible()
  const joinReqEle = useRef()
  const { setGroupMessages } = useMessages()

  useEffect(() => {
    whenVisible(joinReqEle.current, () => {
      if(!group.joinRequests) {
        socket.emit('join-requests', group.id, (err, response) => {
          setGroupMessages({
            type: 'add_join_requests',
            data: {
              id: group.id,
              joinRequests: response
            }
          })
        })
      }
    })
  }, [])

  function accept(user) {
    socket.emit('group-join-accepted', user._id, group.id, (err, response) => {
      if(!err) {
        setGroupMessages({
          type: 'add_member',
          data: {
            id: group.id,
            member: user
          }
        })

        setGroupMessages({
          type: 'remove_join_request',
          data: {
            id: group.id,
            member: user._id
          }
        })
      }
    })
  }

  function decline(user) {
    socket.emit('group-join-declined', user._id, group.id, (err, response) => {
      if(!err) {
        setGroupMessages({
          type: 'remove_join_request',
          data: {
            id: group.id,
            member: user._id
          }
        })
      }
    })
  }

  return (
    <div className='flex flex-col' ref={joinReqEle}>
      {
        group.joinRequests &&
        group.joinRequests.map((el) => {
          return (
            <div key={el._id} className='group cursor-pointer flex items-center gap-2 p-1 hover:bg-gray-800'>
              <UserImage className='bg-transparent' id={el._id} size='xs' />
              <div className='flex-1 flex flex-col'>
                <span className='group-hover:text-gray-300 text-gray-800 text-sm'>{el.firstName} {el.lastName}</span>
                <span className='text-xs text-sky-600'>{el.username}</span>
              </div>
              <div className='flex gap-2 text-sm'>
                <Ripple onClick={() => decline(el)} className='px-2 py-1 h-8 rounded-md group-hover:text-gray-300 border'>decline</Ripple>
                <Ripple onClick={() => accept(el)} className='px-2 py-1 h-8 rounded-md group-hover:border-sky-400 group-hover:border bg-gray-800 text-sky-400'>accept</Ripple>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

function CorrectAnswers({ group }) {
  const socket = useSocket()
  const correctAnsEle = useRef()
  const whenVisible = useWhenVisible()
  const { setGroupMessages } = useMessages()

  // useEffect(() => {
  //   whenVisible(correctAnsEle.current, () => {
  //     if(!group.correctAnswers) {
  //       // socket.emit('questionnaire-answers', group.id, (err, response) => {
  //       //   console.log(err, response)
  //       //   // setGroupMessages({
  //       //   //   type: 'add_correct_answers',
  //       //   //   data: {
  //       //   //     id: group.id,
  //       //   //     answers: response
  //       //   //   }
  //       //   // })
  //       // })
  //     }
  //   })
  // }, [])

  return (
    <div ref={correctAnsEle}>hi</div>
  )
}

function QuestionnaireAnswers({ group }) {
  const socket = useSocket()
  const questionnaireAnsEle = useRef()
  const whenVisible = useWhenVisible()
  const { setGroupMessages } = useMessages()

  useEffect(() => {
    whenVisible(questionnaireAnsEle.current, () => {
      if(!group.questionnaireAnswers) {
        socket.emit('questionnaire-answers', group.id, (err, response) => {
          setGroupMessages({
            type: 'add_questionnaire_answers',
            data: {
              id: group.id,
              answers: response
            }
          })
        })
      }
    })
  }, [])

  return (
    <div className='flex flex-col gap-2 p-2' ref={questionnaireAnsEle}>
      {
        group.questionnaireAnswers &&
        group.questionnaireAnswers.map(el => {
          return (
            <div key={el._id} className='flex flex-col border overflow-hidden rounded-md'>
              <div className='group border-b cursor-pointer flex items-center gap-2 p-1 hover:bg-gray-800' >
                <UserImage className='bg-transparent shadow-none' id={el.user._id} size='xs' />
                <div className='flex-1 flex flex-col'>
                  <span className='group-hover:text-gray-300 text-gray-800 text-sm'>{el.user.firstName} {el.user.lastName}</span>
                  <span className='text-xs text-sky-600'>{el.user.username}</span>
                </div>
              </div>
              {
                el.questionnaire.map(q => {
                  return (
                    <div key={q._id} className='flex flex-col p-1 border-b last:border-none'>
                      <p className='text-base text-gray-900'>Q, {q.question}</p>
                      <p className='text-sm text-gray-600'>A, {q.answer}</p>
                    </div>
                  )
                })
              }
            </div>
          )
        })
      }
    </div>
  )
}

function GroupOpenedMessageSidepanel() {
  const [showSidePanel, setShowSidePanel] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { openedGroupMessages, groupMessages, chatType } = useMessages()

  useEffect(() => {
    const observer = new ResizeObserver((entries, observer) => {
      entries.forEach(entry => {
        const width = entry.contentRect.width
        if(pathname == '/infogroup' && width > parseInt(screens.lg)) {
          navigate(-1)
          setShowSidePanel(false)
        } else if(pathname == '/infogroup' && width < parseInt(screens.lg)) {
          setShowSidePanel(true)
        } else {
          setShowSidePanel(false)
        }
        // if(width)
      })
    })

    observer.observe(document.body)
    return () => {
      observer.unobserve(document.body)
    }
  }, [pathname])

  function handleClick(ev) {
    if(ev.target.className.includes('sidepanel-parent')) {
      navigate(-1)
    }
  }

  return (
    <div onClick={handleClick} className={`${chatType == 'group' ? 'z-50' : 'z-40 hidden'} ${showSidePanel ? 'left-0' : 'left-full'} sidepanel-parent fixed w-full h-screen top-0 lg:left-0 lg:h-full lg:relative col-start-10 col-end-13 sm:bg-black/30 bg-white`}>
      {
        openedGroupMessages.map(item => {
          return (
            <View group={groupMessages.find(el => el.group._id == item.id)} active={item.active} key={item.id} />
          )
        })
      }
    </div> 
  )
}

function View({ group, active }) {
  const { auth } = useStore()
  const { openedGroupMessages, groupMessages, setGroupMessages } = useMessages()
  const navigate = useNavigate()
  
  const  getGroup = () => group.group 
  const  getMembers = () => group.members 
  
  const [loading, setLoading] = useState(false)

  const [Dropdown, toggleDropdown] = useDropdown()

  let tabs = [
    {name: 'members', component: Members, props: {group}},
    {name: 'shared media', component: SharedMedia, props: {
      className: 'border-0'
    }}
  ]

  if(group.group.restriction && group.group.creator == auth.user._id) {
    let restriction = group.group.restriction

    if(['manual', 'questionnaire'].includes(restriction.type)) {
      let type = restriction.type == 'manual' ? 'join request' : restriction.type
      let com = restriction.type == 'manual' ? JoinRequest : QuestionnaireAnswers

      tabs.push({
        name: type,
        component: com,
        props: {
          group
        }
      })
    }
  }

  return (
    <div className={`${active ? 'z-20' : 'z-10'} lg:border-l border-gray-800/40 absolute absolute-center w-full sm:max-w-[22rem] sm:w-[22rem] flex flex-col gap-2 items-center lg:w-full h-full overflow-y-auto bg-white`}>
      <div className='w-full bg-white flex flex-col justify-center items-center '>
        <div className='lg:hidden bg-gray-900 lg:bg-transparent lg:text-gray-900 text-gray-400 w-full h-12 flex items-center justify-between'>
          <Ripple onClick={() => navigate(-1)} className='h-10 w-10 flex-center rounded-full'>
            <CgArrowLeft />
          </Ripple>
          <p className='uppercase'>{getGroup()?.name}</p>
          <GroupDropdown group={getGroup()} />
        </div>
        <div className='flex w-full lg:bg-transparent lg:text-gray-900 bg-gray-900 text-gray-400 p-2 gap-2 border-b'>
          <UserImage className='bg-transparent shadow-none' id={getGroup()._id} size='xl' />
          <div className='flex-1 flex flex-col justify-end w-full pb-3'>
            <span className='hidden lg:flex text-lg font-bold text-sky-500'>
              {getGroup()?.name} 
            </span>
            <p className='text-sm leading-none text-gray-500 w-full'>
              {
                getGroup()?.description || 'no description for this group'
              }
            </p>
          </div>
        </div>
        <div className='flex gap-2 w-full p-2'>
          <div className='flex flex-col border-2 border-sky-400 text-gray-800 items-center rounded-md p-2'>
            <span className='text-xl'>{getGroup()?.members.length}</span>
            <span className='text-xs lowercase font-mono'>
              {
                getGroup()?.members.length > 1 ? 'members' : 'member'
              }
              </span>
          </div>
        </div>
      </div>
      <Tabs tabs={tabs} />
    </div>
  )
}

export default GroupOpenedMessageSidepanel