import {StrictMode} from 'react'
import {HashRouter,Routes,Route} from 'react-router-dom'
import {createRoot} from 'react-dom/client'
import './main.css'
import App from './App.jsx'

import {ThemeProvider} from './utils/themeContext.jsx'

const base = import.meta.env.VITE_BASE_URL

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter basename={base}>
      <ThemeProvider>
        <App/>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>
)
