import React,{useState,useEffect,useRef} from "react"
import {NavLink,useNavigate} from "react-router-dom"
import "./navStyle.css"

import {useTheme} from '../../utils/themeContext.jsx'

import Sun from "../../assets/sun.png"
import Moon from "../../assets/moon.png"
import Home_Light from "../../assets/home_light.png"
import Home_Dark from "../../assets/home_dark.png"
import {getDb} from "../../utils/tempDB.jsx"

export const NavBar=({onLoginClick,user,business,onLogout}) => {
    const navigate=useNavigate()
    const {theme,toggleTheme}=useTheme()
    const menuRef=useRef(null)
    const buttonRef=useRef(null)

    const [employee,setEmployee]=useState(null)
    
    const [isAccountMenuVisible,setIsAccountMenuVisible]=useState(false)

    useEffect(() => {
        function handleClickOutside(event){
            if(isAccountMenuVisible && menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target))
                setIsAccountMenuVisible(false)
        }

        document.addEventListener("mousedown",handleClickOutside)
        return () => {
            document.removeEventListener("mousedown",handleClickOutside)
        }
    },[isAccountMenuVisible])
    
    useEffect(() => {
        setIsAccountMenuVisible(false)
        if(!user){
            navigate("/")
            return
        }

        const db=getDb()
        const employee=db.employees.find(e => e.userId===user.id)
        setEmployee(employee)
    },[user])

    function homePath(){
        let path="/"

        if(user){
            if(business){
                if(employee){
                    path=`/${user.username}/${business.type}/${business.id}`
                }else{
                    path=`/${user.username}/register/employee`
                }
            }else{
                path=`/${user.username}/register/business`
            }
        }else{
            path="/"
        }

        return path
    }

    return(
        <nav id="navbar">
            <div className="nav_item_positioning col_align">
                <div className="nav_item_positioning row_align">
                    <button id="home_button" className="nav_button" onClick={() => navigate(homePath())}>
                        <img id="home_icon" src={theme ? Home_Light:Home_Dark} alt="Home Icon"/>
                    </button>
                    <NavLink to={homePath()} id="logo_icon">Logotipas</NavLink>
                    {business && (
                        <div id="nav_title">{business.name}</div>
                    )}
                    <button id="theme_button" className="nav_button" onClick={toggleTheme}>
                        <img id="theme_icon" src={theme ? Sun:Moon} alt="Theme Icon"/>
                    </button>
                    {user ? (
                        <>
                            <button id="account_button" className="nav_button" ref={buttonRef} onClick={() => setIsAccountMenuVisible(prev => !prev)}>{user.username}</button>
                            {isAccountMenuVisible && (
                                <div id="account_menu" className="col_align" ref={menuRef}>
                                    <button id="logout_button" className="account_menu_button" onClick={onLogout}>Atsijungti</button>
                                </div>
                            )}
                        </>
                    ):(
                        <button id="account_button" className="nav_button" onClick={onLoginClick}>Prisijungti</button>
                    )}
                </div>
                {business && employee && (
                    <div className="row_align">
                        {business.type==="catering" ? (
                            <>
                                <NavLink to={`/${user.username}/catering/${business.id}/orders`} className={({isActive}) => `business_nav_button ${isActive ? "active":""}`}>Užsakymai</NavLink>
                                <NavLink to={`/${user.username}/catering/${business.id}/products`} className={({isActive}) => `business_nav_button ${isActive ? "active":""}`}>Pozicijos</NavLink>
                            </>
                        ):(
                            <>
                                <NavLink to={`/${user.username}/beauty/${business.id}/reservations`} className={({isActive}) => `business_nav_button ${isActive ? "active":""}`}>Rezervacijos</NavLink>
                                <NavLink to={`/${user.username}/beauty/${business.id}/services`} className={({isActive}) => `business_nav_button ${isActive ? "active":""}`}>Paslaugos</NavLink>
                            </>
                        )}
                        <NavLink to={`/${user.username}/${business.type}/${business.id}/employees`} className={({isActive}) => `business_nav_button ${isActive ? "active":""}`}>Darbuotojai</NavLink>
                        <NavLink to={`/${user.username}/${business.type}/${business.id}/report`} className={({isActive}) => `business_nav_button ${isActive ? "active":""}`}>Statistika</NavLink>
                    </div>
                )}
            </div>
        </nav>
    )
}