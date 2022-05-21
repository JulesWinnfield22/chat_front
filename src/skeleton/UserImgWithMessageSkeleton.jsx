import {memo} from 'react'
import UserImageSkeleton from "./UserImageSkeleton"

function UserImgWithMessageSkeleton() {

  function gen() {
    let ary = Array(10).fill(0)
    return (
      <div className='flex flex-col p-2 w-[18rem] gap-1 lg:gap-2 h-full'>
        <div className='h-12 bg-gray-600 rounded-md'></div>
        <p className='w-24 h-4 rounded-full bg-gray-400 my-2'></p>
        {
          ary.map((el, idx) => {
            return (
              <div key={idx} className={`rounded-lg w-full flex items-center bg-gray-900/20 p-1 flex-grow-0`}>
                <UserImageSkeleton />
                <div className='flex flex-col justify-center pl-2 h-full gap-2 flex-1'>
                  <div className='w-full h-1/2 flex justify-between items-center'>
                    <span className='skeleton-bar bg-gray-900/60 rounded-full px-4 py-2 w-12'></span>
                  </div>
                  <div className={`w-full h-1/2 flex justify-between items-center pr-1  text-xs font-normal tracking-wider`}>
                    <span className='skeleton-bar w-24 px-4 py-2 rounded-full bg-gray-900/60'></span>
                    <time className='skeleton-bar flex-shrink-0 px-4 py-2 w-16 bg-gray-900/60 rounded-full'></time>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }

  return gen()
}

export default memo(UserImgWithMessageSkeleton)