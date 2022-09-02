import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import '@/assets/fonts/Roboto/roboto.css'
import '@/assets/fonts/oxygen/oxygen.css'
import Context from './store/store'

import '@/index.css'
import App from '@/App' 

ReactDOM.render (
  <React.StrictMode>
    <BrowserRouter>
      <Context>
        <App />
      </Context>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
