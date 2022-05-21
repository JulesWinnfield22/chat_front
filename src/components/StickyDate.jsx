import { useEffect, useState, memo } from 'react'
import { useMessages } from '@/pages/Home'

function formatDate(date) {
  var d = new Date(date)

  return d.toUTCString().replace(/(?=00).*/, '').trim()
}

let current = 0
let timer
let stickies = []

// function observerRoot(root) {
//   return (target, idx) => {
//     let obserer = new IntersectionObserver((entries, observer) => {
//       entries.forEach(entry => {
//         if(entry.isIntersecting) {
//           console.log(idx, entry.target, entry.target.getBoundingClientRect())
//           current = idx
//         }
//       })
//     }, {
//       root,
//       threshold: 1
//     })

//     obserer.observe(target)
//   }
// }

function StickyDate({date, root}) {
  // const { messagesWithUsers } = useMessages()

  // const setTimer = () => {
  //   return setTimeout(() => {
  //     if(current == 0) {
  //       stickies[current]?.classList?.toggle('hidden')
  //     } else {
  //       stickies[current + 1]?.classList?.toggle('hidden')
  //     }
  //   }, 1000)
  // }

  // useEffect(() => {
  //   var newStickies = document.querySelectorAll('.sticky') || []
  //   console.log(newStickies)
  //   if(newStickies.length > stickies.length) {
  //     let s = [...newStickies].slice(stickies.length)
       
  //     let observe = observerRoot(root)

  //     stickies.push(...s)

  //     s.forEach((sticky, idx) => {
  //       observe(sticky, idx + stickies.length)
  //     })
  //   }

  //   const scrollHandler = (ev) => {
  //     if(timer) {
  //       if(current == 1) {
  //         stickies[current - 1]?.classList.toggle('hidden')
  //       } else {
  //         stickies[current + 1]?.classList.toggle('hidden')
  //       }
  //       clearTimeout(timer)
  //     }

  //     timer = setTimer()
  //   }

  //   root.addEventListener('scroll', scrollHandler)

  //   setTimer()
  //   return () => {
  //     root.removeEventListener('scroll', scrollHandler)
  //   }
  // }, [messagesWithUsers])

  return (
    <p className='flex justify-center sticky top-0'>
      <span style={{
        boxShadow: '0 0 3px -1px #000'
      }} className='bg-black/10 rounded-full font-mono text-center text-xs text-sky-800 px-3'>
        {formatDate(date)}
      </span>
    </p>
  )
}

export default memo(StickyDate)