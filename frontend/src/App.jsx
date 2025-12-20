import {BrowserRouter,Routes,Route,useNavigate,useLocation} from 'react-router-dom'
import {useEffect,useState} from "react"
import {Toaster,toast} from 'react-hot-toast'
import './App.css'

import {NavBar} from './components/navbars/navBar.jsx'

import {Main} from './pages/main.jsx'
import {BusinessCreate} from './pages/businessCreate.jsx'
import {Catering} from './pages/catering/main.jsx'
import {Orders} from './pages/catering/orders.jsx'
import {OrderView} from './pages/catering/orderView.jsx'
import {Products} from './pages/catering/products.jsx'

import {Beauty} from './pages/beauty/main.jsx'
import {Reservations} from './pages/beauty/reservations.jsx'
import {ReservationView} from './pages/beauty/reservationView.jsx'
import {Services} from './pages/beauty/services.jsx'

import {Employees} from './pages/employees.jsx'
import {Report} from './pages/catering/report.jsx'

import {useTheme} from './utils/themeContext.jsx'

import Visible_Light from "./assets/visible_icon_light.png"
import Visible_Dark from "./assets/visible_icon_dark.png"
import Hidden_Light from "./assets/hidden_icon_light.png"
import Hidden_Dark from "./assets/hidden_icon_dark.png"

function App(){
  const apiPath="http://localhost:8080/"
  const navigate=useNavigate()
  const location=useLocation()

  const [isPanelVisible,setIsPanelVisible]=useState(false)
  const [isRegister,setIsRegister]=useState(false)
  const [isPasswordVisible,setIsPasswordVisible]=useState(false)
  const {theme,toggleTheme}=useTheme()

  const [loginInput,setLoginInput]=useState("")
  const [loginPassword,setLoginPassword]=useState("")
  
  const [regUsername,setRegUsername]=useState("")
  const [regPassword,setRegPassword]=useState("")

  const [errors,setErrors]=useState([])

  const [isSessionLoading,setIsSessionLoading]=useState(true)

  const [user,setUser]=useState(null)
  const [userBusiness,setUserBusiness]=useState(null)

  useEffect(() => {
    async function initSession(){
      const saved=localStorage.getItem("session")
      if(!saved){
        setIsSessionLoading(false)
        navigate("/")
        return
      }

      const session=JSON.parse(saved)

      if(!session?.token || Date.now()>session.expiresAt){
        localStorage.removeItem("session")
        setIsSessionLoading(false)
        navigate("/")
        return
      }

      try{
        const userInfo=await loadUserInfo(session.token)
        
        let businessInfo=null
        try{
          businessInfo=await loadBusinessInfo(session.token)
        }catch{
          businessInfo=null
        }

        setUser({
          token: session.token,
          info: userInfo
        })
        setUserBusiness(businessInfo)
      }catch{
        localStorage.removeItem("session")
        setUser(null)
        setUserBusiness(null)
        navigate("/")
      }finally{
        setIsSessionLoading(false)
      }
    }

    initSession()
  },[])

  useEffect(() => {
    if(isSessionLoading || !user)
      return

    let correctPath
    if(userBusiness){
      correctPath=`/${user.info.username}/${userBusiness.businessType}/${userBusiness.id}`
    }else{
      correctPath=`/${user.info.username}/register/business`
    }

    if(!location.pathname.includes(correctPath))
      navigate(correctPath)
  },[user,userBusiness,isSessionLoading])

  async function loadUserInfo(token){
    const response=await fetch(`${apiPath}auth/user`,{
      method: "GET",
      headers: {"Authorization":`Bearer ${token}`}
    })

    if(!response.ok){
      throw new Error("Failed to load user info")
    }

    return await response.json()
  }

  async function loadBusinessInfo(token){
    const response=await fetch(`${apiPath}business`,{
      method: "GET",
      headers: {"Authorization":`Bearer ${token}`}
    })

    if(!response.ok){
      throw new Error("Failed to load business info")
    }

    return await response.json()
  }

  function resetErrors(){
    setErrors([])
  }

  async function handleLogin(){
    resetErrors()
    const newErrors={}

    if(!loginInput.trim())
      newErrors.loginInput="Įveskite vartotojo vardą arba email"
    if(!loginPassword.trim())
      newErrors.loginPassword="Įveskite slaptažodį"

    if(Object.keys(newErrors).length>0){
      setErrors(newErrors)
      toast.error("Prašau pataisikit paryškintas vietas")
      return
    }

    try{
      const response=await fetch(`${apiPath}auth/login`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: loginInput,
          password: loginPassword
        })
      })

      if(!response.ok){
        throw new Error("Invalid credentials")
      }

      const data=await response.json()
      const session={
        token: data.token,
        expiresAt: Date.now()+30*60*1000
      }
      localStorage.setItem("session",JSON.stringify(session))

      const userInfo=await loadUserInfo(session.token)
      
      toast.success(`Sveiki sugriže, ${loginInput}!`)

      setUser({
        token: session.token,
        info: userInfo
      })
      setUserBusiness(userInfo.business || null)

      setIsPanelVisible(false)
    }catch{
      toast.error("Neteisingas vartotojo vardas arba slaptažodis")
      setErrors({
        loginInput:"Neteisingi prisijungimo duomenys",
        loginPassword:"Neteisingi prisijungimo duomenys"
      })
    }
  }

  async function handleRegister(){
    resetErrors()
    const newErrors={}

    if(regUsername.length<3)
      newErrors.regUsername="Vartotojo vardas turetu buti minimum 3 simboliai"

    if(regPassword.length<6)
      newErrors.regPassword="Slaptažodis turetu buti minimum 6 simboliai"

    if(Object.keys(newErrors).length>0){
      setErrors(newErrors)
      toast.error("Prašau pataisikit paryškintas vietas")
      return
    }

    try{
      const response=await fetch(`${apiPath}auth/register`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: regUsername,
          password: regPassword
        })
      })

      if(!response.ok){
        throw new Error("Register failed")
      }

      const data=await response.json()
      const session={
        token: data.token,
        expiresAt: Date.now()+30*60*1000
      }
      localStorage.setItem("session",JSON.stringify(session))

      const userInfo=await loadUserInfo(session.token)

      setUser({
        token: session.token,
        info: userInfo
      })
      setUserBusiness(null)
      setIsPanelVisible(false)

      navigate(`/${userInfo.username}/register/business`)
    }catch{
      toast.error("Registracija nepavyko")
    }
  }

  function handleLogOut(){
    localStorage.removeItem("session")
    setUserBusiness(null)
    setUser(null)
    navigate("/")
  }

  function handleOrderOpening(id){
    if(!userBusiness || !user)
      return

    navigate(`/${user.info.username}/CATERING/${userBusiness.id}/orders/${id}`)
  }

  function handleReservationOpening(id){
    if(!userBusiness || !user)
      return

    navigate(`/${user.info.username}/beauty/${userBusiness.id}/reservations/${id}`)
  }

  return(
    <div id="page">
      {isSessionLoading ? (
        <div id="loading_anim"/>
      ):(
        <>
          <Toaster
            position="top-center"
            toastOptions={{
              style:{
                color:"var(--text-color)",
                background:"var(--tertiary-background-color)",
                border:"2px solid var(--detail-color)",
                borderRadius:"10px",
                boxShadow:"0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)",
                padding:"12px 18px",
                textDecoration:"none",
                fontSize:"1.1rem",
                transition:"background-color 0.3s ease,border-color 0.3s ease,color 0.3s ease"
              },

              error:{
                style:{
                  border:"2px solid var(--error-text-color)"
                }
              }
            }}
          />
          <NavBar onLoginClick={() => setIsPanelVisible(true)} user={user} business={userBusiness} onLogout={() => handleLogOut()}/>
          <div id="main_body">
            <Routes>
              <Route path='/' element={<Main/>}/>
              <Route path='/:username/register/business' element={<BusinessCreate api={apiPath} setUserBusiness={setUserBusiness} user={user}/>}/>
              <Route path='/:username/CATERING/:id' element={<Catering user={user} business={userBusiness}/>}/>
              <Route path='/:username/CATERING/:id/orders' element={<Orders api={apiPath} user={user} business={userBusiness} onOrderOpen={(orderId) => handleOrderOpening(orderId)}/>}/>
              <Route path='/:username/CATERING/:id/orders/:orderId' element={<OrderView api={apiPath} user={user} business={userBusiness}/>}/>
              <Route path='/:username/CATERING/:id/products' element={<Products api={apiPath} user={user} business={userBusiness}/>}/>
              <Route path='/:username/BEAUTY_SALON/:id' element={<Beauty user={user} business={userBusiness}/>}/>
              <Route path='/:username/BEAUTY_SALON/:id/reservations' element={<Reservations api={apiPath} user={user} business={userBusiness} onReservationOpen={(reservationId) => handleReservationOpening(reservationId)}/>}/>
              <Route path='/:username/BEAUTY_SALON/:id/reservations/:reservationId' element={<ReservationView api={apiPath} user={user} business={userBusiness}/>}/>
              <Route path='/:username/BEAUTY_SALON/:id/services' element={<Services api={apiPath} user={user} business={userBusiness}/>}/>
              <Route path='/:username/:businessType/:id/employees' element={<Employees api={apiPath} user={user} business={userBusiness}/>}/>
              <Route path='/:username/:businessType/:id/report' element={<Report user={user} business={userBusiness}/>}/>
            </Routes>
          </div>
          {isPanelVisible && (
            <>
              <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
              <div id="login_panel">
                <button className="close_button" onClick={() => setIsPanelVisible(false)}>X</button>
                <div id="acc_options" className="row_align">
                  <button id="acc_button" onClick={() => {resetErrors();setIsPasswordVisible(false);setIsRegister(false)}}>Prisijungti</button>
                  <button id="acc_button" onClick={() => {resetErrors();setIsPasswordVisible(false);setIsRegister(true)}}>Registracija</button>
                </div>
                <hr/>
                {isRegister ? (
                  <>
                    <div id="acc_input_fields">
                      <input className={"acc_input_field "+(errors.regUsername ? "invalid":"")} type="text" placeholder="Vartotojo Vardas" value={regUsername} onChange={(e) => setRegUsername(e.target.value)}/>
                      {errors.regUsername && (
                        <div className="error_text">
                          {errors.regUsername}
                        </div>
                      )}
                      <div className={"password_wrapper "+(errors.regPassword ? "invalid":"")}>
                        <input className="acc_password_field" type={isPasswordVisible ? "text":"password"} placeholder="Slaptažodis" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}/>
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
                    <button id="acc_submit_button" onClick={handleRegister}>Registruotis</button>
                  </>
                ):(
                  <>
                    <div id="acc_input_fields">
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
                    <button id="acc_submit_button" onClick={handleLogin}>Prisijungti</button>
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
