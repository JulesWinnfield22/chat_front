import axios from "@/api/axios"
import { useEffect, useRef, useState , createRef } from 'react'
import { useStore } from '@/store/store'
import {CgCheck} from 'react-icons/cg'
import { useNavigate } from 'react-router-dom'
import Form, { TwoHorizontalInputs, TextInput } from '@/components/Form'

const onInput = (cb, cbError) => (ev) => {
  cbError('')
  cb(ev.target.value)
}

function Register() {
  // const { onInput } = useForm()
  const navigate = useNavigate()
  const { setAuth } = useStore()
  const form = useRef()
  const [firstName, setFirstName] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [lastName, setLastName] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [termsOfService, setTermsOfService] = useState(false)
  const [termsOfServiceError, setTermsOfServiceError] = useState('')

  let controller
  if('AbortController' in window) {
    controller = new AbortController() 
  }

  useEffect(() => {
    return () => {
      controller?.abort()
    }
  }, [])


  async function register() {
    try {
      let response = await axios({
        url: '/c/rr',
        method: 'post',
        data: {
          firstName,
          lastName,
          username,
          email,
          password,
          termsOfService
        },
        withCredentials: true,
        signal: controller ? controller.signal: null
      })
      
      console.log(response?.data)
      if(response?.data) {
        setAuth(response?.data)
        navigate('/')
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
      case 'firstName':
        setFirstNameError(msg)
        break
      case 'lastName':
        setLastNameError(msg)
        break
      case 'username':
        setUsernameError(msg)
        break
      case 'email':
        setEmailError(msg)
        break
      case 'password':
        setPasswordError(msg)
        break
      case 'termsOfService':
        setTermsOfServiceError(msg)  
        break
      default:
          break
    }
  }

  return (
    <main className='flex justify-center items-center w-full h-screen overflow-y-auto'>
      <div className='w-full sm:max-w-[32rem] flex flex-col gap-4 rounded-lg shadow p-2 sm:p-4'>
        <div className="text-center">
          <h1 className='text-register-fs font-bold text-gray-600'>Create new Account<i className="text-sky-400">.</i></h1>
          <p className="text-gray-600 justify-center font-medium text-sm px-2 flex gap-1">have an account?<a onClick={() => navigate('/login')} className="text-sky-500 cursor-pointer underline">sign in</a></p>
        </div>
        <form ref={form} className='p-2 sm:p-3 shadow-md border-2 rounded-lg border-sky-300 flex flex-col gap-2'>
          <div className="flex justify-between gap-1 sm:gap-2 flex-1">
            <div className={`form-input-container w-[49%] sm:w-1/2`}>
              <label className={`${firstNameError ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
                <input value={firstName} onChange={onInput(setFirstName, setFirstNameError)} className="form-input" placeholder='firstname' type="text" name='firstName' id="" />
              </label>
              {
                firstNameError &&
                <p className="px-1 text-sm text-red-500 lowercase">{firstNameError}</p>
              }
            </div>
            <div className={`form-input-container w-[49%] sm:w-1/2`}>
              <label className={`${lastNameError ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
                <input value={lastName} onChange={onInput(setLastName, setLastNameError)} className="form-input" placeholder={'lastname'} type="text" name={'firstName'} id="" />
              </label>
              {
                lastNameError &&
                <p className="px-1 text-sm text-red-500 lowercase">{lastNameError}</p>
              }
            </div>
          </div>
          <div className='form-input-container'>
            <label className={`${usernameError ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
              <input value={username} onChange={onInput(setUsername, setUsernameError)} className="form-input" placeholder="username" type="text" name="username" id="" />
            </label>
            {
              usernameError &&
              <p className="px-1 text-sm text-red-500 lowercase">{usernameError}</p>
            }
          </div>
          <div className='w-full flex flex-col self-start flex-1'>
            <label className={`${emailError ? 'border-red-500 error' : 'focus-within:border-sky-300 '} form-input-label`}>
              <input value={email} onChange={onInput(setEmail, setEmailError)} className="form-input" placeholder="fake@email.com" type="email" name="email" id="" />
            </label>
            {
              emailError &&
              <p className="px-1 text-sm text-red-500 lowercase">{emailError}</p>
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
          <div className='flex flex-col'>
            <div className='flex gap-2 items-start'>
              <label className='self-start pl-1'>
                <input className="hidden" onChange={({target}) => {
                  setTermsOfService(target.checked ? 'accepted' : '')
                }} type="checkbox" name="termsOfService"  />
                <div className='flex items-center justify-center text-2xl w-5 h-5 border-2 border-gray-400 rounded'>
                  {
                    termsOfService &&
                    <CgCheck className="absolute"/>
                  }
                </div>
              </label>
              <p className="text-sm ">by checking this check box you are agreeing to the <a className="underline text-sky-600 font-medium" href='#'>terms of service</a></p>
            </div>
            {
              termsOfServiceError && !termsOfService &&
              <p className="px-1 text-sm text-red-500 lowercase">{termsOfServiceError}</p>
            }
          </div>
          <button type="button" onClick={register} className='uppercase w-1/2 ml-auto h-10 rounded-lg text-sm tracking-wide mt-4 bg-sky-700 text-white'>sign up</button>
        </form>
      </div>
    </main>
  )
}

export default Register