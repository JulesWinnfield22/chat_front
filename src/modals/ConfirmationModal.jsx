import Ripple from '@/components/Ripple/Ripple'
import { memo } from 'react'

function ConfirmationModal({ children, msg = 'are you sure?', yes = f => f, no = f => f }) {
	return (
		<div className='w-[20rem] overflow-hidden flex flex-col gap-4 justify-center items-center rounded-lg bg-white shadow-lg p-4 min-h-40'>
			<span className='flex text-sm px-2'>{msg}</span>
			{
				children
			}
			<div className='flex w-full justify-end gap-2'>
				<Ripple onClick={no} type='button' className='px-4 py-1 rounded-md border'>
					<span>No</span>
				</Ripple>
				<Ripple onClick={yes} type='button' className='px-4 border-none  py-1 bg-gray-800 text-sky-400 rounded-md border'>
					<span>yes</span>
				</Ripple>
			</div>
		</div>
	)
}

export default memo(ConfirmationModal)