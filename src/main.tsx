import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { BrowserRouter } from 'react-router-dom'   //  라우터 import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>   {/* App을 감싼다 */}
      <App />
    </BrowserRouter>   {/* App을 감싼다 */}
  </React.StrictMode>
)