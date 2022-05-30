import { useState, useEffect, useRef } from 'react'
import axios from "@/api/axios"
import {useStore} from '@/store/store'
import useRefreshToken from '@/hooks/useRefreshToken'
import {useLocation, useNavigate} from 'react-router-dom'
import Loading from '@/components/Loading'

const onInput = (cb, cbError) => (ev) => {
  cbError('')
  cb(ev.target.value)
}

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [usernameOrEmailError, setUsernameOrEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(true)
  const form = useRef()
  const navigate = useNavigate()
  const {auth, setAuth} = useStore()
  const refresh = useRefreshToken()
  const location = useLocation()
  
  const from = location.state?.from
  const type = location.state?.type

  let controller
  if('AbortController' in window) {
    controller = new AbortController() 
  }

  useEffect(() => {
    return () => {
      controller?.abort()
    }
  }, [])

  useEffect(() => {
    if(type == 'logout') {
      setAuth({
        type
      })
      setLoading(false)
    } else if(auth?.accessToken) {
      navigate(from || '/', {
        replace: true
      })
    } else {
      (async () => {
        let response = await refresh()
        if(response) {
          navigate(from || '/',  {
            replace: true
          })
        } else {
          setLoading(false)
        }
      })()
    }

  }, [])

  async function login() {
    try {
      let response = await axios({
        url: '/c/ln',
        method: 'post',
        data: {
          usernameOrEmail,
          password,
        },
        withCredentials: true,
        signal: controller ? controller.signal: null
      })
      
      console.log(response?.data)
      if(response?.data) {
        setAuth({
          type: 'initial',
          data: {
            accessToken: response?.data.accessToken,
            user: response?.data.user
          }
        })
        from ? navigate(from,  {
          replace: true
        }) : navigate('/', {
          replace: true
        })
      }

    } catch(err) {
      if(err.response.status == 400) {
        for(let name in err.response.data) {
          setErrorMessage(name, err.response.data[name])
        }
        let el = form?.current.querySelector('.error')
        el?.firstElementChild?.focus()
        el?.firstElementChild?.select()
      }
    }
  }

  function setErrorMessage(name, msg) {
    switch(name) {
      case 'usernameOrEmail':
        setUsernameOrEmailError(msg)
        break
      case 'password':
        setPasswordError(msg)
        break
      default:
        break
    }
  }

  return (
    <>
      {
        !loading ?
          <main className='flex justify-center items-center w-full h-screen overflow-y-auto'>
            <div className='w-full sm:max-w-[25rem] flex flex-col gap-4 rounded-lg shadow p-2 sm:p-4'>
              <div className="text-center">
                <h1 className='text-register-fs font-bold text-gray-600'>Log In<i className="text-sky-400">.</i></h1>
                <p className="text-gray-600 justify-center font-medium text-sm px-2 flex gap-1">dont have an account?<a onClick={() => navigate('/register')} className="text-sky-500 cursor-pointer underline">create one</a></p>
              </div>
              <form ref={form} className='p-2 sm:p-3 shadow-md border-2 rounded-lg border-sky-300 flex flex-col gap-2'>
                <div className='w-full flex flex-col self-start flex-1'>
                  <label className={`${usernameOrEmailError ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
                    <input value={usernameOrEmail} onChange={onInput(setUsernameOrEmail, setUsernameOrEmailError)} className="form-input" placeholder="@username or fake@email.com" type="sernae or email" name="usernameOrEmail" id="" />
                  </label>
                  {
                    usernameOrEmailError &&
                    <p className="px-1 text-sm text-red-500 lowercase">{usernameOrEmailError}</p>
                  }       
                </div>
                <div className='w-full flex flex-col self-start flex-1'>
                  <label className={`${passwordError ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
                    <input value={password} onChange={onInput(setPassword, setPasswordError)} className="form-input" placeholder="password" type="password" name="password" id="" />
                  </label> 
                  {
                    passwordError &&
                    <p className="px-1 text-sm text-red-500 lowercase">{passwordError}</p>
                  }          
                </div>
                <button type="button" onClick={login} className='uppercase w-1/2 ml-auto h-10 rounded-lg text-sm tracking-wide mt-4 bg-sky-700 text-white'>login</button>
              </form>
            </div>
          </main>
        : <Loading />
      }
    </>
  )
}

export default Login