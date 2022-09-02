import { useState, useRef, useEffect, memo } from 'react'
import { FaHome, FaDev, FaCog } from 'react-icons/fa'
import Ripple from '@/components/Ripple/Ripple'
import './tabs.css'

let longTabs = [{ name: 'one', component: One }, { name: 'a very long one', component: Two }, {name: 'another a very long one', component: Three}]
let shortTabs = [{ name: 'one', icon: FaHome, component: One }, { name: 'a very long one', icon: FaCog, component: Two }, {name: 'another a very long one', icon: FaDev, component: Three}]

function One() {

	return (
		<p>hello</p>
	)
}

function Two() {

	return (
		<p>hallo ay noigga</p>
	)
}

function Three() {

	return (
		<>
			<p>hallo ay wa waw </p>
			<Tabs tabs={shortTabs.filter((el, idx) => idx < 2)}></Tabs>
		</>
	)
}

function LongHeader({ headers = [], active, setActiveTab }) {
	const tabsEle = useRef()

	useEffect(() => {
		let observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if(entry.isIntersecting) {
					let target = tabsEle.current.querySelector('.tab-active')

					let offset = target.offsetLeft
					let width = target.offsetWidth


					tabsEle.current.style.setProperty('--width', width + 'px')
					tabsEle.current.style.setProperty('--offsetX', offset + 'px')
					
					observer.unobserve(tabsEle.current)
				}
			})
		})

		observer.observe(tabsEle.current, {
			root: document.body
		})

		return () => {
			if(tabsEle.current) observer.unobserve(tabsEle.current)
		}
	}, [])

	return (
		<div ref={tabsEle} className='long-tab-items tab-items h-8'>
			{
				headers.map((name, idx) => {
					return (
						<Ripple color='#0007' key={name} onClick={(ev) => setActiveTab(name, ev, tabsEle.current)} className={`${active == name ? 'tab-active' : ''} relative px-3 flex-center flex-shrink-0 min-w-[4rem] h-full`}>{name}</Ripple>
					)
				})
			}
		</div>
	)
}

function ShortHeader({ headers = [], active, setActiveTab }) {
	const tabsEle = useRef()
	return (
		<div ref={tabsEle} className='short-tab-items gap-2 tab-items items-center h-12 '>
			{
				headers.map(el => {
					let Icon = el.icon

					return (
						<Ripple color='#0007' onClick={(ev) => setActiveTab(el.name, ev, tabsEle.current)} key={el.name} className={`${active == el.name ? 'tab-active' : ''} relative h-10 w-10 rounded-full flex-center text-2xl`}>
							<Icon />
						</Ripple>
					)
				})
			}
		</div>
	)
}

function Tabs({ type = 'long', tabs = shortTabs }) {
	const [active, setActive] = useState(tabs[0].name)

	function setActiveTab(name, ev, tabsEle) {

		let offset = ev.target.offsetLeft
		let width = ev.target.offsetWidth

		tabsEle.style.setProperty('--width', width + 'px')
		tabsEle.style.setProperty('--offsetX', offset + 'px')

		setActive(name)
	}

	return (
		<div className='flex flex-col gap-2 min-h-full w-full'>
			{
				type == 'long' ?
					<LongHeader active={active} headers={tabs.map(el => el.name)} setActiveTab={setActiveTab} />
				: ''
			}
			{
				type == 'short' ?
					<ShortHeader active={active} headers={tabs.map(el => ({name: el.name, icon: el.icon}))} setActiveTab={setActiveTab} />
				: ''
			}
			<div className='relative flex-1 min-h-[20rem]'>
				{
					tabs.map(el => ({component: el.component, props: el.props || {}})).map(({component, props}, idx) => {
						let Com = component
						return (
							<div key={idx} className={`${tabs.find(el => el.component == component).name == active ? 'z-20' : 'z-10 hidden'} absolute bg-white top-0 left-0 h-full w-full overflow-y-auto`}>
								<Com {...props} />
							</div>
						)
					})
				}
			</div>
		</div>
	)
}

export default memo(Tabs)