import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './lib/i18n'

const container = document.getElementById('root')

const app = (
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>
)

if (container) {
  if (container.hasChildNodes()) {
    hydrateRoot(container, app)
  } else {
    createRoot(container).render(app)
  }
}
