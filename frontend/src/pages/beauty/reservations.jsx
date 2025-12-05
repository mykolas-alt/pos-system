import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./reservations.css"

import {getDb,saveDb} from "../../utils/tempDB"

export const Reservations=({user,business,onReservationOpen}) => {
    const navigate=useNavigate()

    const [reservations,setReservations]=useState([])

    const [newReservation,setNewReservation]=useState()
    const [customerName,setCustomerName]=useState("")
    const [customerPhone,setCustomerPhone]=useState("")
    const [services,setServices]=useState([])
    const [selectedService,setSelectedService]=useState(null)
    const [comment,setComment]=useState("")

    const [isPanelVisible,setIsPanelVisible]=useState(false)
    const [isCommentVisible,setIsCommentVisible]=useState(false)

    const [errors,setErrors]=useState([])

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

        loadReservations()
    },[user])

    function loadReservations(){
        const db=getDb()

        const reservationsData=db.reservations
            .filter(r => r.businessId===business.id)

        reservationsData.forEach(reservation => {
            const reservationService=db.services.find(s => s.id===reservation.serviceId)
            
            reservation.total=reservationService.price!==undefined ? reservationService.price:0
        });

        setReservations(reservationsData)
    }

    function getNextId(arr){
        return arr.reduce((m,it) => Math.max(m,(it && it.id) || 0),0)+1
    }

    function openReservationCreatePanel(){
        const db=getDb()
        setErrors([])
        setSelectedService(null)

        const nextId=getNextId(db.reservations)
        const newReservationData={
            id:nextId,
            businessId:business.id,
            serviceId:null,
            appointmentTime:"",
            customerName:"",
            customerPhone:"",
            status:"Atvira",
            createdAt:"",
            closedAt:"",
            comment:""
        }

        const servicesData=db.services.filter(s => s.businessId===business.id)

        setServices(servicesData)
        setNewReservation(newReservationData)
        setIsPanelVisible(true)
    }

    function openComment(){
        const reservationComment=newReservation.comment

        setComment(reservationComment)
        setIsCommentVisible(true)
    }
    
    function saveComment(){
        newReservation.comment=comment

        setIsCommentVisible(false)
    }

    function createReservation(){
        const db=getDb()
        const newErrors={}

        console.log(newReservation)

        if(!customerName.trim())
          newErrors.customerName="Įveskite kliento vardą ir pavarde"
        if(!customerPhone.trim())
          newErrors.customerPhone="Įveskite kliento telefono numerį"
        if(selectedService===null)
          newErrors.selectedService="Pasirinkite paslaugą"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }

        newReservation.customerName=customerName
        newReservation.customerPhone=customerPhone

        console.log(newReservation)

        //saveDb(db)
        //onReservationOpen(nextId)
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
                <button className="control_button create_button" onClick={openReservationCreatePanel}>Sukurti Rezervaciją</button>
            </div>
            <div className="item_list">
                {reservations.length===0 ? (
                    <p id="reservation_card_not_found">Nerasta rezervacijų</p>
                ):(
                    reservations.map(r => (
                        <button key={r.id} className="reservation_card col_align" onClick={() => onReservationOpen(r.id)}>
                            <div className="reservation_main_info row_align">
                                <p className="reservation_id">ID: {r.id}</p>
                                <p className="reservation_time">Vizitas: {formatter.format(new Date(r.appointmentTime))}</p>
                            </div>
                            <p className="reservation_created">Sukurtas: {formatter.format(new Date(r.createdAt))}</p>
                            {r.closedAt!=="" && (
                                <p className="reservation_closed">Uždarytas: {formatter.format(new Date(r.closedAt))}</p>
                            )}
                            <div className="reservation_info row_align">
                                <p className="reservation_status">Būklė: {r.status}</p>
                                <p className="reservation_total">Iš viso: {r.total.toFixed(2)}€</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
            <div className="page_controls row_align">
                
            </div>
            {isPanelVisible && (
                <>
                    <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
                    <div id="reservation_create_panel" className="row_align">
                        <div className="create_reservation_input_fields col_align">
                            <input className={"create_reservation_input_field "+(errors.customerName ? "invalid":"")} type="text" placeholder="Kliento vardas pavarde" value={customerName} onChange={e => setCustomerName(e.target.value)}/>
                            {errors.customerName && (
                                <div className="error_text">
                                    {errors.customerName}
                                </div>
                            )}
                            <input className={"create_reservation_input_field "+(errors.customerPhone ? "invalid":"")} pattern="" type="text" placeholder="Kliento Telefonas" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}/>
                            {errors.customerPhone && (
                                <div className="error_text">
                                    {errors.customerPhone}
                                </div>
                            )}
                            <div className="service_list col_align">
                                {services.length===0 ? (
                                    <p id="services_not_found">Nerasta paslaugų</p>
                                ):(
                                    services.map(s => (
                                        <button key={s.id} className={"service_card col_align"+(selectedService===s.id ? " selected":"")} onClick={() => setSelectedService(s.id)}>
                                            <div id="service_card_name">{s.name}</div>
                                            <div className="row_align">
                                                <div id="service_card_specialist">{getDb().users.find(u => u.id===s.userId).name}</div>
                                                <div id="service_card_price">{s.price.toFixed(2)}€</div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                            {errors.selectedService && (
                                <div className="error_text">
                                    {errors.selectedService}
                                </div>
                            )}
                        </div>
                        <div className="create_reservation_time_table_controls col_align">
                            <p>Calendar (Input date)</p>
                            <p>Time Table</p>
                            <p>Appointment Time</p>
                        </div>
                        <div className="create_reservation_controls col_align">
                            <button className="create_reservation_comment_button" onClick={() => openComment()}>Pastaba</button>
                            {isCommentVisible && (
                                <div className="new_reservation_comment_panel col_align">
                                    <button className="comment_close_button" onClick={() => setIsCommentVisible(false)}>X</button>
                                    <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                                    <button className="comment_save_button" onClick={() => saveComment()}>Išsaugoti</button>
                                </div>
                            )}
                            <button className="create_reservation_button" onClick={() => createReservation()}>Sukurti</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

/*{isResModalOpen && (
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
            )}*/