import { Routes, Route, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from '@/pages/Home'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import {useStore} from '@/store/store'
import useRefreshToken from '@/hooks/useRefreshToken'
import useAxiosInterceptor from '@/hooks/useAxiosInterceptor'

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const {auth} = useStore()

  useEffect(() => {
    console.log('hello', auth)
    if(auth?.accessToken) {
      setLoading(false)
    } else {
      navigate('/login', {
        replace: true,
        state: {
          from: location?.pathname
        }
      })
    }
  }, [])

  return (
    <>
      {
        !loading ? children : <p>loading...</p>
      }
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='*' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
