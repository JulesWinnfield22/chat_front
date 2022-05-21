 import { useEffect} from 'react'

 
function useWhenVisible() {
   
  let observer = []

  function whenVisible(target, cb, options) {
    let temp = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cb(entry);
          observer.unobserve(target)
        }
      });
    }, options)

    observer.push(temp)
    
    temp.observe(target)
  }
  
  useEffect(() => {
    return () => {
      observer.forEach(el => {
        el.disconnect()
      })
    }
  }, [])

  return whenVisible
}

export {
  useWhenVisible
}