import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'

import {MainNav} from './components/navbars/mainNav.jsx'

import {Main} from './pages/main.jsx'

function App(){
  return(
    <div id='page'>
      <BrowserRouter>
        <MainNav/>
        <div id="main_body">
          <Routes>
            <Route path='/' element={<Main/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
