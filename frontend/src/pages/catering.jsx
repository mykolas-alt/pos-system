import React from "react"
import {useParams} from "react-router-dom"
import "./catering.css"

import {getDb} from "../utils/tempDB"

export const Catering=({user}) => {
    const {id}=useParams()
    const db=getDb()
    const business=db.businesses.find(b => b.id===parseInt(id))

    return(
        <div>
            Catering: {user.username}
            <p>{business.name}</p>
        </div>
    )
}