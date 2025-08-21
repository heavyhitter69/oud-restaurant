import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'

// Force cache refresh - CACHE BUST v5
console.log('🔄 App loading - Cache Bust v5 - Force Logout Removed');

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </HashRouter>
)
