import useSocket from '@/hooks/useSocket'
import UserImage from '@/components/UserImage'
import Restriction from '@/components/Restriction'
import { useStore } from '@/store/store'
import Ripple from '@/components/Ripple/Ripple'
import {useMessages} from '@/pages/Home'

import usePortal from '@/hooks/usePortal'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Search({active, val}) {
  const {setMessagesWithUsers, setGroupMessages} = useMessages()
  const navigate = useNavigate()
	const socket = useSocket()
	const { auth } = useStore()

	let urlOptions = {}

	const [Modal, nav, hide] = usePortal('restriction', {
    urlOptions: urlOptions
  })

  function openMessage(user) {
  	setMessagesWithUsers({
	    type: 'initial',
	    data: [{
	    	id: user._id,
				messages: [],
				user,
				unread: 0
	    }]
	  })

	  navigate(`/message/${user._id}`)
  }

  function openGroup(group) {
  	if(!group.restriction) {
  		socket.emit('group', group._id, (err, response) => {
  			setGroupMessages({
		      type: 'initial',
		      data: [response]
		    })

		    navigate(`/group/${response.id}`)

  		})
  	} else {

  		urlOptions.state = {
  			group
  		}

  		nav()
  		// navigate('/restriction', {
  		// 	state: {
  		// 		group
  		// 	}
  		// })
  	}

  }

	const [searchResult, setSearchResult] = useState({
		users: [],
		groups: []
	})	

	useEffect(() => {
		if(!val) {
			setSearchResult({
				users: [],
				groups: []
			})
		}
		
		socket.emit('search', val, '', (err, response) => {
			setSearchResult(response)
		})
	}, [val])


	function highLight(name) {
		let el = []
		if(val.length > 1) {
			for(let i = 0; i < name.length;) {
				if(name.substring(i, val.length + i).toLowerCase() == val.toLowerCase()) {
					el.push(<mark key={i}>{name.substring(i, val.length + i)}</mark>)
					i+=val.length
				} else {
					el.push(name[i])
					i++
				}
			}
		} else {
			return name
				.split('')
				.map((el, idx) => {
					if(el.toLowerCase() == val.toLowerCase())
						return <mark key={idx} className='group-hover:bg-gray-300'>{el}</mark>
					else return el
				})
		}

		return el
	}


	return (
    <div className={`${active != 'search' ? 'z-10' : 'z-20'} absolute w-full h-full bg-white flex-1 flex flex-col overflow-y-auto`}>
			<div className='flex gap-2 text-xs font-mono p-1 bg-black/10'>
				<span className='px-2 bg-gray-800 text-sky-400 rounded-lg'>ppl</span>
				<span className='px-2 bg-gray-800 text-sky-400 rounded-lg'>group</span>
			</div>
			<div className='flex flex-col h-full'>
				{
					!searchResult?.users?.length && !searchResult?.groups?.length ?
						<div className='flex-1 text-sm flex justify-center items-center'>
							no search result
						</div>
					: ''
				}
				{
					searchResult?.users && searchResult?.users?.length ?
						<>
							<p className='p-2 bg-gray-800 text-sm text-sky-400'>people</p>
							{
								searchResult?.users?.map(el => {
									return (
										<Ripple onClick={() => openMessage(el)} color='#ddd' className='group hover:bg-gray-800 cursor-pointer flex gap-2 p-2 text-sm items-center' key={el._id}>
											<UserImage id={el._id} />
											<div className='flex-1 flex flex-col'>
												<div className='flex text-sm gap-1'>
													<p className='group-hover:text-gray-300 tracking-wide'>
														{
															el.firstName.toLowerCase().includes(val) ?
																<>
																	{
																		val.length > 1 ?
																			<>
																				{
																					highLight(el.firstName)																				
																				}
																			</>
																		: highLight(el.firstName)	
																	}
																</>
															: el.firstName
														}
													</p>
													<p className='group-hover:text-gray-300 tracking-wide'>
														{
															el.lastName.toLowerCase().includes(val) ?
																highLight(el.lastName)	
															: el.lastName
														}
													</p>
												</div>
												<p className='text-sky-600'>
													{
														el.username.toLowerCase().includes(val) ?
															highLight(el.username)
														: el.username
													}
												</p>
											</div>
										</Ripple>
									)
								})
							}
						</>
					: ''
				}
				{
					searchResult?.groups && searchResult?.groups?.length ?
						<>
							<p className='p-2 bg-gray-800 text-sm text-sky-400'>groups</p>
							{
								searchResult.groups.map(el => {
									let pending = auth.user?.groups?.find(gr => gr.id == el._id)?.pending
									return (
										<Ripple onClick={() => !pending && openGroup(el)} color='#ddd' className='group hover:bg-gray-800 cursor-pointer flex gap-2 p-2 text-sm items-center' key={el._id}>
											<UserImage id={el._id} />
											<div className='flex-1 flex flex-col'>
												<div className='flex text-sm gap-1'>
													<p className='group-hover:text-gray-300 tracking-wide'>
														{
															el.name.toLowerCase().includes(val) ?
																highLight(el.name)
															: el.name
														}
													</p>
												</div>
												<p className='flex text-sky-600 text-xs gap-1'>
													{
														el.members.length > 1 ?
															<>{el.members.length} members</>
														: <>{el.members.length} member</>
													}	
													{
														<span> {el.type} {el?.restriction?.type}</span>
													}
													{
														pending ?
															<span className='ml-auto text-xs text-sky-600 px-2 bg-gray-800 rounded-md'>pending</span>
														: ''
													}
												</p>
											</div>
										</Ripple>
									)
								})
							}
							<Modal>
								<Restriction />
							</Modal>
						</>
					: ''
				}
			</div>
		</div>
	)
}

export default Search