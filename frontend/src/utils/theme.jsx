import {useState,useEffect} from "react"

export function useLocalStorage(key,initialValue) {
    const [value,setValue]=useState(() => {
        const saved=localStorage.getItem(key)
        return saved!==null ? JSON.parse(saved):initialValue
    })

    useEffect(() => {
        localStorage.setItem(key,JSON.stringify(value))
    },[value,key])

    return [value,setValue]
}