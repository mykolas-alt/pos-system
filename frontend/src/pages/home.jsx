import React,{useState,useEffect} from "react"
import {useNavigate} from 'react-router-dom'
import "./home.css"

import {getDb,saveDb} from '../utils/tempDB.jsx'

export const Home=({user}) => {
    const navigate=useNavigate()

    const [businesses,setBusinesses]=useState([])
    const [userData,setUserData]=useState(null)

    useEffect(() => {
        const db=getDb()

        const userInfo=db.employees.find(e => e.userId===user.id)
        setUserData(userInfo)

        const userBusinesses=db.employees
            .filter(e => e.userId===user.id)
            .map(e => e.businessId)

        const businessesData=db.businesses.filter(b => userBusinesses.includes(b.id))

        setBusinesses(businessesData)
    },[user])

    function handleBusinessClick(b){
        if(b.type==="catering"){
            navigate(`/${user.username}/catering/${b.id}`)
        }else if(b.type==="beauty"){
            navigate(`/${user.username}/beauty/${b.id}`)
        }
    }

    return(
        <div>
            <div className="controls row_align">
                <button className="control_button join_button">Prisijungti</button>
                <button className="control_button create_button">Sukurti Nauja</button>
            </div>
            <div className="item_list">
                {businesses.length===0 ? (
                    <p id="business_card_nofound">No businesses found</p>
                ):(
                    businesses.map(b => (
                        <div key={b.id} className="business_card col_align" onClick={() => handleBusinessClick(b)}>
                            <p className="business_card_name">{b.name}</p>
                            <div className="row_align">
                                <p className="business_card_type">Type: {b.type}</p>
                                <p className="business_card_role">Role: {b.ownerId===userData.id ? "Owner":"Employee"}</p>
                                <p className="business_card_empl">Employees: {getDb().employees.filter(e => e.businessId===b.id).length}</p>
                            </div>
                            <p className="business_card_address">{b.address}</p>
                            <p className="business_card_contact">Contact: {b.contactInfo}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}