
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import { FaSignOutAlt, FaCog } from 'react-icons/fa'
import { MdGroupAdd } from 'react-icons/md'
import Ripple from '@/components/Ripple/Ripple'
import UserImage from '@/components/UserImage'
import {useMessages} from '@/pages/Home'
import useSocket from '@/hooks/useSocket'
import axios from "@/api/axios"

const setVal = (cb) => ev => cb(ev.target.value.trim())

function Manual({group}) {
	const {setAuth} = useStore()
	const [message, setMessage] = useState()
	const [err, setErr] = useState('')
	const socket = useSocket()

	function join() {
		socket.emit('join', group._id, '', (err, response) => {
			if(!err) {
				setAuth({
					type: 'update',
					data: {
						name: 'groups',
						value: response
					}
				})
				setMessage('the admin will responed when they feel like it.')
			} else {
				setErr(err)
			}
		})
	}

	return (
		<div className='flex flex-col w-full h-screen bg-white sm:w-[22rem]'>
			<p className='h-12 flex px-2 font-medium items-center bg-gray-800 text-sky-400 '>
				Restriction
			</p>
			<p className='text-gray-600 text-sm p-2 border-b'>
				send a join request and the admin will responed as soon as posible
			</p>
			{
				err ?
					<p className='text-red-500 text-sm p-2'>{err}</p>
				: ''
			}
			{
				message ?
					<p className='text-sky-600 text-base p-2'>{message}</p>
				: ''
			}
			{
				!message ?
					<Ripple onClick={join} className='px-4 py-1 rounded-md m-2 bg-gray-800 text-sky-400 ml-auto' type='button'>
						join
					</Ripple>
				: ''
			}
		</div>
	)
}

function CorrectAnswer({ group = {} }) {
	const [err, setErr] = useState('')
	const { groupMessages, setGroupMessages } = useMessages()
	const [answers, setAnswers] = useState([...group.restriction.correctAnswer].map(q => ({
		question: q.question,
		answer: ''
	})))

	const navigate = useNavigate()

	const socket = useSocket()

	function join() {
		socket.emit('join', group._id, answers, (err, response) => {
			if(!err) {
				setGroupMessages({
					type: 'initial',
					data: [response]
				})

				navigate(`/group/${response.id}`, {
					replace: true
				})
			} else {
				setErr(err)
			}
		})
	}

	function setAnswer(q, a) {
		setAnswers([
			...answers.map(el => {
				if(el.question == q) {
					el.answer = a
				}
				return el
			})
		])
	}

	return (
		<form  onSubmit={(ev) => ev.preventDefault() } className='flex flex-col w-full h-screen bg-white sm:w-[22rem]'>
			<p className='h-12 flex px-2 font-medium items-center bg-gray-800 text-sky-400 '>
				Restriction
			</p>
			<p className='text-gray-600 text-sm p-2'>answer the following questions correctly in order to join the group</p>
			{
				err ?
					<p className='text-red-500 text-sm p-2'>{err}</p>
				: ''
			}
			{
				group.restriction.correctAnswer.map((el, idx) => {
					return (
						<div className='text-sm border-b p-2 flex flex-col gap-1' key={idx}>
							<label htmlFor={el.question}>{idx + 1}, {el.question}</label>
							<input onChange={(ev) => setAnswer(el.question, ev.target.value.trim())} id={el.question} className='p-2 rounded-md border' placeholder='answer' />
						</div>
					)
				})
			}
			<Ripple onClick={join} className='px-4 py-1 rounded-md m-2 bg-gray-800 text-sky-400 ml-auto' type='button'>
				join
			</Ripple>
		</form>
	)
}

function Questionnaire({group = {}}) {
	const { groupMessages, setGroupMessages } = useMessages()
	const [err, setErr] = useState('')
	const [answers, setAnswers] = useState([...group.restriction.questionnaire].map(q => ({
		question: q.question,
		answer: ''
	})))

	const navigate = useNavigate()

	const socket = useSocket()

	function setAnswer(q, a) {
		setAnswers([
			...answers.map(el => {
				if(el.question == q) {
					el.answer = a
				}
				return el
			})
		])
	}


	function join() {
		socket.emit('join', group._id, answers, (err, response) => {
			if(!err) {
				setGroupMessages({
					type: 'initial',
					data: [response]
				})

				navigate(`/group/${response.id}`, {
					replace: true
				})
			} else {
				setErr(err)
			}
		})
	}

	return (
		<form onSubmit={(ev) => ev.preventDefault()} className='flex flex-col w-full h-screen bg-white sm:w-[22rem]'>
			<p className='h-12 flex px-2 font-medium items-center bg-gray-800 text-sky-400 '>
				Restriction
			</p>
			<p className='text-gray-600 text-sm p-2'>answer the following questionnaires in order to join the group</p>
			{
				err ?
					<p className='text-red-500 text-sm'>{err}</p>
				: ''
			}
			{
				group.restriction.questionnaire.map((el, idx) => {
					return (
						<div key={el.question} className='p-2 border-b last:border-b-0 text-sm flex flex-col'>
							<label htmlFor={el.question} className='py-1'>{idx + 1}, {el.question}</label>
							{
								el.type == 'simpleAnswer' ?
									<input placeholder='answer...' className='p-2 border rounded-md' onChange={(ev) => setAnswer(el.question, ev.target.value.trim())}  />
								: ''
							}
							{
								el.type == 'choice' ?
									<>
										{
											el.choices.map((cho, idx) => {
												return (
													<p key={idx} onClick={(ev) => setAnswer(el.question, cho.value)} className={`${answers.find(ans=> ans.question == el.question)?.answer == cho.value ? 'bg-gray-800 text-sky-400' : 'text-gray-600'} h-8 flex items-center w-full hover:bg-gray-800 hover:text-sky-400 px-2 cursor-pointer`}>
														{idx == 0 ? 'A, ' : ''}
														{idx == 1 ? 'B, ' : ''}
														{idx == 2 ? 'C, ' : ''}
														{idx == 3 ? 'D, ' : ''}
														{cho.value}
													</p>
												)
											})
										}
									</>
								: ''
							}
							{
								el.type == 'description' ?
									<textarea onChange={(ev) => setAnswer(el.question, ev.target.value.trim())} placeholder='answer...' className='p-2 border rounded-md resize-none' rows='5'  />
								: ''
							}
						</div>
					)
				})
			}
			<Ripple onClick={join} className='px-4 py-1 rounded-md m-2 bg-gray-800 text-sky-400 ml-auto' type='button'>
				join
			</Ripple>
		</form>
	)
}

function Restriction() {
  const navigate = useNavigate()
  const { pathname, state } = useLocation()
  const [show, setShow] = useState(false)
  const { auth } = useStore()

  useEffect(() => {
    if(pathname == '/restriction') {
  		if(!state || !state?.group) navigate(-1)
    }
  }, [pathname])

  // if(pathname == '/restriction') {
		// if(!state || !state?.group) navigate(-1)
  // } else {
  return (
  	<>
			{
				state?.group?.restriction?.type == 'questionnaire' ?
					<Questionnaire group={state.group} />
				: ''
			}
			{
				state?.group?.restriction?.type == 'correctAnswer' ?
					<CorrectAnswer group={state.group} />
				: ''
			}
			{
				state?.group?.restriction?.type == 'manual' ?
					<Manual group={state.group} />
				: ''
			}
  	</>
  )
  // }
}

export default Restriction