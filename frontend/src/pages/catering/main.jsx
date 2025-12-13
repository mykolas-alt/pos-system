import React,{useEffect} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./main.css"

import {getDb} from "../../utils/tempDB"

export const Catering=({user,business}) => {
    const navigate=useNavigate()
    const {id}=useParams()
    const db=getDb()

    useEffect(() => {
        if(!user)
            navigate("/")
    },[user])

    return(
        <div>
            Catering: {user.username}
            <p>{business.name}</p>
        </div>
    )
}