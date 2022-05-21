import {axiosPrivate} from '@/api/axios'
import {useEffect} from 'react'
import {useStore} from '@/store/store'
import useRefreshToken from '@/hooks/useRefreshToken'

function useAxiosInterceptor({}) {
  const {auth} = useStore()
  const refresh = useRefreshToken()

  useEffect(() => {

    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if(!config.headers['authorization']) {
          config.headers['authorization'] = `Bearer ${auth.accessToken}`
        }
        return config
      },
      err => Promise.reject(err)
    )

    const responseIntercept = axiosPrivate.interceptors.reponse.use(
      response => response,
      async err => {
        const prevRequest = err?.congig

        if(err.response.status == 403 && !prevRequest?.sent) {
          prevRequest.sent = true

          const newAccessToken = await refresh()

          prevRequest.headers['authorization'] = `Bearer ${newAccessToken}`

          return axiosPrivate(prevRequest)
        } else return Promise.reject(err)
      }
    )

    return () => {
      axiosPrivate.interceptors.reponse.eject(responseIntercept)
      axiosPrivate.interceptors.request.eject(requestIntercept)
    }
  }, [auth, refresh])

  return axiosPrivate
}

export default useAxiosInterceptor