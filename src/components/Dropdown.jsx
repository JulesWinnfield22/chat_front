import { useEffect, useRef, useState, memo } from 'react'

let dropDowns = []

function outsideClickHandler(ev) {
	dropDowns.forEach(el => {
		if(el.el.current?.previousElementSibling != ev.target) el.cb(false)
	})
}


function useDropdown() {
	const [show, setShow] = useState(false)

	const toggle = () => setShow(!show)

	const dropDown = useRef(null)

	function keydownHandler(ev) {
		if(ev.key == 'Escape') setShow(false)
	}

	useEffect(() => {
		if(!show) dropDowns = dropDowns.filter(el => el?.el?.current != dropDown?.current)
		else {
			dropDowns.push({el: dropDown, cb: setShow})
			dropDown?.current.focus()
			dropDown?.current?.addEventListener('keydown', keydownHandler)
		}

		return () => {
			dropDown?.current?.removeEventListener('keydown', keydownHandler)
		}
	}, [show])
																								
	useEffect(() => {
		document.addEventListener('click', outsideClickHandler)
		return () => {
			document.removeEventListener('click', outsideClickHandler)
		}
	}, [])

	function Dropdown({ children }) {																																																																																																													
		return (
			show &&
			<div tabIndex='12'  onClick={(ev) => ev.stopPropagation()} className='absolute border border-gray-800/30 rounded-tl-md rounded-b-md z-50 top-full right-2 overflow-hidden bg-white' ref={dropDown}>
				{
					children
				}
			</div>
		)
	}

	return [Dropdown, toggle]
}

export default useDropdown