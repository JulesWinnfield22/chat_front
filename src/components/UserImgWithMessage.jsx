import { memo, useMemo } from 'react'
import UserImage from '@/components/UserImage'
import { useMessages } from '@/pages/Home'
import { Link, useNavigate } from 'react-router-dom'
import Ripple from '@/components/Ripple/Ripple'

function UserImageWithMessage({active, user, unread, message, online = false}) {
	const navigate = useNavigate()
	const { typing } = useMessages()
	return (
		<Ripple
			// type='a'
			className={`${active ? 'bg-gray-900' : ''} group rounded-lg 
			cursor cursor-pointer w-full hover:bg-gray-900 flex items-center p-2 flex-grow-0`}
			onClick={
				() => !active ? navigate(`/message/${user._id}`, {
					// replace: true
				}) : ''
			} color='#ddd'
		>
			<UserImage online={online} id={user._id} src={user.profile} />
			<div style={{
				width: `calc(100% - 3rem + .25rem)`
			}} className='flex flex-col justify-center pl-2 h-full'>
				<div className='w-full h-1/2 lg:h-auto flex justify-between items-center'>
					<span className={`${active ? 'text-gray-100' : ''} font-medium text-sm group-hover:text-gray-100`}>{user.firstName} {user.lastName}</span>
					{
						unread > 0 ?
						<span className='text-xs bg-sky-600 text-white px-2 rounded-lg font-semibold'>not seen {unread}</span> : ''
					}
				</div>
				<div className={`${active ? 'text-gray-100' : 'text-gray-600'} group-hover:text-gray-100 w-full h-1/2 lg:h-auto flex justify-between items-center pr-1  text-sm font-normal tracking-wider`}>
					<span className='text-ellipsis whitespace-nowrap overflow-hidden flex-1'>
						{
							typing?.includes(user._id) ? 'typing...' :
							message?.message || 'no messages yet'
						}
					</span>
					<time className='flex-shrink-0 text-xs' dateTime={message?.createdAt}>{new Date(message?.createdAt)?.toDateString() || ''}</time>
				</div>
			</div>
		</Ripple>
	)
}

export default memo(UserImageWithMessage)