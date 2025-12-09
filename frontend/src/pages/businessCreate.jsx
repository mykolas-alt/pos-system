import React,{useState,useEffect} from "react"
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-hot-toast'
import "./businessCreate.css"

import {getDb,saveDb} from '../utils/tempDB.jsx'

export const BusinessCreate=({setUserBusiness,user}) => {
    const navigate=useNavigate()
    const [businessType,setBusinessType]=useState("catering")
    const [businessName,setBusinessName]=useState("")
    const [businessAddress,setBusinessAddress]=useState("")
    const [businessContactInfo,setBusinessContactInfo]=useState("")
    
    const [errors,setErrors]=useState([])

    useEffect(() => {
        if(!user)
            navigate("/")
    },[user])

    function resetErrors(){
        setErrors([])
    }

    function registerBusiness(){
        resetErrors()
        const db=getDb()
        const newErrors={}

        if(!businessName.trim())
            newErrors.businessName="Enter Business Name"

        if(Object.keys(newErrors).length>0){
            setErrors(newErrors)
            toast.error("Please fix the highlighted fields")
            return
        }

        const newBusiness={
            id:db.businesses.length+1,
            ownerId:user.id,
            type:businessType,
            name:businessName,
            address:businessAddress,
            contactInfo:businessContactInfo
        }

        db.businesses.push(newBusiness)
        saveDb(db)

        toast.success(`Business ${businessName} succesfully created`)
        setUserBusiness(newBusiness)
        navigate(`/${user.username}/${businessType}/${newBusiness.id}`)
    }
    
    return(
        <div id="new_register_info" className="col_align">
            <div id="new_register_label">New Business</div>
            <hr/>
            <div id="new_register_info_item">
                <label>Type:</label>
                <div className="row_align">
                    <div id="new_register_radio_option">
                        <input type="radio" name="business_type" checked={businessType==="catering"} onChange={() => setBusinessType("catering")}/>
                        Catering
                    </div>
                    <div id="new_register_radio_option">
                        <input type="radio" name="business_type" checked={businessType==="beauty"} onChange={() => setBusinessType("beauty")}/>
                        Beauty
                    </div>
                </div>
            </div>
            <div id="new_register_info_item">
                <label>Name:</label>
                <input className={errors.businessName ? "invalid":""} type="text" name="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)}/>
            </div>
            {errors.businessName && (
                <div className="error_text">
                    {errors.businessName}
                </div>
            )}
            <div id="new_register_info_item">
                <label>Address:</label>
                <input type="text" name="business_address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)}/>
            </div>
            <div id="new_register_info_item">
                <label>Contact Info:</label>
                <input type="text" name="business_contact_info" value={businessContactInfo} onChange={(e) => setBusinessContactInfo(e.target.value)}/>
            </div>
            <button id="new_register_button" onClick={() => registerBusiness()}>Register Business</button>
        </div>
    )
}