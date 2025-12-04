import React,{useEffect} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./main.css"

import {getDb} from "../../utils/tempDB"

export const Beauty=({user,business}) => {
    const navigate=useNavigate()
    const {id}=useParams()
    const db=getDb()
    
    const [isResModalOpen,setIsResModalOpen]=useState(false)
    const [resForm,setResForm]=useState({custumerName:'',customerPhone:'',serviceId:'',appointmentTime:''})
    const [servicesList,setServicesList]=useState([])

    
    function handleCreateReservation(){
        if(!business){
            alert('Nėra verslo informacijos')
            return
        }

        const db = getDb()
        const services = db.services.filter(s => s.businessId===business.id)
        setServicesList(services)
        setResForm(prev => ({
            ...prev,
            serviceId: services.length>0 ? String(services[0].id) : ''
        }))
        setIsResModalOpen(true)
    }

    function handleResChange(e){
        const {name, value} = e.target
        setResForm(prev => ({...prev, [name]: value}))
    }

    function handleSubmitReservation(e){
        e.preventDefault()
        if(!business){
            alert('Nėra verslo informacijos')
            return
        }

        const db = getDb()
        const newRes = {
            id: db.reservations.length + 1,
            businessId: business.id,
            serviceId: resForm.serviceId ? Number(resForm.serviceId) : null,
            appointmentTime: new Date(resForm.appointmentTime),
            custumerName: resForm.custumerName,
            customerPhone: resForm.customerPhone,
            status: "Atvira",
            createdAt: new Date(),
            closedAt: ""
        }

        db.reservations.push(newRes)
        saveDb(db)
        alert('Rezervacija sukurta')
        setIsResModalOpen(false)
        setResForm({custumerName:'',customerPhone:'',serviceId:'',appointmentTime:''})
    }

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

/*<button className="control_button" onClick={handleCreateReservation}>Sukurti Rezervaciją</button>

            {isResModalOpen && (
                <div className="modal_overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
                    <div className="modal" style={{background:'#fff',padding:20,borderRadius:6,width:400,maxWidth:'95%'}}>
                        <h3>Sukurti rezervaciją - {business?.name || ''}</h3>
                        <form onSubmit={handleSubmitReservation}>
                            <div style={{marginBottom:8}}>
                                <label>Vardas:<br/>
                                    <input name="custumerName" value={resForm.custumerName} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Telefonas:<br/>
                                    <input name="customerPhone" value={resForm.customerPhone} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Paslauga:<br/>
                                    <select name="serviceId" value={resForm.serviceId} onChange={handleResChange} style={{width:'100%'}}>
                                        {servicesList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Laikas:<br/>
                                    <input name="appointmentTime" type="datetime-local" value={resForm.appointmentTime} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                                <button type="button" onClick={() => setIsResModalOpen(false)}>Atšaukti</button>
                                <button type="submit">Sukurti</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}*/