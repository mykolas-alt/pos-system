import React,{useState,useEffect,useRef} from "react"
import {NavLink} from "react-router-dom"
import "./mainNav.css"

import {useTheme} from '../../utils/themeContext.jsx'

import Sun from "../../assets/sun.png"
import Moon from "../../assets/moon.png"

export const MainNav=({onLoginClick,user,onLogout}) => {
    const {theme,toggleTheme}=useTheme()
    const [isAccountMenuVisible,setIsAccountMenuVisible]=useState(false)
    const menuRef=useRef(null)
    const buttonRef=useRef(null)

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
    },[user])

    return(
        <nav id="main_navbar">
            {user ? (
                <NavLink to={`/${user.username}`} className="logo_icon">Logotipas</NavLink>
            ):(
                <NavLink to="/" className="logo_icon">Logotipas</NavLink>
            )}
            <button className="nav_button theme_button" onClick={toggleTheme}>
                <div className="row_align">
                    {theme ? 
                    <img id="theme_icon" src={Sun} alt="Sun Icon"/>:
                    <img id="theme_icon" src={Moon} alt="Moon Icon"/>}
                    Tema
                </div>
            </button>
            {user ? (
                <>
                    <button className="nav_button account_button" ref={buttonRef} onClick={() => setIsAccountMenuVisible(prev => !prev)}>{user.username}</button>
                    {isAccountMenuVisible && (
                        <div id="account_menu" ref={menuRef}>
                            <button className="account_menu_button" onClick={onLogout}>Atsijungti</button>
                        </div>
                    )}
                </>
            ):(
                <button className="nav_button account_button" onClick={onLoginClick}>Prisijungti</button>
            )}
        </nav>
    )
}