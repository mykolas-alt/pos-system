import {BrowserRouter,Routes,Route,useNavigate,useLocation} from 'react-router-dom'
import {useState} from "react"
import {Toaster,toast} from 'react-hot-toast'
import './App.css'

import {MainNav} from './components/navbars/mainNav.jsx'
import {CateringNav} from './components/navbars/cateringNav.jsx'
import {BeautyNav} from './components/navbars/beautyNav.jsx'

import {Main} from './pages/main.jsx'
import {Home} from './pages/home.jsx'
import {Catering} from './pages/catering.jsx'
import {Beauty} from './pages/beauty.jsx'

import {getDb,saveDb} from './utils/tempDB.jsx'

import Visible from "./assets/visible_icon.png"
import Hidden from "./assets/hidden_icon.png"

function App(){
  const navigate=useNavigate()
  const location=useLocation()

  const [isPanelVisible,setIsPanelVisible]=useState(false)
  const [isRegister,setIsRegister]=useState(false)
  const [isPasswordVisible,setIsPasswordVisible]=useState(false)

  const [loginInput,setLoginInput]=useState("")
  const [loginPassword,setLoginPassword]=useState("")
  
  const [regEmail,setRegEmail]=useState("")
  const [regUsername,setRegUsername]=useState("")
  const [regPassword,setRegPassword]=useState("")

  const [errors,setErrors]=useState([])

  const [user,setUser]=useState(null)
  const currentBusiness=getBusiness()

  let NavBarToShow=MainNav
  if(location.pathname.includes("/catering/")){
    NavBarToShow=CateringNav
  }else if(location.pathname.includes("/beauty/")){
    NavBarToShow=BeautyNav
  }

  function getBusiness(){
    const db=getDb()
    const path=location.pathname

    const match=path.match(/\/(catering|beauty)\/(\d+)/)
    if(!match)
      return null

    const businessId=parseInt(match[2])
    return db.businesses.find(b => b.id===businessId) || null
  }

  function resetErrors(){
    setErrors([])
  }

  function handleLogin(){
    resetErrors()
    const db=getDb()
    const newErrors={}

    if(!loginInput.trim())
      newErrors.loginInput="Enter username or email"
    if(!loginPassword.trim())
      newErrors.loginPassword="Enter password"

    if(Object.keys(newErrors).length>0){
      setErrors(newErrors)
      toast.error("Please fix the highlighted fields")
      return
    }

    const user=db.users.find(
      (u) => (u.username===loginInput || u.email===loginInput) && u.password===loginPassword
    )

    if(!user){
      toast.error("Invalid username/email or password")
      setErrors({
        loginInput:"Incorrect credentials",
        loginPassword:"Incorrect credentials"
      })
      return
    }

    toast.success(`Welcome back, ${user.username}!`)
    setUser(user)
    setIsPanelVisible(false)
    navigate(`/${user.username}`)
  }

  function handleRegister(){
    resetErrors()
    const db=getDb()
    const newErrors={}

    if(!regEmail.trim())
      newErrors.regEmail="Enter email"
    else if(!/\S+@\S+\.\S+/.test(regEmail))
      newErrors.regEmail="Enter a valid email"
    if(db.users.some(u => u.email===regEmail))
      newErrors.regEmail="Email already in use"

    if(regUsername.length<3)
      newErrors.regUsername="Username must be at least 3 characters"
    if(db.users.some(u => u.username===regUsername))
      newErrors.regUsername="Username already in use"

    if(regPassword.length<6)
      newErrors.regPassword="Password must be at least 6 characters"

    if(Object.keys(newErrors).length>0){
      setErrors(newErrors)
      toast.error("Please fix the highlighted fields")
      return
    }

    const newUser={
      id:db.users.length+1,
      email:regEmail,
      username:regUsername,
      password:regPassword
    }

    db.users.push(newUser)
    saveDb(db)

    toast.success(`Account created! Welcome, ${newUser.username}!`)
    setUser(newUser)
    setIsPanelVisible(false)
    navigate(`/${newUser.username}`)
  }

  return(
    <div id='page'>
      <Toaster position="top-right"/>
      <NavBarToShow onLoginClick={() => setIsPanelVisible(true)} user={user} business={currentBusiness} onLogout={() => {setUser(null);navigate("/")}}/>
      <div id="main_body">
        <Routes>
          <Route path='/' element={user ? <Home user={user}/>:<Main/>}/>
          <Route path='/:username' element={user ? <Home user={user}/>:<Main/>}/>
          <Route path='/:username/catering/:id' element={<Catering user={user}/>}/>
          <Route path='/:username/beauty/:id' element={<Beauty user={user}/>}/>
        </Routes>
      </div>
      {isPanelVisible && (
        <>
          <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
          <div id="login_panel">
            <div id="acc_options" className="row_align">
              <button className="acc_button" onClick={() => {resetErrors();setIsRegister(false)}}>Prisijungti</button>
              <button className="acc_button" onClick={() => {resetErrors();setIsRegister(true)}}>Registracija</button>
            </div>
            <hr/>
            {isRegister ? (
              <>
                <div className="acc_input_fields">
                  <input className={"acc_input_field "+(errors.regEmail ? "invalid":"")} type="text" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} autoFocus/>
                  {errors.regEmail && (
                    <div className="error_text">
                      {errors.regEmail}
                    </div>
                  )}
                  <input className={"acc_input_field "+(errors.regUsername ? "invalid":"")} type="text" placeholder="Vartotojo Vardas" value={regUsername} onChange={(e) => setRegUsername(e.target.value)}/>
                  {errors.regUsername && (
                    <div className="error_text">
                      {errors.regUsername}
                    </div>
                  )}
                  <div className="password_wrapper">
                    <input className={"acc_password_field "+(errors.regPassword ? "invalid":"")} type={isPasswordVisible ? "text":"password"} placeholder="Slaptažodis" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}/>
                    <button className="password_toggle_button" onClick={() => setIsPasswordVisible(prev => !prev)}>
                      {isPasswordVisible ? 
                        <img id="theme_icon" src={Visible} alt="Visible Icon"/>:
                        <img id="theme_icon" src={Hidden} alt="Hidden Icon"/>}
                    </button>
                  </div>
                  {errors.regPassword && (
                    <div className="error_text">
                      {errors.regPassword}
                    </div>
                  )}
                </div>
                <button className="acc_submit_button" onClick={handleRegister}>Registruotis</button>
              </>
            ):(
              <>
                <div className="acc_input_fields">
                  <input className={"acc_input_field "+(errors.loginInput ? "invalid":"")} type="text" placeholder="Vartotojo Vardas ar Email" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} autoFocus/>
                  {errors.loginInput && (
                    <div className="error_text">
                      {errors.loginInput}
                    </div>
                  )}
                  <div className="password_wrapper">
                    <input className={"acc_password_field "+(errors.loginPassword ? "invalid":"")} type={isPasswordVisible ? "text":"password"} placeholder="Slaptažodis"  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    <button className="password_toggle_button" onClick={() => setIsPasswordVisible(prev => !prev)}>
                      {isPasswordVisible ? 
                        <img id="theme_icon" src={Visible} alt="Visible Icon"/>:
                        <img id="theme_icon" src={Hidden} alt="Hidden Icon"/>}
                    </button>
                  </div>
                  {errors.loginPassword && (
                    <div className="error_text">
                      {errors.loginPassword}
                    </div>
                  )}
                </div>
                <button className="acc_submit_button" onClick={handleLogin}>Prisijungti</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
