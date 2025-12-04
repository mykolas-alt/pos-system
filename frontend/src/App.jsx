import {BrowserRouter,Routes,Route,useNavigate,useLocation} from 'react-router-dom'
import {useEffect,useState} from "react"
import {Toaster,toast} from 'react-hot-toast'
import './App.css'

import {MainNav} from './components/navbars/mainNav.jsx'
import {CateringNav} from './components/navbars/cateringNav.jsx'
import {BeautyNav} from './components/navbars/beautyNav.jsx'

import {Main} from './pages/main.jsx'
import {BusinessCreate} from './pages/businessCreate.jsx'
import {Catering} from './pages/catering/main.jsx'
import {Orders} from './pages/catering/orders.jsx'
import {OrderView} from './pages/catering/orderView.jsx'
import {Beauty} from './pages/beauty/main.jsx'
import {Rezervations} from './pages/beauty/rezervations.jsx'
import {Report} from './pages/catering/report.jsx'

import {getDb,saveDb} from './utils/tempDB.jsx'
import {useTheme} from './utils/themeContext.jsx'

import Visible_Light from "./assets/visible_icon_light.png"
import Visible_Dark from "./assets/visible_icon_dark.png"
import Hidden_Light from "./assets/hidden_icon_light.png"
import Hidden_Dark from "./assets/hidden_icon_dark.png"

function App(){
  const navigate=useNavigate()
  const location=useLocation()

  const [isPanelVisible,setIsPanelVisible]=useState(false)
  const [isRegister,setIsRegister]=useState(false)
  const [isPasswordVisible,setIsPasswordVisible]=useState(false)
  const {theme,toggleTheme}=useTheme()

  const [loginInput,setLoginInput]=useState("")
  const [loginPassword,setLoginPassword]=useState("")
  
  const [regEmail,setRegEmail]=useState("")
  const [regUsername,setRegUsername]=useState("")
  const [regPassword,setRegPassword]=useState("")

  const [errors,setErrors]=useState([])

  const [isSessionLoading,setIsSessionLoading]=useState(true)
  const [user,setUser]=useState(null)
  const [userBusiness,setUserBusiness]=useState(null)

  let NavBarToShow=MainNav
  if(user){
    if(location.pathname.includes("/catering/")){
      NavBarToShow=CateringNav
    }else if(location.pathname.includes("/beauty/")){
      NavBarToShow=BeautyNav
    }
  }

  useEffect(() => {
    const db=getDb()
    const saved=localStorage.getItem("session")
    if(!saved){
      navigate("/")
      setIsSessionLoading(false)
      return
    }

    const session=JSON.parse(saved)

    if(!session || !session.user){
      localStorage.removeItem("session")
      navigate("/")
      setIsSessionLoading(false)
      return
    }

    if(Date.now()>session.expiresAt){
      localStorage.removeItem("session")
      navigate("/")
      setIsSessionLoading(false)
      return
    }

    setUser(session.user)
    const business=getUserBusiness(session.user.id)
    setUserBusiness(business)

    const correctPath=business ? `/${session.user.username}/${business.type}/${business.id}`:`/${session.user.username}`

    if(location.pathname!==correctPath)
      navigate(correctPath)

    setIsSessionLoading(false)
  },[])

  function getUserBusiness(userId){
    const db=getDb()

    const record=db.employees.find(e => e.userId===userId)
    if(!record)
      return null

    const business=db.businesses.find(b => b.id===record.businessId)
    return business || null
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
    const session={
      user,
      expiresAt:Date.now()+30*60*1000
    }
    localStorage.setItem("session",JSON.stringify(session))

    setIsPanelVisible(false)

    const business=getUserBusiness(user.id)
    if(!business){
      navigate(`/${user.username}`)
      return
    }

    setUserBusiness(business)

    navigate(`/${user.username}/${business.type}/${business.id}`)
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
    const session={
      user: newUser,
      expiresAt:Date.now()+30*60*1000
    }
    localStorage.setItem("session",JSON.stringify(session))

    setIsPanelVisible(false)
    navigate(`/${newUser.username}`)
  }

  function handleLogOut(){
    localStorage.removeItem("session")
    navigate("/")
    setUser(null)
    setUserBusiness(null)
  }

  function handleOrderOpening(id){
    if(!userBusiness || !user)
      return

    navigate(`/${user.username}/catering/${userBusiness.id}/orders/${id}`)
  }

  return(
    <div id="page">
      {isSessionLoading ? (
        <div className="loading_anim"/>
      ):(
        <>
          <Toaster position="top-right"/>
          <NavBarToShow onLoginClick={() => setIsPanelVisible(true)} user={user} business={userBusiness} onLogout={() => handleLogOut()}/>
          <div id="main_body">
            <Routes>
              <Route path='/' element={<Main/>}/>
              <Route path='/:username' element={<BusinessCreate setUserBusiness={setUserBusiness} user={user}/>}/>
              <Route path='/:username/catering/:id' element={<Catering user={user} business={userBusiness}/>}/>
              <Route path='/:username/catering/:id/orders' element={<Orders user={user} business={userBusiness} onOrderOpen={(orderId) => handleOrderOpening(orderId)}/>}/>
              <Route path='/:username/catering/:id/orders/:orderId' element={<OrderView user={user} business={userBusiness}/>}/>
              <Route path='/:username/beauty/:id' element={<Beauty user={user} business={userBusiness}/>}/>
              <Route path='/:username/beauty/:id/rezervations' element={<Rezervations user={user} business={userBusiness}/>}/>
              <Route path='/:username/catering/:id/report' element={<Report user={user} business={userBusiness}/>}/>
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
                            theme ? <img id="theme_icon" src={Visible_Light} alt="Visible Icon"/>:<img id="theme_icon" src={Visible_Dark} alt="Visible Icon"/>:
                            theme ? <img id="theme_icon" src={Hidden_Light} alt="Hidden Icon"/>:<img id="theme_icon" src={Hidden_Dark} alt="Hidden Icon"/>}
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
                            theme ? <img id="theme_icon" src={Visible_Light} alt="Visible Icon"/>:<img id="theme_icon" src={Visible_Dark} alt="Visible Icon"/>:
                            theme ? <img id="theme_icon" src={Hidden_Light} alt="Hidden Icon"/>:<img id="theme_icon" src={Hidden_Dark} alt="Hidden Icon"/>}
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
        </>
      )}
    </div>
  )
}

export default App
