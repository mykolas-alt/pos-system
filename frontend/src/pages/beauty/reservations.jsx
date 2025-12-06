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
    const [selectedDate,setSelectedDate]=useState(new Date().toISOString().split("T")[0])
    const [timeSlots,setTimeSlots]=useState([])
    const [selectedTimeSlot,setSelectedTimeSlot]=useState(null)

    const [isPanelVisible,setIsPanelVisible]=useState(false)
    const [isCommentVisible,setIsCommentVisible]=useState(false)
    const [isLoadingDataVisible,setIsLoadingDataVisible]=useState(false)

    const [errors,setErrors]=useState([])

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

    useEffect(() => {
        if(isPanelVisible)
            generateTimeTable()
    },[selectedService,selectedDate,selectedTimeSlot])

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
        setCustomerName("")
        setCustomerPhone("")
        setTimeSlots([])
        setSelectedService(null)
        setSelectedDate(new Date().toISOString().split("T")[0])
        setSelectedTimeSlot(null)

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

        const markedSlots=markReservedSlots(slots,new Date(selectedDate))

        setTimeSlots(markedSlots)
    }

    function markReservedSlots(slots,selectedDate){
        const db=getDb()
        const reservations=db.reservations.filter(r => r.businessId===business.id)

        reservations
            .filter(r => new Date(r.appointmentTime).toDateString()===selectedDate.toDateString())
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
        const reservationComment=newReservation.comment

        setComment(reservationComment)
        setIsCommentVisible(true)
    }
    
    function saveComment(){
        newReservation.comment=comment

        setIsCommentVisible(false)
    }

    function loadReservationDataToNew(reservationId){
        const db=getDb()
        const selectedReservation=db.reservations.find(r => r.id===reservationId)

        setCustomerName(selectedReservation.customerName)
        setCustomerPhone(selectedReservation.customerPhone)

        setIsLoadingDataVisible(false)
    }

    function createReservation(){
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

        newReservation.serviceId=selectedService
        newReservation.customerName=customerName
        newReservation.customerPhone=customerPhone
        newReservation.createdAt=new Date().toISOString()

        db.reservations.push(newReservation)

        saveDb(db)

        toast.success(`SMS žinutė išsiųsta\nRezervacijos ID: ${newReservation.id}\nVardas: ${newReservation.customerName}\nTelefonas: ${newReservation.customerPhone}\nPaslauga: ${db.services.find(s => s.id===newReservation.serviceId).name}\nLaikas: ${formatter.format(new Date(newReservation.appointmentTime))}`)
        onReservationOpen(newReservation.id)
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
                            <button className="create_reservation_load_button" onClick={() => setIsLoadingDataVisible(true)}>Duomenis iš kitos rezervacijos </button>
                            <button className="create_reservation_comment_button" onClick={() => openComment()}>Pastaba</button>
                            {isCommentVisible && (
                                <div className="new_reservation_comment_panel col_align">
                                    <button className="comment_close_button" onClick={() => setIsCommentVisible(false)}>X</button>
                                    <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                                    <button className="comment_save_button" onClick={() => saveComment()}>Išsaugoti</button>
                                </div>
                            )}
                            <button className="create_reservation_cancel_button" onClick={() => setIsPanelVisible(false)}>Atšaukti</button>
                            <button className="create_reservation_button" onClick={() => createReservation()}>Sukurti</button>
                        </div>
                    </div>
                </>
            )}
            {isLoadingDataVisible && (
                <>
                    <div id="transparent_panel" className="load_reservations" onClick={() => setIsLoadingDataVisible(false)}/>
                    <div className="reservations_selector">
                        {reservations.length===0 ? (
                            <p id="reservation_card_not_found">Nerasta rezervacijų</p>
                        ):(
                            reservations.map(r => (
                                <button key={r.id} className="reservation_card col_align" onClick={() => loadReservationDataToNew(r.id)}>
                                    <p className="reservation_id">ID: {r.id}</p>
                                    <p className="reservation_created">Kliento vardas: {r.customerName}</p>
                                    <p className="reservation_created">Kliento telefonas: {r.customerPhone}</p>
                                </button>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}