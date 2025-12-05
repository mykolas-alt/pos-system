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

    const [isReservationLoading,setIsReservationLoading]=useState(true)

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

    return(
        <div>
            {isReservationLoading ? (
                <div className="loading_anim"/>
            ):(
                <div id="reservation_panels">
                    <div id="reservation_info" className="col_align">
                        <p>Rezervacijos Id: {reservation.id}</p>
                        <p>Užrašyta ant: {formatter.format(new Date(reservation.appointmentTime))}</p>
                        <p>Kliento vardas: {reservation.customerName}</p>
                        <p>Kliento telefonas: {reservation.customerPhone}</p>
                    </div>
                    <div id="service_info" className="col_align">
                        <p>Paslaugos Id: {service.id}</p>
                        <p>Specialisto Id: {service.userId}</p>
                        <p>Specialisto vardas: {serviceSpecialist.name}</p>
                        <p>Paslauga: {service.name}</p>
                        <p>Paslaugos trukme: {service.duration}</p>
                        <p>Paslaugos kaina: {service.price}</p>
                    </div>
                    <div id="reservation_controls" className="col_align">
                        <button className="reservation_edit_button">Redaguoti Rezervaciją</button>
                        <button className="reservation_comment_button">Pastaba</button>
                        <button className="reservation_payment_button">Apmokėti</button>
                    </div>
                </div>
            )}
        </div>
    )
}