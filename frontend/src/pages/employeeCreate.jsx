import React,{useState,useEffect} from "react"
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-hot-toast'
import "./employeeCreate.css"

import {getDb,saveDb} from '../utils/tempDB.jsx'

export const EmployeeCreate=({user,business}) => {
    const navigate=useNavigate()
    const [employeeFirstName,setEmployeeFirstName]=useState("")
    const [employeeLastName,setEmployeeLastName]=useState("")
    const [employeeEmail,setEmployeeEmail]=useState("")
    
    const [errors,setErrors]=useState([])

    useEffect(() => {
        if(!user)
            navigate("/")
    },[user])

    function resetErrors(){
        setErrors([])
    }

    function registerEmployee(){
        resetErrors()
        const db=getDb()
        const newErrors={}

        if(!employeeFirstName.trim())
            newErrors.employeeFirstName="Enter Your First Name"
        if(!employeeLastName.trim())
            newErrors.employeeLastName="Enter Your Last Name"
        if(!employeeEmail.trim())
            newErrors.employeeEmail="Enter Email"

        if(Object.keys(newErrors).length>0){
            setErrors(newErrors)
            toast.error("Please fix the highlighted fields")
            return
        }

        const newEmployee={
            id:db.employees.length+1,
            userId:user.id,
            businessId:business.id,
            name:employeeFirstName+" "+employeeLastName,
            email:employeeEmail,
            role:"Savininkas"
        }

        db.employees.push(newEmployee)
        saveDb(db)

        toast.success(`Employee ${name} succesfully created`)
        navigate(`/${user.username}/${business.type}/${business.id}`)
    }
    
    return(
        <div id="new_register_info" className="col_align">
            <div id="new_register_label">New Employee</div>
            <hr/>
            <div id="new_register_info_item">
                <label>First Name:</label>
                <input className={errors.employeeFirstName ? "invalid":""} type="text" name="employee_first_name" value={employeeFirstName} onChange={(e) => setEmployeeFirstName(e.target.value)}/>
            </div>
            {errors.employeeFirstName && (
                <div className="error_text">
                    {errors.employeeFirstName}
                </div>
            )}
            <div id="new_register_info_item">
                <label>Last Name:</label>
                <input className={errors.employeeLastName ? "invalid":""} type="text" name="employee_last_name" value={employeeLastName} onChange={(e) => setEmployeeLastName(e.target.value)}/>
            </div>
            {errors.employeeLastName && (
                <div className="error_text">
                    {errors.employeeLastName}
                </div>
            )}
            <div id="new_register_info_item">
                <label>Email:</label>
                <input className={errors.employeeEmail ? "invalid":""} type="text" name="employee_email" value={employeeEmail} onChange={(e) => setEmployeeEmail(e.target.value)}/>
            </div>
            {errors.employeeEmail && (
                <div className="error_text">
                    {errors.employeeEmail}
                </div>
            )}
            <button id="new_register_button" onClick={() => registerEmployee()}>Register Employee</button>
        </div>
    )
}