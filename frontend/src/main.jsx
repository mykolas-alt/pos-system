import {StrictMode} from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import {createRoot} from 'react-dom/client'
import './main.css'
import App from './App.jsx'

import {ThemeProvider} from './utils/themeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App/>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)