import React,{useEffect} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./main.css"

export const Catering=({user,business}) => {
    const navigate=useNavigate()
    const {id}=useParams()

    useEffect(() => {
        if(!user)
            navigate("/")
    },[user])

    if(!user || !user.info || !business)
        return null

    return(
        <div>
            Catering: {user.info.username}
            <p>{business.name}</p>
        </div>
    )
}