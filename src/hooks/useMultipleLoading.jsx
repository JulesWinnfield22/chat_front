import { useState } from 'react'

function useMultipleLoading(init = true, count = 1) {
  const [ loading, setLoading ] = useState(init)
  let length = 0

  function check() {
    length++
    console.log(length, 'length')
    if(length == count) {
      setLoading(!init)
    }
  }

  return [loading, check]
}

export default useMultipleLoading
