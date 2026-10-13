import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DirectionProvider } from '@/components/ui/direction'
import { applyDirection, getDirection } from '@/lib/direction'

const direction = getDirection()
applyDirection(direction)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DirectionProvider dir={direction}>
      <App />
    </DirectionProvider>
  </StrictMode>,
)
