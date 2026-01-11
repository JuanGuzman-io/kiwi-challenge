import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupGlobalErrorHandler } from './features/rewards/utils/logger'

// T128: Setup global error handler for client-side error logging
setupGlobalErrorHandler()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
