import { useState, useRef, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'

const rootModal = document.querySelector('#rootModal')

function* getIndex() {
  let id = 20000
  while(true) {
    yield id++
  }
}

const index = getIndex()

const opts = {
  childPosition: 'center',
  urlOptions: {
    replace: false
  }
}

function getChildPosition(pos) {
  switch(pos) {
    case 'left':
      return 'start'
    default:
      return 'center'
  }
}

function usePortal(url, options) {
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const [showModal, setShowModal] = useState(false)

  options = {
    ...opts,
    ...options,
  }

  function nav(ev) {
    ev?.stopPropagation()
    navigate(`/${url}`, options.urlOptions)
  }

  function hide(ev, back) {
    if(ev?.stopPropagation) {
      ev?.stopPropagation()
      navigate(back || -1)
    } else {
      navigate(ev || -1)
    }
  }

  useEffect(() => {
    rootModal?.querySelector(`.modal.active > *`)?.focus()
  }, [showModal])

  useEffect(() => {
    if(`/${url}` == pathname) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [pathname])
  
  function Modal({ children }) {
    const {pathname} = useLocation()
    const { value } = index.next()

    return (
      <>
        {
          // showModal &&
          createPortal (
            <div
              onClick={hide} 
              style={{
                zIndex: value,
                display: showModal ? 'grid' : 'none',
                placeItems: showModal && getChildPosition(options.childPosition)
              }}
              className={`${showModal ? 'active' : ''} modal`}
            >
              <div 
                onKeyDown={(ev) => {
                  ev.stopPropagation()
                  if(ev.key == 'Escape') hide()
                }}
                tabIndex={value}
                onClick={(ev) => ev.stopPropagation()}
              >
                {
                  children
                }
              </div>
            </div>,
            rootModal
          )
        }
      </>
    )
  }

  return [Modal, nav, hide]
}

export default usePortal