import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./main.css"

import {getDb} from "../../utils/tempDB"

export const Beauty=({user,business}) => {
    const navigate=useNavigate()
    const {id}=useParams()
    const db=getDb()

    useEffect(() => {
        if(!user)
            navigate("/")
    },[user])

    if(!user)
        return null

    return(
        <div>
            Beauty: {user.username}
            <p>{business.name}</p>
        </div>
    )
}