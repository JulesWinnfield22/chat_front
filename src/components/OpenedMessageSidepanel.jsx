import {memo, useEffect, useMemo, useState} from 'react'
import UserImage from '@/components/UserImage.jsx'
import Ripple from '@/components/Ripple/Ripple'
import useSocket from '@/hooks/useSocket'
import {useStore} from '@/store/store'

function Toggle({ handler, value = false, className}) {
  
  return (
    <button onClick={() => {
      handler(value)
    }} className={`${value ? 'bg-teal-700' : 'bg-gray-800'} transition-all duration-300 ease-in relative h-4 w-8 rounded-full`}>
      <span style={{backgroundColor: '#138666'}} className={`${value ? 'left-full' : 'left-0'} transition-all duration-300 ease-in absolute h-[1.2rem] -translate-x-1/2 -translate-y-1/2 flex w-[1.2rem] rounded-full shadow-toggle`}>
      </span>
    </button>
  )
}

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

function OpenedMessageSidepanel({ user, active }) {
  const [navNames] = useState(['files', 'photos', 'music', 'gif'])
  const [activeItem, setActiveItem] = useState(navNames[0])
  const { auth, setAuth } = useStore()
  const socket = useSocket()

  const memoizedNavNames = useMemo(() => {
    return navNames;
  }, [navNames])

  function changeActive(name) {
    setActiveItem(name)
  }

  return (
    <div onClick={ev => ev.stopPropagation()} className={`${active ? 'z-20' : 'z-10'} absolute absolute-center max-w-[22rem] w-[22rem] p-2 flex flex-col gap-2 items-center lg:w-full h-full overflow-y-auto shadow-lg`}>
      <div className='w-full bg-white shadow-sidenav-b rounded-md pt-2 flex flex-col justify-center items-center gap-2'>
        <div className='flex w-full px-2 gap-2'>
          <UserImage className='bg-transparent shadow-none' id={user._id} src={user?.profile} size='xl' />
          <div className='flex-1 flex flex-col justify-end w-full pb-3'>
            <span className='text-lg font-bold text-sky-500'>{user?.username}</span>
            <p className='text-sm leading-none text-gray-500 w-full'>a very fun guy</p>
          </div>
        </div>
        <div className='pr-4 border-t flex justify-between p-2 w-full items-center'>
          <span className='text-sm font-medium '>Add to Fevourites</span>
          <Toggle value={auth?.user?.fevourites?.includes(user._id)} handler={(value) => {
            socket.emit('fevourite', user._id, (err, res) => {
              if(!err) {
                setAuth({
                  type: 'update',
                  data: {
                    name: 'fevourites',
                    value: res
                  }
                })
              }
            })
          }}></Toggle>
        </div>
      </div>
      <div className='bg-white rounded-md p-2 min-h-[15rem] flex flex-1 w-full flex-col gap-2'>
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
    </div>
  )
}

export default memo(OpenedMessageSidepanel)