import { memo, useEffect, useState } from 'react'
import { createAvatar } from '@dicebear/avatars'
import * as style from '@dicebear/avatars-bottts-sprites'

function getSize(size, rounded, square) {
  let classs = square ? ' ' : 'rounded-full shadow-md '
  switch(size) {
    case 'md':
       classs += 'w-14 h-14'
      break
    case 'lg':
       classs += 'w-16 h-16'
      break
    case 'xl':
      classs += 'w-24 h-24'
      break
    case '2xl':
      classs += 'w-32 h-32'
      break
    case 'xs':
      classs += 'w-10 h-10'
      break
    case 'xxs':
      classs += 'w-7 h-7'
      break
    default:
       classs += 'w-12 h-12'
  }
  return classs += ' '
}

let cached = {}

function UserImage({id = 'abc', className = '', online = false, rounded = true, square = false, size = 'sm', src=''}) {
  const [img, setImg] = useState('')

  useEffect(( ) => {
    if(cached[`id_${id}`]) {
      setImg(cached[`id_${id}`])
    } else if(src) {
      setImg(src)
    } else {
      let svg = createAvatar(style, {
        seed: id
      })
      
      let blob = new Blob([svg], {
        type: 'image/svg+xml'
      })

      const url = URL.createObjectURL(blob)
      cached[`id_${id}`] = url
      setImg(url)
    }
  }, [src])
  
  return (
    <div className={`${getSize(size, rounded, square)} ${!src ? 'p-1' : ''} ${online ? 'border-sky-400 border': ''} relative flex-grow-0 flex-shrink-0 ${className}`}>
      <img className={`max-w-full object-cover`} src={img} alt="" /> 
      {
				online ?
				<span className='absolute w-[10px] h-[10px] top-[83%] right-[10%] rounded-full bg-sky-400 '></span> : ''
			}
    </div>
  )
}

export default memo(UserImage)