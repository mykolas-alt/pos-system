import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./reservationView.css"

import {getDb,saveDb} from "../../utils/tempDB"

export const ReservationView=({user,business}) => {
    const {reservationId}=useParams()
    const navigate=useNavigate()

    const [reservation,setReservation]=useState()
    const [service,setService]=useState()
    const [serviceSpecialist,setServiceSpecialist]=useState()
    
    const [newReservation,setNewReservation]=useState()
    const [customerName,setCustomerName]=useState("")
    const [customerPhone,setCustomerPhone]=useState("")
    const [services,setServices]=useState([])
    const [selectedService,setSelectedService]=useState(null)
    const [selectedDate,setSelectedDate]=useState(new Date().toISOString().split("T")[0])
    const [timeSlots,setTimeSlots]=useState([])
    const [selectedTimeSlot,setSelectedTimeSlot]=useState(null)
    
    const [comment,setComment]=useState("")
    
    const [errors,setErrors]=useState([])

    const [isReservationLoading,setIsReservationLoading]=useState(true)
    const [isCommentVisible,setIsCommentVisible]=useState(false)
    const [isPanelVisible,setIsPanelVisible]=useState(false)

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

    useEffect(() => {
        if(isPanelVisible)
            generateTimeTable()
    },[selectedService,selectedDate,selectedTimeSlot])

    function loadReservationData(){
        const db=getDb()

        const reservationData=db.reservations.find(r => r.id===Number(reservationId))
        const serviceData=db.services.find(s => s.id===reservationData.serviceId)
        const employeeData=db.users.find(e => e.id===serviceData.userId)

        setReservation(reservationData)
        setService(serviceData)
        setServiceSpecialist(employeeData)
    }

    function openReservationEditPanel(){
        const db=getDb()
        setErrors([])

        const newReservationData={
            id:reservation.id,
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

        setCustomerName(reservation.customerName)
        setCustomerPhone(reservation.customerPhone)
        setSelectedService(reservation.serviceId)
        setSelectedDate(new Date(reservation.appointmentTime).toISOString().split("T")[0])
        const currentStart=new Date(reservation.appointmentTime)
        setSelectedTimeSlot({
            start:currentStart.getTime(),
            end:currentStart.getTime()+service.durationMin*60000,
            hour:currentStart.getHours(),
            minute:currentStart.getMinutes()
        })

        generateTimeTable()
        
        setServices(servicesData)
        setNewReservation(newReservationData)
        setIsPanelVisible(true)
    }

    function generateTimeTable(){
        if(selectedService===null)
            return

        const db=getDb()
        const service=db.services.find(s => s.id===selectedService)

        const openHour=parseInt(service.opensAt.split(":")[0])
        const closeHour=parseInt(service.closesAt.split(":")[0])

        const slots=[]
        for(let hour=openHour;hour<closeHour;hour++){
            const minuteSlots=[]
            for(let m=0;m<60;m+=10){
                minuteSlots.push({
                    hour,
                    minute:m,
                    taken:false
                })
            }
            slots.push({hour,minuteSlots})
        }

        const markedSlots=markReservedSlots(slots,new Date(selectedDate),reservation.id)

        setTimeSlots(markedSlots)
    }

    function markReservedSlots(slots,selectedDate,currentReservationId){
        const db=getDb()
        const reservations=db.reservations.filter(r => r.businessId===business.id)

        reservations
            .filter(r => r.id!==currentReservationId && new Date(r.appointmentTime).toDateString()===selectedDate.toDateString())
            .forEach(r => {
                const service=db.services.find(s => s.id===r.serviceId)
                const start=new Date(r.appointmentTime)
                const reservedUntil=new Date(start.getTime()+service.durationMin*60000)

                slots.forEach(row => {
                    row.minuteSlots.forEach(slot => {
                        const slotDate=new Date(selectedDate)
                        slotDate.setHours(row.hour,slot.minute)

                        if(slotDate>=start && slotDate<reservedUntil)
                            slot.taken=true
                    })
                })
            })

        return slots
    }

    function handleSelectedTime(hour,minute,isTaken){
        if(isTaken)
            return

        if(!selectedService){
            toast.error("Pirma pasirinkite paslaugą")
            return
        }

        const db=getDb()
        const service=db.services.find(s => s.id===selectedService)
        const duration=service.durationMin
        const closedAt=parseInt(service.closesAt.split(":")[0])

        const startTime=new Date(selectedDate)
        startTime.setHours(hour,minute,0,0)

        const endTime=new Date(startTime.getTime()+duration*60000)

        const closingTime=new Date(selectedDate)
        closingTime.setHours(closedAt,0,0,0);

        if(endTime>closingTime){
            toast.error("Paslauga per ilga šiam laikui")
            return
        }

        const reservations=db.reservations.filter(r => r.businessId===business.id)

        for(const r of reservations){
            if(reservation && r.id===reservation.id)
                continue

            const rService=db.services.find(s => s.id===r.serviceId)
            const rStart=new Date(r.appointmentTime)
            const rEnd=new Date(rStart.getTime()+rService.durationMin*60000)

            if(rStart.toDateString()!==startTime.toDateString())
                continue

            if(startTime<rEnd && endTime>rStart){
                toast.error("Šis laikas jau rezervuotas")
                return
            }
        }

        const interval={
            start:startTime.getTime(),
            end:endTime.getTime(),
            hour,
            minute
        }

        setSelectedTimeSlot(interval)
        newReservation.appointmentTime=startTime.toISOString()
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

    function editReservation(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!customerName.trim())
          newErrors.customerName="Įveskite kliento vardą ir pavarde"
        if(!customerPhone.trim())
          newErrors.customerPhone="Įveskite kliento telefono numerį"
        if(selectedService===null)
          newErrors.selectedService="Pasirinkite paslaugą"
        if(!selectedTimeSlot)
          newErrors.selectedTimeSlot="Pasirinkite laiką"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }

        const existing=db.reservations.find(r => r.id===reservation.id)

        if(!existing){
            toast.error("Klaida: rezervacija nerasta")
            return
        }

        existing.serviceId=selectedService
        existing.customerName=customerName
        existing.customerPhone=customerPhone
        existing.appointmentTime=newReservation.appointmentTime

        saveDb(db)

        toast.success(`SMS žinutė išsiųsta\nRezervacijos ID: ${existing.id}\nVardas: ${existing.customerName}\nTelefonas: ${existing.customerPhone}\nPaslauga: ${db.services.find(s => s.id===existing.serviceId).name}\nLaikas: ${formatter.format(new Date(existing.appointmentTime))}`)
        loadReservationData()
        setIsPanelVisible(false)
    }

    return(
        <div>
            {isReservationLoading ? (
                <div className="loading_anim"/>
            ):(
                <>
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
                                <p className="reservation_info_content">Trukme: {service.durationMin} Min</p>
                                <p className="reservation_info_content">Kaina: {service.price}</p>
                            </div>
                            <div id="service_specialist_info" className="col_align">
                                <p className="reservation_info_name">Specialisto Informacija</p>
                                <hr/>
                                <p className="reservation_info_content">Id: {service.userId} Vardas: {serviceSpecialist.name}</p>
                            </div>
                        </div>
                        <div id="reservation_controls" className="col_align">
                            <button className="reservation_edit_button" onClick={() => openReservationEditPanel()}>Redaguoti Rezervaciją</button>
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
                                                <button key={s.id} className={"service_card col_align"+(selectedService===s.id ? " selected":"")} onClick={() => {setSelectedTimeSlot(null);setSelectedService(s.id)}}>
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
                                    <div className="create_reservation_date_picker">
                                        <label>Pasirinkite datą:</label>
                                        <input className="create_reservation_date_picker_input" type="date" value={selectedDate} onChange={e => {setSelectedTimeSlot(null);setSelectedDate(e.target.value)}}/>
                                    </div>
                                    <div className="create_reservation_time_table">
                                        {timeSlots.length===0 ? (
                                            <></>
                                        ):(
                                            timeSlots.map(row => (
                                                <div key={row.hour} className="time_row">
                                                    <div className="time_hour">{row.hour}:00</div>
                                                    <div className="time_minutes">
                                                        {row.minuteSlots.map(slot => (
                                                            <div
                                                                key={slot.minute}
                                                                className={
                                                                    `time_slot
                                                                    ${slot.taken ? "taken":"free"}
                                                                    ${selectedTimeSlot &&
                                                                        (() => {
                                                                            const slotTime=new Date(selectedDate)
                                                                            slotTime.setHours(row.hour,slot.minute,0,0)
                                                                            const t=slotTime.getTime()
                                                                            return t>=selectedTimeSlot.start && t<selectedTimeSlot.end ? "selected":""
                                                                        })()
                                                                    }`}
                                                                onClick={() => handleSelectedTime(row.hour,slot.minute,slot.taken)}>
                                                                {slot.minute.toString().padStart(2,"0")}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="create_reservation_controls col_align">
                                    <button className="create_reservation_cancel_button" onClick={() => setIsPanelVisible(false)}>Atšaukti</button>
                                    <button className="create_reservation_button" onClick={() => editReservation()}>Išsaugoti</button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}