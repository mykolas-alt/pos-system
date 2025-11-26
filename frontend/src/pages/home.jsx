import React from "react"
import "./home.css"

export const Home=({user}) => {
    return(
        <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Your email: {user.email}</p>
        </div>
    )
}