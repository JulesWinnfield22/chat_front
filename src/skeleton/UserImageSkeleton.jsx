import { memo } from 'react'

function getSize(size, rounded, square) {
  let classs = square ? ' ' : 'rounded-full shadow-md '
  switch(size) {
    case 'md':
       classs += 'w-16 h-16'
      break
    case 'lg':
       classs += 'w-14 h-14'
      break
    case 'xs':
      classs += 'w-10 h-10'
      break
    default:
       classs += 'w-10 h-10 lg:w-12 lg:h-12'
  }
  return classs += ' overflow-hidden'
}

function UserImageSkeleton({rounded = true, square = false, size = 'sm', src=''}) {
  return (
  <div className={`${getSize(size, rounded, square)} skeleton-bar bg-gray-900/60 flex-grow-0 flex-shrink-0`}>
    </div>
  )
}

export default memo(UserImageSkeleton)