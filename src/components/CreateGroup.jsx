import { useEffect, useState, useRef, memo } from 'react'
import { FaTimes } from 'react-icons/fa'
import Ripple from '@/components/Ripple/Ripple'
import {useMessages} from '@/pages/Home'
import useSocket from '@/hooks/useSocket'
import { useLocation, useNavigate } from 'react-router-dom'

const setValue = (cb) => ev => cb(ev.target.value)
let id = 0

function Radio({name, value}) {
  return (
    <div className='w-3 h-3 flex justify-center items-center border border-sky-400 rounded-full'>
      <div className={`${name == value ? 'bg-sky-400' : ''} w-2 h-2 rounded-full`}></div>
    </div>
  )
}

function CreateGroup() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const form = useRef(null)
  const socket = useSocket()
  const {groupMessages, setGroupMessages} = useMessages()

  const [groupName, setGroupName] = useState('')
  const [groupNameErr, setGroupNameErr] = useState('')
  const [groupType, setGroupType] = useState('public')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupDescriptionErr, setGroupDescriptionErr] = useState('')
  const [groupNickname, setGroupNickname] = useState('')
  const [groupNicknameErr, setGroupNicknameErr] = useState('')
  const [restriction, setRestriction] = useState(false)
  const [restrictionErr, setRestrictionErr] = useState('')
  const [dropDown, setDropDown] = useState(false)
  const [show, setShow] = useState(false)

  const toggleRestriction = () => setRestriction(!restriction)

  const [restrictionType, setRestrictionType] = useState('manual')

  const [questions, setQuestions] = useState([])
  const [correctAnswer, setCorrectAnswer] = useState([])

  const [question, setQuestion] = useState('')
  
  const [correctQuestion, setCorrectQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  let choicesPlaceholder = [
    {
      name: 'A',
      value: ''
    },
    {
      name: 'B',
      value: ''
    },
    {
      name: 'C',
      value: ''
    },
    {
      name: 'D',
      value: ''
    }
  ]
  const [choices, setChoices] = useState(choicesPlaceholder)

  const setChoice = (name, value) => {
    let newChoice = [...choices]
    let choice = newChoice.find(el => el.name == name)
    choice.value = value

    setChoices(newChoice)
  }

  const [type, setType] = useState('simpleAnswer')

  const reset = () => {
    setGroupName('')
    setGroupType('public')
    setType('simpleAnswer')
    setGroupDescription('')
    setGroupNickname('')
    setRestriction(false)
    setDropDown(false)
    setQuestions([])
    setQuestion('')
    setRestrictionType('manual')
    setChoices(choicesPlaceholder)
  }

  const add = () => {
    
    if(restrictionType == 'questionnaire') {
      if(!question.trim()) return
      if(type == 'choice' && !(choices.filter(el => el.value).length >= 2)) return

      if(correctAnswer.length) setCorrectAnswer([])

      setQuestions([
        ...questions,
        {
          id: id++,
          question,
          restrictionType,
          type,
          choices: choices.filter(el => el.value)
        }
      ])

      setQuestion('')
      setChoices(choicesPlaceholder)
    } 
    
    
    if(restrictionType == 'correctAnswer') {
      if(!correctQuestion.trim() || !answer.trim()) return

      if(questions.length) setQuestions([])

      setCorrectAnswer([
        ...correctAnswer,
        {
          id: id++,
          question: correctQuestion,
          restrictionType,
          answer
        }
      ])

      setAnswer('')
      setCorrectQuestion('')
    }
  }

  const removeQuestion = (id) => {
    if(restrictionType == 'correctAnswer') {
      setCorrectAnswer (
        correctAnswer.filter(el => el.id != id)
      )
    } else {
      setQuestions (
        questions.filter(el => el.id != id)
      )
    }    
  }

  useEffect(() => {
    if(pathname == '/creategroup') {
      setShow(true)
    } else {
      setShow(false)
      reset()
    }
  }, [pathname])

  useEffect(() => {
    var height = form?.current?.getBoundingClientRect()?.height
    if(window.innerHeight == height) {
      form.current.style.borderRadius = '0'
    } else if(form.current) {
      form.current.style.borderRadius = '5px'
    }
  })

  const back = () => navigate(-1)
  
  function create() {
    
    if(groupName) {
      setGroupNameErr('')
      setGroupDescriptionErr('')
      setGroupNicknameErr('')
      setRestrictionErr('')

      let groupInfo = { groupName, groupType, groupDescription, groupNickname }

      if(restriction && restrictionType == 'questionnaire') {
        groupInfo.restriction = {
          type: restrictionType,
          questionnaire: questions
        }
      } else if(restriction && restrictionType == 'correctAnswer') {
        groupInfo.restriction = {
          type: restrictionType,
          correctAnswer
        }
      } else if (restriction) {
        groupInfo.restriction = {type: restrictionType}
      }

      socket.emit('create-group', groupInfo, (err, response) => {
        console.log(err, response)
        if(err) {
          Object
            .keys(err)
            .forEach(error => {
              setError(error, err[error])
            })

          let e = form.current.querySelector('.error')
          if(!([...e?.classList]?.includes('restriction'))) {
            e?.previousElementSibling?.firstElementChild?.select()
            e?.previousElementSibling?.firstElementChild?.focus()
          }

          return
        }

        setGroupMessages({
          type: 'initial',
          data: [
            {
              id: response?.group?._id,
              members: [response?.member],
              unread: 0,
              group: response?.group,
              messages: []
            }
          ]
        })

        navigate(`/group/${response?.group?._id}`, {
          replace: true
        })
      })
    }
  }

  function setError(name, message) {
    switch(name) {
      case 'name':
        setGroupNameErr(message)
        break
      case 'description':
        setGroupDescriptionErr(message)
        break
      case 'membersNickname':
        setGroupNicknameErr(message)
        break
      case 'restriction':
        setRestrictionErr(message)
        break
      default:
        break
    }
  }

  return (
    <>
      {
        show ?
          <div onClick={back} className='z-50 fixed inset-0 bg-black/50 flex justify-center items-center'>
            <form ref={form} onClick={(ev) => ev.stopPropagation()} className='w-[22rem] rounded-md max-h-full overflow-y-auto bg-white flex flex-col'>
              <h2 className='p-2 z-20 sticky top-0 font-medium border-b text-sky-400 bg-gray-800 border-gray-800/40'>Create Group</h2>
              <div className='flex flex-col p-2 gap-1'>
                <label htmlFor='groupName' className='text-base text-gray-900'>name</label>
                <div className='w-full text-sm border rounded-md overflow-hidden'>
                  <input onChange={setValue(setGroupName)} id='groupName' className='flex-1 p-2 w-full' placeholder='a verey awesome group' name='groupName' type='text' />
                </div>
                {
                  groupNameErr ?
                    <p className='text-red-500 text-sm error'>{groupNameErr}</p>
                  : ''
                }
              </div>
              <div className='flex flex-col p-2 gap-1'>
                <label htmlFor='groupDescription' className='text-base text-gray-900'>description</label>
                <div className='w-full text-sm border rounded-md overflow-hidden'>
                  <textarea onChange={setValue(setGroupDescription)} rows='5' id='groupDescription' className='flex-1 p-2 w-full resize-none' placeholder='the only ones' name='groupDescription' />
                </div>
                {
                  groupDescriptionErr ?
                    <p className='text-red-500 text-sm error'>{groupDescriptionErr}</p>
                  : ''
                }
              </div>
              <div className='flex flex-col p-2 gap-1'>
                <label htmlFor='groupNickname' className='text-base text-gray-900'>members nickname(optional)</label>
                <div className='w-full text-sm border rounded-md overflow-hidden'>
                  <input onChange={setValue(setGroupNickname)}  id='groupNickname' className='flex-1 p-2 w-full resize-none' placeholder='great ppl' name='groupNickname' />
                </div>
                {
                  groupNicknameErr ?
                    <p className='text-red-500 text-sm error'>{groupNicknameErr}</p>
                  : ''
                }
                <p className='text-xs text-gray-500 px-1'>10 {groupNickname || 'great ppl'} are online</p>
              </div>
              <div className='flex flex-col p-2 gap-1'>
                <label htmlFor='type' className='text-base text-gray-900'>type</label>
                <div className='w-full flex flex-col text-sm border rounded-md overflow-hidden'>
                  <Ripple type='p' color='#fff8' onClick={() => setDropDown(!dropDown)} className='p-2 border-b w-full bg-gray-800 text-sky-400'>{groupType}</Ripple>
                  {
                    dropDown ? 
                      <div className='w-full flex flex-col top-full'>
                        <Ripple type='p' color='#0008' className='p-2 w-full' onClick={() => {
                          setGroupType('public')
                        }}>public</Ripple>
                        <Ripple type='p' color='#0008' className='p-2 w-full' onClick={() => {
                         setGroupType('private')
                        }}>private</Ripple>
                      </div>
                    : ''
                  }
                </div>
              </div>
              <div className='flex flex-col p-2 gap-1'>
                <label htmlFor='groupNickname' className='text-base flex justify-between text-gray-900'>
                  join restriction{groupType == 'public' && !restriction ? '(no restriction)'  : ''}
                  {
                    groupType == 'public' ?
                    <Ripple onClick={toggleRestriction} className='rounded-md ml-auto px-2 py-1 border text-sm' type='p'>
                      <span>{ restriction ? 'remove' : 'add' } restriction</span>
                    </Ripple>
                    : ''
                  }
                </label>
                {
                  restrictionErr ?
                    <p className='text-red-500 text-sm error restriction'>{restrictionErr}</p>
                  : ''
                }
                {
                  groupType == 'private' || restriction ?
                    <>
                      <div className='text-sm gap-1 flex flex-col'>
                        <p>types of restriction</p>
                        <div className='flex justify-between'>
                          <div onClick={() => setRestrictionType('manual')} className='flex items-center cursor-pointer gap-1'>
                            <Radio name='manual' value={restrictionType} />
                            <span>manual</span>
                          </div>
                          <div onClick={() => setRestrictionType('questionnaire')} className='flex items-center cursor-pointer gap-1'>
                            <Radio name='questionnaire' value={restrictionType} />
                            <span>questionnaire</span>
                          </div>
                          <div onClick={() => setRestrictionType('correctAnswer')} className='flex items-center cursor-pointer gap-1'>
                            <Radio name='correctAnswer' value={restrictionType} />
                            <span>correct answer</span>
                          </div>
                        </div>
                        {
                          restrictionType == 'manual' ? 
                            <span className='text-xs text-gray-600 px-1'>you personally have to accept or decline a join request</span>
                          : ''
                        }
                        {
                          restrictionType == 'questionnaire' ?
                            <div className='flex flex-col gap-2 p-2 border'>
                              <span className='text-xs text-gray-600'>ask a set of questions before joining</span>
                              <div className='flex flex-col gap-1'>
                                {
                                  questions.map(el => {
                                    return (
                                      <div className='flex items-center border' key={el.id}>
                                        <p className='flex-1 p-1 overflow-hidden text-ellipsis whitespace-nowrap'>{el.question}</p>
                                        <span className='text-xs bg-gray-800 text-sky-400 px-1 rounded-md'>{el.type == 'simpleAnswer' ? 'simple answer' : el.type}</span>
                                        <Ripple onClick={() => removeQuestion(el.id)} className='w-8 flex justify-center items-center h-full'>
                                          <FaTimes />
                                        </Ripple>
                                      </div>
                                    )
                                  })
                                }
                                {
                                  questions.length < 10 ?
                                    <>
                                      <div className='flex flex-col gap-1 mt-2'>
                                        <div className='flex'>
                                          <div className='flex flex-1'>
                                            <input value={question} onChange={setValue(setQuestion)} id='question' className='w-full flex-1 p-2 border rounded-md' type='text' name='question' placeholder='question' />
                                          </div>
                                        </div>
                                        <div className='relative flex flex-col'>
                                          <div className='flex justify-between'>
                                            <div onClick={() => setType('simpleAnswer')} className='flex items-center cursor-pointer gap-2'>
                                              <Radio name='simpleAnswer' value={type} />
                                              simple answer
                                            </div>
                                            <div onClick={() => setType('choice')} className='flex items-center cursor-pointer gap-2'>
                                              <Radio name='choice' value={type} />
                                              choice
                                            </div>
                                            <div onClick={() => setType('description')} className='flex items-center cursor-pointer gap-2'>
                                              <Radio name='description' value={type} />
                                              description
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {
                                        type == 'choice' ?
                                          <div className='flex flex-col gap-2'>
                                            <p className='text-xs text-gray-600'>at least 2 choices</p>
                                            {
                                              choices.map(el => {
                                                return (
                                                  <div key={el.name} className='flex flex-col'>
                                                    <span className='px-1'>{el.name}</span>
                                                    <input className='p-1 rounded-md border' placeholder='choice' name={el.name} value={el.value} onChange={(ev) => setChoice(el.name, ev.target.value)} />
                                                  </div>
                                                )
                                              })
                                            }
                                          </div>
                                        : ''
                                      }
                                      <div className='flex justify-end'>
                                        <Ripple onClick={add} className='px-2 py-1 rounded-md border'>
                                          add
                                        </Ripple>
                                      </div>
                                    </>
                                  : <p className='py-1 text-sm text-gray-600'>max questionnaire reached</p>
                                }
                              </div>
                            </div>
                          : ''
                        }
                        {
                          restrictionType == 'correctAnswer' ?
                            <div className='flex flex-col gap-2 p-2 border'>
                              <span className='text-xs text-gray-600'>people who join have to answer the question correctly</span>
                              <div className='flex flex-col gap-1'>
                                {
                                  correctAnswer.map(el => {
                                    return (
                                      <div className='flex items-center border' key={el.id}>
                                        <p className='flex-1 p-1 overflow-hidden text-ellipsis whitespace-nowrap'>{el.question}</p>
                                        <span className='text-sky-400 bg-gray-800 px-2 text-xs rounded-lg'>{el.answer}</span>
                                        <Ripple onClick={() => removeQuestion(el.id)} className='w-8 flex justify-center items-center h-full'>
                                          <FaTimes />
                                        </Ripple>
                                      </div>
                                    )
                                  })
                                }
                              </div>
                              <div className='flex flex-col'>
                                <div className='flex flex-col'>
                                  <span className='text-gray-800 p-1 text-sm'>question</span>
                                  <div className='flex flex-1'>
                                    <input value={correctQuestion} onChange={setValue(setCorrectQuestion)} id='question' className='w-full flex-1 p-1 border rounded-md' type='text' name='question' placeholder='question' />
                                  </div>
                                  <span className='text-gray-800 p-1 text-sm mt-2'>answer</span>
                                  <div className='flex flex-1'>
                                    <input value={answer} onChange={setValue(setAnswer)} id='question' className='w-full flex-1 p-1 border rounded-md' type='text' name='question' placeholder='question' />
                                  </div>
                                </div>
                                <div className='flex justify-end mt-2'>
                                  <Ripple onClick={add} className='px-2 py-1 rounded-md border'>
                                    add
                                  </Ripple>
                                </div>
                              </div>
                            </div>
                          : ''
                        }
                      </div>
                    </>
                  : ''
                }
              </div>
              <div className='p-2 gap-1 border-t flex w-full'>
                <Ripple color='#0008' onClick={back} className='px-4 py-1 rounded-md text-gray-800 border ml-auto'>
                  cancel
                </Ripple>
                <Ripple color='#fff8' onClick={create} className='px-4 overflow-hidden border-none py-1 border bg-gray-800 text-sky-400 rounded-md'>
                  create
                </Ripple>
              </div>
            </form>
          </div>
        : ''
      }
    </>
  )
}

export default CreateGroup