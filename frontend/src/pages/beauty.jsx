import React from "react"
import {useParams} from "react-router-dom"
import "./beauty.css"

import {getDb} from "../utils/tempDB"

export const Beauty=({user}) => {
    const {id}=useParams()
    const db=getDb()
    const business=db.businesses.find(b => b.id===parseInt(id))

    return(
        <div>
            Beauty: {user.username}
            <p>{business.name}</p>
        </div>
    )
}