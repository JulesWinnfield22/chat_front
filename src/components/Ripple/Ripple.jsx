import { useEffect, useRef, createElement } from 'react'
import './ripple.css'

function RippleChild(top, left) {
  let div = document.createElement('div')
  div.className = 'ripple-child'
    
  div.style.position = 'absolute'
  div.style.top = top + 'px'
  div.style.left = left + 'px'
  setTimeout(() => {
    div.remove()
  }, 500)

  return div
}

function Ripple({ children, type = 'div', color = 'red', className, ...rest }) {
  const ripple = useRef(null)

  useEffect(() => {
    // ripple.current.style.borderRadius = ripple.current?.firstElementChild && getComputedStyle(ripple.current?.firstElementChild)?.['border-radius']
    ripple.current.style.setProperty('--ripple-clr', color)
    
    const eventHandler = (ev) => {
      let { top, left, width } = ripple.current.getBoundingClientRect()
      
      ripple.current.style.setProperty('--scale', width / 10)
      // ripple.current.style.setProperty('--bg-clr', getComputedStyle(ripple.current.firstElementChild)['background-color'])
      let x = ev.pageX - left
      let y = ev.pageY - top
      
      let child = RippleChild(y, x)
      ripple.current.appendChild(child)
    }

    ripple.current.onclick = eventHandler

    return (
      ripple.current.removeEventListener('click', eventHandler)
    )
  }, [])


  return createElement(
    type,
    {
      ref: ripple,
      className: `ripple cursor-pointer ${className}`,
      ...rest
    },
    children
  )
    // <div ref={ripple} className={`ripple ${className}`}>
    //   {
    //     children
    //   }
    // </div>
}

export default Ripple