import './assets/base.css'
import './assets/livekit-style.css'
import '@livekit/components-styles'
import '@livekit/components-styles/prefabs'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
