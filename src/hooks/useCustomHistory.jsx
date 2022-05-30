import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const history = ['/']
//TODO do it when yo can
function useCustomHistory() {

  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {

  }, [pathname])
  
  function customNavigate(url) {
    if((url.startsWith('/message') || url.startsWith('/group')) && (history[history.length - 1].startsWith('/group') || history[history.length - 1].startsWith('/message'))) {
      navigate(url, {
        replace: true
      })
    } else {
      history.push(url)
      navigate(url)
    }
  }
}

export default useCustomHistory