import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { bootPrefs } from './lib/prefs'
import App from './App.tsx'

// put the chosen font stack on <html> before first paint
bootPrefs()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
