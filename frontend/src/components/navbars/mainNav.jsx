import React,{useState,useEffect} from "react"
import {NavLink} from "react-router-dom"
import "./mainNav.css"

import { useLocalStorage } from "../../utils/theme"

import Sun from "../../assets/sun.png"
import Moon from "../../assets/moon.png"

export const MainNav=() => {
    const [theme,setTheme]=useLocalStorage("theme",false)

    useEffect(() => {
        if(theme){
            document.documentElement.classList.add("dark")
        }else{
            document.documentElement.classList.remove("dark")
        }
    },[theme])

    return(
        <nav id="main_navbar">
            <NavLink to="/" className="logo_icon">Logotipas</NavLink>
            <button className="nav_button theme_button" onClick={() => setTheme(prev => !prev)}>
                <div className="row_align">
                    {theme ? 
                    <img id="theme_icon" src={Moon} alt="Moon Icon"/>:
                    <img id="theme_icon" src={Sun} alt="Sun Icon"/>}
                    Tema
                </div>
            </button>
            <button className="nav_button account_button">Prisijungti</button>
        </nav>
    )
}