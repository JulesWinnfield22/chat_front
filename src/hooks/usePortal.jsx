import { useState, useRef, useEffect } from 'react'
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

function usePortal(url) {
  const navigate = useNavigate()
  const {pathname} = useLocation()

  function nav(ev) {
    ev?.stopPropagation()
    navigate(`/${url}`)
  }

  function hide(ev, back) {
    if(ev?.stopPropagation) {
      ev?.stopPropagation()
      navigate(back || -1)
    } else {
      navigate(ev || -1)
    }
  }
  
  function Modal({ children }) {
    const [showModal, setShowModal] = useState(false)
    const {pathname} = useLocation()
    const { value } = index.next()

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

    return (
      <>
        {
          // showModal &&
          createPortal (
            <div
              onClick={hide} 
              style={{
                zIndex: value,
                display: showModal ? 'grid' : 'none'
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