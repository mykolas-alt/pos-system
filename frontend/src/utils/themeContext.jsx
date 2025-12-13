import {createContext,useContext,useState,useEffect} from "react"

const ThemeContext=createContext()

export const ThemeProvider=({children}) => {
    const [theme,setTheme]=useState(() => {
        const saved=localStorage.getItem("theme")
        return saved===null ? true:saved==="true"
    })

    useEffect(() => {
        if(!theme)
            document.documentElement.classList.add("dark")
        else
            document.documentElement.classList.remove("dark")
        
        localStorage.setItem("theme",theme)
    },[theme])

    const toggleTheme=() => {
        setTheme(prev => !prev)
    }

    return(
        <ThemeContext.Provider value={{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme=() => useContext(ThemeContext)