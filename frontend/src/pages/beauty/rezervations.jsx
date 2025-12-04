import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./rezervations.css"

import {getDb, saveDb} from "../../utils/tempDB"

export const Rezervations=({user,business,onOrderOpen}) => {
    const navigate=useNavigate()

    const [rezervations,setRezervations]=useState([])

    const [isResModalOpen,setIsResModalOpen]=useState(false)
    const [resForm,setResForm]=useState({customerName:'',customerPhone:'',serviceId:'',appointmentTime:''})
    const [servicesList,setServicesList]=useState([])

    const formatter=new Intl.DateTimeFormat("lt-LT",{
        year:"numeric",
        month:"2-digit",
        day:"2-digit",
        hour:"2-digit",
        minute:"2-digit",
    })

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }

        loadRezervations()
    },[user])

    function loadRezervations(){
        const db=getDb()

        const rezervationsData=db.reservations
            .filter(r => r.businessId===business.id)

        rezervationsData.forEach(rezervation => {
            const rezervationService=db.services.find(s => s.id===rezervation.serviceId)
            
            rezervation.total=rezervationService.price!==undefined ? rezervationService.price:0
        });

        setRezervations(rezervationsData)
    }

    function getNextId(arr){
        return arr.reduce((m,it) => Math.max(m,(it && it.id) || 0),0)+1
    }

    function createOrder(){
        const db=getDb()

        const nextId=getNextId(db.orders)
        const newOrder={
            id:nextId,
            businessId:business.id,
            status:"Atvira",
            createdAt:new Date(),
            closedAt:"",
            comment:""
        }

        db.orders.push(newOrder)
        saveDb(db)
        onOrderOpen(nextId)
    }

    function handleCreateReservation(){
        if(!business){
            alert('Nėra verslo informacijos')
            return
        }

        const db = getDb()
        const services = (db.services || []).filter(s => s.businessId===business.id)
        setServicesList(services)
        setResForm(prev => ({
            ...prev,
            serviceId: services.length>0 ? String(services[0].id) : ''
        }))
        setIsResModalOpen(true)
    }

    function handleResChange(e){
        const {name,value} = e.target
        setResForm(prev => ({...prev,[name]:value}))
    }

    function handleSubmitReservation(e){
        e.preventDefault()
        if(!business){
            alert('Nėra verslo informacijos')
            return
        }

        const db = getDb()
        const nextId = getNextId(db.reservations || [])
        const newRes = {
            id: nextId,
            businessId: business.id,
            serviceId: resForm.serviceId ? Number(resForm.serviceId) : null,
            appointmentTime: resForm.appointmentTime ? new Date(resForm.appointmentTime) : null,
            customerName: resForm.customerName,
            customerPhone: resForm.customerPhone,
            status: "Atvira",
            createdAt: new Date(),
            closedAt: ""
        }

        db.reservations = db.reservations || []
        db.reservations.push(newRes)
        saveDb(db)
        const service = (db.services || []).find(s => s.id === newRes.serviceId)
        const serviceName = service ? service.name : 'Nėra'
        const timeStr = newRes.appointmentTime ? new Date(newRes.appointmentTime).toLocaleString() : 'Nenurodytas'
        const message = `SMS žinutė išsiųsta\nRezervacijos ID: ${newRes.id}\nVardas: ${newRes.customerName}\nTelefonas: ${newRes.customerPhone}\nPaslauga: ${serviceName}\nLaikas: ${timeStr}`
        alert(message)
        setIsResModalOpen(false)
        setResForm({customerName:'',customerPhone:'',serviceId:'',appointmentTime:''})
    }

    return(
        <div>
            <div className="controls row_align">
                <button className="control_button create_button" onClick={handleCreateReservation}>Sukurti Rezervaciją</button>
            </div>
            <div className="item_list">
                {rezervations.length===0 ? (
                    <p id="rezervation_card_not_found">Nerasta rezervacijų</p>
                ):(
                    rezervations.map(r => (
                        <button key={r.id} className="rezervation_card col_align" /*onClick={() => onOrderOpen(r.id)}*/>
                            <div className="rezervation_main_info row_align">
                                <p className="rezervation_id">ID: {r.id}</p>
                                <p className="rezervation_time">Užrašyta: {formatter.format(new Date(r.appointmentTime))}</p>
                            </div>
                            <p className="rezervation_created">Sukurtas: {formatter.format(new Date(r.createdAt))}</p>
                            {r.closedAt!=="" && (
                                <p className="rezervation_closed">Uždarytas: {formatter.format(new Date(r.closedAt))}</p>
                            )}
                            <div className="rezervation_info row_align">
                                <p className="rezervation_status">Būklė: {r.status}</p>
                                <p className="rezervation_total">Iš viso: {r.total.toFixed(2)}€</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
            <div className="page_controls row_align">
                
            </div>
            {isResModalOpen && (
                <div className="modal_overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
                    <div className="modal" style={{background:'#fff',padding:20,borderRadius:6,width:400,maxWidth:'95%'}}>
                        <h3>Sukurti rezervaciją - {business?.name || ''}</h3>
                        <form onSubmit={handleSubmitReservation}>
                            <div style={{marginBottom:8}}>
                                <label>Vardas:<br/>
                                    <input name="customerName" value={resForm.customerName} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Telefonas:<br/>
                                    <input name="customerPhone" value={resForm.customerPhone} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Paslauga:<br/>
                                    <input name="serviceId" value={resForm.serviceId} onChange={handleResChange} required style={{width:'100%'}}/>
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
            )}
        </div>
    )
}