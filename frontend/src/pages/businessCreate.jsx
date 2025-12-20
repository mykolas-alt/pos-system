import {useState,useEffect} from "react"
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-hot-toast'
import "./businessCreate.css"

export const BusinessCreate=({api,setUserBusiness,user}) => {
    const navigate=useNavigate()
    const [businessType,setBusinessType]=useState("CATERING")
    const [businessName,setBusinessName]=useState("")
    const [businessAddress,setBusinessAddress]=useState("")
    const [businessContactInfo,setBusinessContactInfo]=useState("")

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

    async function registerBusiness(){
        resetErrors()
        const newErrors={}

        if(!businessName.trim())
            newErrors.businessName="Įveskite verslo pavadinimą"
        if(!businessAddress.trim())
            newErrors.businessAddress="Įveskite verslo adresą"
        if(!businessContactInfo.trim())
            newErrors.businessContactInfo="Įveskite verslo kontaktinę informaciją"
        if(!employeeFirstName.trim())
            newErrors.employeeFirstName="Įveskite savo vardą"
        if(!employeeLastName.trim())
            newErrors.employeeLastName="Įveskite savo pavardę"
        if(!employeeEmail.trim())
            newErrors.employeeEmail="Įveskite savo el. paštą"

        if(Object.keys(newErrors).length>0){
            setErrors(newErrors)
            toast.error("Please fix the highlighted fields")
            return
        }

        try{
            const response=await fetch(`${api}business`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ownerEmail: employeeEmail,
                    ownerName: `${employeeFirstName} ${employeeLastName}`,
                    businessName,
                    address: businessAddress,
                    contactInfo: businessContactInfo,
                    businessType: businessType
                })
            })

            if(!response.ok){
                throw new Error("Failed to create business")
            }

            toast.success(`Verslas ${businessName} ir darbuotojas ${employeeFirstName} sėkmingai sukurtas`)

            const business=await fetch(`${api}business`,{
                method: "GET",
                headers: {"Authorization": `Bearer ${user.token}`}
            }).then(res => res.json())

            setUserBusiness(business)
            navigate(`/${user.info.username}/${business.businessType}/${business.id}`)
            return
        }catch{
            toast.error("Klaida kuriant verslą ir darbuotoją")
        }
    }

    if(!user || !user.info)
        return null
    
    return(
        <div>
            <div id="register_panel" className="row_align">
                <div id="new_register_info" className="col_align">
                    <div id="new_register_label">Naujas versla</div>
                    <hr/>
                    <div id="new_register_info_item">
                        <label>Tipas:</label>
                        <div className="row_align">
                            <div id="new_register_radio_option">
                                <input type="radio" name="business_type" checked={businessType==="CATERING"} onChange={() => setBusinessType("CATERING")}/>
                                Maitinimas
                            </div>
                            <div id="new_register_radio_option">
                                <input type="radio" name="business_type" checked={businessType==="BEAUTY_SALON"} onChange={() => setBusinessType("BEAUTY_SALON")}/>
                                Grožis
                            </div>
                        </div>
                    </div>
                    <div id="new_register_info_item">
                        <label>Pavadinimas:</label>
                        <input className={errors.businessName ? "invalid":""} type="text" name="business_name" value={businessName} onChange={(e) => setBusinessName(e.target.value)}/>
                    </div>
                    {errors.businessName && (
                        <div className="error_text">
                            {errors.businessName}
                        </div>
                    )}
                    <div id="new_register_info_item">
                        <label>Adresas:</label>
                        <input type="text" name="business_address" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)}/>
                    </div>
                    <div id="new_register_info_item">
                        <label>Kontaktinė informacija:</label>
                        <input type="text" name="business_contact_info" value={businessContactInfo} onChange={(e) => setBusinessContactInfo(e.target.value)}/>
                    </div>
                </div>
                <div id="new_register_info" className="col_align">
                    <div id="new_register_label">Naujas Darbuotojas</div>
                    <hr/>
                    <div id="new_register_info_item">
                        <label>Vardas:</label>
                        <input className={errors.employeeFirstName ? "invalid":""} type="text" name="employee_first_name" value={employeeFirstName} onChange={(e) => setEmployeeFirstName(e.target.value)}/>
                    </div>
                    {errors.employeeFirstName && (
                        <div className="error_text">
                            {errors.employeeFirstName}
                        </div>
                    )}
                    <div id="new_register_info_item">
                        <label>Pavardė:</label>
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
                </div>
            </div>
            <button id="new_register_button" onClick={registerBusiness}>Užregistruoti</button>
        </div>
    )
}