import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { LanguageDirection } from '@/i18n/DirectionSync'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageDirection>
      <App />
    </LanguageDirection>
  </StrictMode>,
)
