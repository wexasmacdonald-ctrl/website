import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { LanguageProvider } from './lib/i18n'

export function render(url: string) {
  return renderToString(
    <StrictMode>
      <LanguageProvider>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </LanguageProvider>
    </StrictMode>
  )
}
