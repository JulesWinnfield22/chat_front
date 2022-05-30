import {memo, useEffect, useRef, useMemo, useState} from 'react'
import Ripple from '@/components/Ripple/Ripple'

function Layout({ active, children }) {
  return (
    <div className={`${active ? 'z-20' : 'z-10'} absolute top-0 left-0  h-full bg-white w-full flex-1 overflow-y-auto`}>
      <div className={`w-full min-h-full flex flex-col justify-center items-center`}>
        {
          children
        }
      </div>
    </div>
  )
}

function NothingFound({text}) {
  return (
    <>
      <img src='/src/assets/img/feeling_blue.svg' className='max-w-full w-32 h-32' />
      <span className='text-sm mt-4'>no {text} founnd!</span>
    </>
  )
}

function Files({active}) {
  return (
    <Layout active={active}>
      <div>files</div>
      <NothingFound text='files' />
    </Layout>
  )
}

function Photos({active}) {
  return (
    <Layout active={active}>
      <div>photos</div>
      <NothingFound text='photos' />
    </Layout>
  )
}

function Music({active}) {
  return (
    <Layout active={active}>
      <div>music</div>
      <NothingFound text='music' />
    </Layout>
  )
}

function Gif({active}) {
  return (
    <Layout active={active}>
      <div>Gif</div>
      <NothingFound text='gifs' />
    </Layout>
  )
}


function SharedMedia() {
  const [navNames] = useState(['files', 'photos', 'music', 'gif'])
  const [activeItem, setActiveItem] = useState(navNames[0])
  
  const memoizedNavNames = useMemo(() => {
    return navNames;
  }, [navNames])

  function changeActive(name) {
    setActiveItem(name)
  }

  return (
    <div className='bg-white border border-gray-800/40 rounded-md p-2 min-h-[15rem] flex flex-1 w-full flex-col gap-2'>
      <p className='text-sm lg:text-base font-bold text-gray-900'>Shared Media</p>
      <div className='w-full flex-1 flex flex-col'>
        <nav className='relative h-6 flex w-full border-b'>
          <ul className='flex gap-2 h-full w-full text-sm lg:text-sm font-medium tracking-wide text-gray-900'>
            {
              memoizedNavNames.map((item) => {
                return (
                  <Ripple color='#333' type='li' onClick={() => changeActive(item)} className={`${item == activeItem ? 'activeNavItem' : ''} secodary-nav-item`} key={item}>
                    {item}
                  </Ripple>
                )  
              })
            }
          </ul>
          {/* <span className='rod absolute rounded-full bg-gray-900 z-30 top-full left-0 w-1/4 h-1'></span> */}
        </nav>
        <div className='relative overflow-y-hidden flex flex-1 w-full'>
          <Files active={activeItem == 'files'} />
          <Photos active={activeItem == 'photos'} />
          <Music active={activeItem == 'music'} />
          <Gif active={activeItem == 'gif'} />
        </div>
      </div>
    </div>
  )
}

export default memo(SharedMedia)