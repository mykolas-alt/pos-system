import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./reservationView.css"

import {getDb,saveDb} from "../../utils/tempDB"
import {filterSearchList,sortBy} from "../../utils/filtering"

export const ReservationView=({user,business}) => {
    const {reservationId}=useParams()
    const navigate=useNavigate()

    const [reservation,setReservation]=useState()
    const [service,setService]=useState()
    
    const [editingReservation,setEditingReservation]=useState()

    const [customerName,setCustomerName]=useState("")
    const [customerSurname,setCustomerSurname]=useState("")
    const [customerPhone,setCustomerPhone]=useState("")
    const [comment,setComment]=useState("")

    const [search,setSearch]=useState("")
    const [servicesSortType,setServicesSortType]=useState("name_increase")

    const [services,setServices]=useState([])
    const [filteredServices,setFilteredServices]=useState([])

    const [selectedService,setSelectedService]=useState(null)
    const [selectedDate,setSelectedDate]=useState(new Date().toISOString().split("T")[0])
    const [timeSlots,setTimeSlots]=useState([])
    const [selectedTimeSlot,setSelectedTimeSlot]=useState(null)
    
    const [errors,setErrors]=useState([])

    const [isReservationLoading,setIsReservationLoading]=useState(true)
    const [isEditingClientInfo,setIsEditingClientInfo]=useState(false)
    const [isEditingReservationTime,setIsEditingReservationTime]=useState(false)
    const [isChangingService,setIsChangingService]=useState(false)

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
        const filterBySearch=filterSearchList(services,search)
        const sortedList=sortBy(filterBySearch,servicesSortType)
        
        setFilteredServices(sortedList)
    },[services,search,servicesSortType])

    useEffect(() => {
        if(isEditingReservationTime && selectedService!==null)
            generateTimeTable()
    },[selectedService,selectedDate])

    function loadReservationData(){
        const db=getDb()

        const reservationData=db.reservations.find(r => r.id===Number(reservationId))
        const serviceData=db.services.find(s => s.id===reservationData.serviceId)

        setReservation(reservationData)
        setService(serviceData)
    }

    function editClientInfo(){
        setErrors([])

        setCustomerName(reservation.customerName.split(" ")[0])
        setCustomerSurname(reservation.customerName.split(" ")[1])
        setCustomerPhone(reservation.customerPhone)
        setComment(reservation.comment)

        setIsEditingClientInfo(true)
    }

    function openReservationTimeEditPanel(){
        const editingReservationData={
            appointmentTime:""
        }
        
        setSelectedDate(new Date(reservation.appointmentTime).toISOString().split("T")[0])
        const currentStart=new Date(reservation.appointmentTime)
        setSelectedTimeSlot({
            start:currentStart.getTime(),
            end:currentStart.getTime()+service.durationMin*60000,
            hour:currentStart.getHours(),
            minute:currentStart.getMinutes()
        })
        
        setSelectedService(reservation.serviceId)
        setEditingReservation(editingReservationData)
        setIsEditingReservationTime(true)
    }

    function openServiceChangePanel(){
        const db=getDb()

        setSelectedService(null)
        const serviceList=db.services.filter(s => s.businessId===business.id)
        setServices(serviceList)

        const editingReservationData={
            serviceId:null,
            appointmentTime:""
        }
        
        setEditingReservation(editingReservationData)
        setIsChangingService(true)
    }

    function selectServiceToBook(id){
        setSelectedTimeSlot(null)
        setSelectedService(id)

        setIsEditingReservationTime(true)
    }

    function generateTimeTable(){
        if(selectedService===null)
            return

        const db=getDb()
        const service=db.services.find(s => s.id===selectedService)
        if(!service)
            return

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

    function selectBookingDate(date){
        setSelectedTimeSlot(null)

        const today=new Date()
        today.setHours(0,0,0,0)

        const pickedDate=new Date(date)
        pickedDate.setHours(0,0,0,0)

        const validDate=pickedDate>=today ? date : new Date().toISOString().split("T")[0]
        
        setSelectedDate(validDate)
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

        const now=new Date()
        const selectedDateObj=new Date(selectedDate)

        if(selectedDateObj.toDateString()===now.toDateString()){
            const slotTime=new Date(selectedDate)
            slotTime.setHours(hour,minute,0,0)

            if(slotTime<=now){
                toast.error("Negalima rezervuoti jau praėjusio laiko")
                return
            }
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
        editingReservation.appointmentTime=startTime.toISOString()
    }
    
    function saveEditingClientInfo(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!customerName.trim())
          newErrors.customerName="Įveskite kliento vardą"
        if(!customerSurname.trim())
          newErrors.customerSurname="Įveskite kliento pavardė"
        if(!customerPhone.trim())
          newErrors.customerPhone="Įveskite kliento telefono numerį"
        
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

        existing.customerName=customerName+" "+customerSurname
        existing.customerPhone=customerPhone
        existing.comment=comment

        saveDb(db)

        toast.success("Kliento informacija atnaujinta")
        loadReservationData()
        setIsEditingClientInfo(false)
    }

    function saveChangedService(){
        const db=getDb()

        if(!selectedTimeSlot){
          toast.error("Pasirinkite laiką")
          return
        }

        const existing=db.reservations.find(r => r.id===reservation.id)

        if(!existing){
            toast.error("Klaida: rezervacija nerasta")
            return
        }
        
        existing.serviceId=selectedService
        existing.appointmentTime=editingReservation.appointmentTime

        saveDb(db)

        toast.success(`SMS žinutė išsiųsta\nPaslauga buvo pakeista: ${db.services.find(s => s.id===selectedService).name} \nLaikas: ${formatter.format(new Date(existing.appointmentTime))}`)
        loadReservationData()
        setIsEditingReservationTime(false)
        setIsChangingService(false)
    }

    function saveEditingReservationTime(){
        const db=getDb()

        if(!selectedTimeSlot){
          toast.error("Pasirinkite laiką")
          return
        }

        const existing=db.reservations.find(r => r.id===reservation.id)

        if(!existing){
            toast.error("Klaida: rezervacija nerasta")
            return
        }
        
        existing.appointmentTime=editingReservation.appointmentTime

        saveDb(db)

        toast.success(`SMS žinutė išsiųsta\nLaikas buvo pakeistas: ${formatter.format(new Date(existing.appointmentTime))}`)
        loadReservationData()
        setIsEditingReservationTime(false)
    }
    
    function cancelReservation(){
        const db=getDb()
        const existing=db.reservations.find(o => o.id===Number(reservationId))

        if(!existing){
            toast.error("Klaida: rezervacija nerasta")
            return
        }

        existing.status="closed"

        saveDb(db)
        loadReservationData()
    }

    if(!user || !user.info || !business)
        return null

    return(
        <div>
            {isReservationLoading ? (
                <div className="loading_anim"/>
            ):(
                <>
                    <div id="reservation_panels">
                        <div id="reservation_client_info" className="col_align">
                            {isEditingClientInfo ? (
                                <>
                                    <div id="reservation_header" className="row_align">
                                        <p id="reservation_tab_name">Kliento Informacija</p>
                                    </div>
                                    <hr/>
                                    <div id="reservation_client_name_surname" className="row_align">
                                        <div id="reservation_client_input_wrapper" className="col_align">
                                            <input type="text" className="reservatio_client_input" placeholder="Vardas" value={customerName} onChange={e => setCustomerName(e.target.value)}/>
                                            {errors.customerName && (
                                                <div className="error_text">
                                                    {errors.customerName}
                                                </div>
                                            )}
                                        </div>
                                        <div id="reservation_client_input_wrapper" className="col_align">
                                            <input type="text" className="reservatio_client_input" placeholder="Pavardė" value={customerSurname} onChange={e => setCustomerSurname(e.target.value)}/>
                                            {errors.customerSurname && (
                                                <div className="error_text">
                                                    {errors.customerSurname}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div id="reservation_client_input_wrapper" className="col_align">
                                        <input type="text" className="reservatio_client_input" placeholder="Telefonas" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}/>
                                        {errors.customerPhone && (
                                            <div className="error_text">
                                                {errors.customerPhone}
                                            </div>
                                        )}
                                    </div>
                                    <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                                    <div id="edit_controls" className="row_align">
                                        <button id="reservatio_client_cancel_button" className="control_button" onClick={() => setIsEditingClientInfo(false)}>Atšaukti</button>
                                        <button id="reservatio_client_save_button" className="control_button" onClick={() => saveEditingClientInfo()}>Išsaugoti</button>
                                    </div>
                                </>
                            ):(
                                <>
                                    <div id="reservation_header" className="row_align">
                                        <p id="reservation_tab_name">Kliento Informacija</p>
                                        {reservation.status==="open" && (
                                            <button id="edit_button" className="control_button" onClick={() => editClientInfo()}>Keisti</button>
                                        )}
                                    </div>
                                    <hr/>
                                    <div id="reservation_client_name_surname" className="row_align">
                                        <p id="reservation_client_name">Vardas: {reservation.customerName.split(" ")[0]}</p>
                                        <p id="reservation_client_surname">Pavardė: {reservation.customerName.split(" ")[1]}</p>
                                    </div>
                                    <p id="reservation_client_phone">Telefonas: {reservation.customerPhone}</p>
                                    <textarea className="comment_input" type="text" placeholder="Pastabos" value={reservation.comment} readOnly/>
                                </>
                            )}
                        </div>
                        <div id="reservation_info" className="col_align">
                            <div id="reservation_details" className="col_align">
                                <p id="reservation_tab_name">Rezervacijos Informacija</p>
                                <hr/>
                                <p id="reservation_id">ID: {reservation.id}</p>
                                <div id="reservation_appointment_time_tab" className="row_align">
                                    <p id="reservation_appointment_time">Vizito Laikas: {formatter.format(new Date(reservation.appointmentTime))}</p>
                                    {reservation.status==="open" && (
                                        <button id="edit_button" className="control_button" onClick={() => openReservationTimeEditPanel()}>Keisti</button>
                                    )}
                                </div>
                                <p id="reservation_status">Būklė: {
                                    reservation.status==="open" ? "Atviras":
                                    reservation.status==="closed" ? "Uždarytas":
                                    reservation.status==="paid" ? "Apmokėtas":
                                    reservation.status==="refund" ? "Gražintas":""
                                }</p>
                            </div>
                            <div id="reservation_service_details" className="col_align">
                                <div id="reservation_header" className="row_align">
                                    <p id="reservation_tab_name">Paslaugos Informacija</p>
                                    {reservation.status==="open" && (
                                        <button id="edit_button" className="control_button" onClick={() => openServiceChangePanel()}>Keisti</button>
                                    )}
                                </div>
                                <hr/>
                                <p id="reservation_service_name">{service.name}</p>
                                <p id="reservation_service_specialist">Specialistas: {getDb().employees.find(e => e.id===service.employeeId).name}</p>
                                <p id="reservation_service_duration">Trukmė: {service.durationMin} Min.</p>
                                <p id="reservation_service_price">Kaina: {service.price}</p>
                            </div>
                        </div>
                        <div id="reservation_controls" className="col_align">
                            <button id="reservation_discount_button" className="control_button">Nuolaidos</button>
                            {reservation.status!=="closed" && reservation.status!=="paid" && (
                                <button id="reservation_cancel_button" className="control_button" onClick={() => cancelReservation()}>Atšaukti</button>
                            )}
                            {reservation.status==="paid" && (
                                <button id="reservation_refund_button" className="control_button">Grąžinimas</button>
                            )}
                            {reservation.status==="open" && (
                                <button id="reservation_payment_button" className="control_button">Apmokėti</button>
                            )}
                        </div>
                    </div>
                    {isEditingReservationTime && (
                        <>
                            <div id="transparent_panel" onClick={() => setIsEditingReservationTime(false)}/>
                            <div id="editing_reservation_panel" className="col_align">
                                <button id="product_close_button" className="close_button" onClick={() => setIsEditingReservationTime(false)}>X</button>
                                <div id="create_reservation_controls" className="row_align">
                                    <p id="create_reservation_service_picked">{getDb().services.find(s => s.id===selectedService).name}</p>
                                    <div id="create_reservation_date_picker" className="row_align">
                                        <label>Pasirinkite datą:</label>
                                        <input id="create_reservation_date_picker_input" type="date" value={selectedDate} onChange={e => selectBookingDate(e.target.value)}/>
                                    </div>
                                </div>
                                <div id="create_reservation_main" className="col_align time_table">
                                    <div id="create_reservation_time_table">
                                        {timeSlots.length===0 ? (
                                            <></>
                                        ):(
                                            timeSlots.map(row => (
                                                <div key={row.hour} id="time_row">
                                                    <div id="time_hour">{row.hour}:00</div>
                                                    <div id="time_minutes">
                                                        {row.minuteSlots.map(slot => (
                                                            <div
                                                                key={slot.minute}
                                                                id="time_slot"
                                                                className={
                                                                    `${slot.taken ? "taken":"free"}
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
                                <div id="editing_reservation_buttons" className="row_align">
                                    <button id="editing_reservation_cancel_button" className="control_button" onClick={() => setIsEditingReservationTime(false)}>Atšaukti</button>
                                    {isChangingService ? (
                                        <button id="editing_reservation_save_button" className="control_button" onClick={() => saveChangedService()}>Išsaugoti</button>
                                    ):(
                                        <button id="editing_reservation_save_button" className="control_button" onClick={() => saveEditingReservationTime()}>Išsaugoti</button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    {isChangingService && !isEditingReservationTime && (
                        <>
                            <div id="transparent_panel" onClick={() => setIsChangingService(false)}/>
                            <div id="editing_reservation_panel" className="row_aling">
                                <button id="product_close_button" className="close_button" onClick={() => setIsChangingService(false)}>X</button>
                                <div id="create_reservation_controls" className="row_align">
                                    <input id="create_reservation_search" type="text" placeholder="Pieška" value={search} onChange={(e) => setSearch(e.target.value)}/>
                                    <div id="create_reservation_sort_button" className="control_button">Rikiavimas
                                        <div id="sort_content">
                                            <button id="sort_item_button" onClick={() => setServicesSortType("name_increase")}>Pavadinimas: A-Z</button>
                                            <button id="sort_item_button" onClick={() => setServicesSortType("name_decrease")}>Pavadinimas: Z-A</button>
                                            <button id="sort_item_button" onClick={() => setServicesSortType("price_increase")}>Kaina: Didėjančiai</button>
                                            <button id="sort_item_button" onClick={() => setServicesSortType("price_decrease")}>Kaina: Mažėjančiai</button>
                                        </div>
                                    </div>
                                </div>
                                <div id="create_reservation_main" className="col_align  time_table">
                                    {filteredServices.length===0 ? (
                                        <p id="create_reservation_service_card_not_found">Nerasta paslaugų</p>
                                    ):(
                                        filteredServices.map(s => (
                                            <button key={s.id} id="create_reservation_service_card" className="col_align" onClick={() => selectServiceToBook(s.id)}>
                                                <div id="create_reservation_service_card_name">{s.name}</div>
                                                <div id="create_reservation_service_card_main_info" className="row_align">
                                                    <div id="create_reservation_service_card_info_left">{getDb().employees.find(e => e.id===s.employeeId).name}</div>
                                                    <div id="create_reservation_service_card_info_right">{s.price.toFixed(2)}€</div>
                                                </div>
                                                <div id="create_reservation_service_card_main_info" className="row_align">
                                                    <div id="create_reservation_service_card_info_left">{s.durationMin} Min.</div>
                                                    <div id="create_reservation_service_card_info_right">{s.opensAt} - {s.closesAt}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}