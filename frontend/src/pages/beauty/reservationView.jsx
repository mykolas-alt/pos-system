import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./reservationView.css"

import {getDb,saveDb} from "../../utils/tempDB"

export const ReservationView=({user,business}) => {
    const {reservationId}=useParams()
    const navigate=useNavigate()

    const [reservation,setReservation]=useState()
    const [service,setService]=useState()
    const [serviceSpecialist,setServiceSpecialist]=useState()

    const [comment,setComment]=useState("")

    const [isReservationLoading,setIsReservationLoading]=useState(true)
    const [isCommentVisible,setIsCommentVisible]=useState(false)

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
        
        loadReservationData()

        setIsReservationLoading(false)
    },[user])

    function loadReservationData(){
        const db=getDb()

        const reservationData=db.reservations.find(r => r.id===Number(reservationId))
        const serviceData=db.services.find(s => s.id===reservationData.serviceId)
        const employeeData=db.users.find(e => e.id===serviceData.userId)

        setReservation(reservationData)
        setService(serviceData)
        setServiceSpecialist(employeeData)
    }
    
    function openComment(){
        const db=getDb()

        const reservationComment=reservation.comment

        setComment(reservationComment)
        setIsCommentVisible(true)
    }
    
    function saveComment(){
        const db=getDb()

        const reservationData=db.reservations.find(o => o.id===Number(reservationId))
        if(!reservationData)
            return

        reservationData.comment=comment

        saveDb(db)
        loadReservationData()
        setIsCommentVisible(false)
    }

    return(
        <div>
            {isReservationLoading ? (
                <div className="loading_anim"/>
            ):(
                <div id="reservation_panels">
                    <div id="reservation_info" className="col_align">
                        <div id="reservation_main_info" className="col_align">
                            <p className="reservation_info_name">Rezervacijos Informacija</p>
                            <hr/>
                            <p className="reservation_info_content">Vizito laikas: {formatter.format(new Date(reservation.appointmentTime))}</p>
                        </div>
                        <div id="reservation_client_info" className="col_align">
                            <p className="reservation_info_name">Kliento Informacija</p>
                            <hr/>
                            <p className="reservation_info_content">Vardas Pavarde: {reservation.customerName}</p>
                            <p className="reservation_info_content">Telefonas: {reservation.customerPhone}</p>
                        </div>
                    </div>
                    <div id="service_info" className="col_align">
                        <div id="service_main_info" className="col_align">
                            <p className="reservation_info_name">Paslaugos Informacija</p>
                            <hr/>
                            <p className="reservation_info_content">Id: {service.id} {service.name}</p>
                            <p className="reservation_info_content">Trukme: {service.duration}</p>
                            <p className="reservation_info_content">Kaina: {service.price}</p>
                        </div>
                        <div id="service_specialist_info" className="col_align">
                            <p className="reservation_info_name">Specialisto Informacija</p>
                            <hr/>
                            <p className="reservation_info_content">Id: {service.userId} Vardas: {serviceSpecialist.name}</p>
                        </div>
                    </div>
                    <div id="reservation_controls" className="col_align">
                        <button className="reservation_edit_button">Redaguoti Rezervaciją</button>
                        <button className="reservation_comment_button" onClick={() => openComment()}>Pastaba</button>
                        {isCommentVisible && (
                            <div className="reservation_comment_panel col_align">
                                <button className="comment_close_button" onClick={() => setIsCommentVisible(false)}>X</button>
                                {reservation.status!=="Atvira" ? (
                                    <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} readOnly/>
                                ):(
                                    <>
                                        <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                                        <button className="comment_save_button" onClick={() => saveComment()}>Išsaugoti</button>
                                    </>
                                )}
                            </div>
                        )}
                        <button className="reservation_payment_button">Apmokėti</button>
                    </div>
                </div>
            )}
        </div>
    )
}