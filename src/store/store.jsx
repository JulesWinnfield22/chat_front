import { createContext, useContext, useState, useReducer } from 'react'
import authReducer from './authReducer'

const Context = createContext()
export const useStore = () => useContext(Context)

function GlobalContext({ children }) {
  const [auth, setAuth] = useReducer(authReducer, {})

  return (
    <Context.Provider value={{
      auth, setAuth
    }}>
      {
        children
      }
    </Context.Provider>
  )
}

export default GlobalContext