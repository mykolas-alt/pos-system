import React,{useState,useEffect,useRef} from "react"
import {NavLink,useNavigate} from "react-router-dom"
import "./navStyle.css"

import {useTheme} from '../../utils/themeContext.jsx'

import Sun from "../../assets/sun.png"
import Moon from "../../assets/moon.png"
import Home_Light from "../../assets/home_light.png"
import Home_Dark from "../../assets/home_dark.png"

export const NavBar=({onLoginClick,user,business,onLogout}) => {
    const navigate=useNavigate()
    const {theme,toggleTheme}=useTheme()
    const menuRef=useRef(null)
    const buttonRef=useRef(null)
    
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
        if(!user)
            navigate("/")
    },[user])

    return(
        <nav id="navbar">
            <div className="nav_item_positioning col_align">
                <div className="nav_item_positioning row_align">
                    <button id="home_button" className="nav_button" onClick={() => business ? navigate(`/${user.username}/${business.type}/${business.id}`):navigate("/")}>
                        <img id="home_icon" src={theme ? Home_Light:Home_Dark} alt="Home Icon"/>
                    </button>
                    <NavLink to={business ? `/${user.username}/${business.type}/${business.id}`:"/"} id="logo_icon">Logotipas</NavLink>
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
                {business && (
                    <div className="row_align">
                        {business.type==="catering" ? (
                            <>
                                <button id="business_nav_button" onClick={() => navigate(`/${user.username}/catering/${business.id}/orders`)}>Užsakymai</button>
                                <button id="business_nav_button">Pozicijos</button>
                            </>
                        ):(
                            <>
                                <button id="business_nav_button" onClick={() => navigate(`/${user.username}/beauty/${business.id}/reservations`)}>Rezervacijos</button>
                                <button id="business_nav_button">Paslaugos</button>
                            </>
                        )}
                        <button id="business_nav_button">Darbuotojai</button>
                        <button id="business_nav_button" onClick={() => navigate(`/${user.username}/${business.type}/${business.id}/report`)}>Statistika</button>
                    </div>
                )}
            </div>
        </nav>
    )
}