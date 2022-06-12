import Ripple from '@/components/Ripple/Ripple'

function ConfirmationModal({ msg = 'are you sure?', yes = f => f, no = f => f }) {
	return (
		<div className='w-[20rem] overflow-hidden flex flex-col gap-4 justify-center items-center rounded-lg bg-white shadow-lg h-40'>
			<span className='text-center flex text-sm px-2'>{msg}</span>
			<div className='flex justify-center gap-2'>
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

export default ConfirmationModal