import axios from "@/api/axios"
import {useStore} from '@/store/store'
import {memo} from 'react'
function useRefreshToken() {
  const {setAuth} = useStore()

  const refresh = async () => {
    try {
      const response  = await axios({
        method: 'post',
        url: '/c/rn', 
        withCredentials: true
      })
  
      setAuth({
        type: 'initial',
        data: {
          accessToken: response?.data.accessToken,
          user: response?.data.user
        }
      })

      return response.data.accessToken
    } catch(err) {
      return null
    }
  }

  return refresh
}

export default useRefreshToken