import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import { FaSignOutAlt, FaCogs } from 'react-icons/fa'
import Ripple from '@/components/Ripple/Ripple'
import UserImage from '@/components/UserImage'
import axios from "@/api/axios"

function Drawer() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [show, setShow] = useState(false)
  const { auth } = useStore()

  useEffect(() => {
    if(pathname == '/drawer') {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [pathname])

  async function logout() {
    try {
      await axios({
        url: '/c/lt',
        method: 'post',
        withCredentials: true,
      })

      location = location.origin + '/login'
      // socket.disconnect()
      // // socket.close()
      
      // navigate('/login', {
      //   state: {
      //     type: 'logout'
      //   }
      // })   
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <>
      {
        show ?
          <div onClick={() => navigate(-1)} className='fixed z-50 top-0 left-0 h-screen w-full bg-black/50'>
            <div onClick={(ev) => ev.stopPropagation()} className='h-full overflow-y-auto w-80 bg-gray-800 flex flex-col'>
              <div className='p-2 flex gap-1 bg-black/50'>
                <UserImage id={auth.user._id} size='2xl' className='bg-transparent' />
                <div className='p-4 flex-1 text-gray-300 text-sm font-semibold flex flex-col justify-end'>
                  <p>{ auth.user.firstName } { auth.user.lastName }</p>
                  <p className='text-sky-500'>{ auth.user.username }</p>
                </div>
              </div>
              <Ripple color='#ddd8' type='div' className='mt-1 gap-2 hover:bg-black/50 cursor-pointer p-2 text-base font-semibold text-gray-300 flex items-center'>  
                <FaCogs className='text-2xl' />
                Settings
              </Ripple>
              <Ripple onClick={logout} color='#ddd8' type='div' className='mt-1 gap-2 hover:bg-black/50 cursor-pointer p-2 text-base font-semibold text-gray-300 flex items-center'>  
                <FaSignOutAlt className='text-xl text-red-500' />
                Logout
              </Ripple>
            </div>
          </div>
        : ''
      }
    </>
    
  )
}

export default Drawer