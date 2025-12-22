import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./reservations.css"

import {getDb,saveDb,getNextId} from "../../utils/tempDB"

import {PageControls} from "../../components/controls/pageControls"
import {filterList,filterSearchList,filterStatusList,sortBy} from "../../utils/filtering"

export const Reservations=({user,business,onReservationOpen}) => {
    const navigate=useNavigate()

    const [reservations,setReservations]=useState([])
    
    const [selectedStates,setSelectedStates]=useState([])
    const [dateFrom,setDateFrom]=useState("")
    const [dateTo,setDateTo]=useState("")
    const [totalMin,setTotalMin]=useState("")
    const [totalMax,setTotalMax]=useState("")

    const [sortType,setSortType]=useState("date_increase")
    const [filteredReservations,setFilteredReservations]=useState([])

    const [newReservation,setNewReservation]=useState()
    const [customerName,setCustomerName]=useState("")
    const [customerPhone,setCustomerPhone]=useState("")
    const [comment,setComment]=useState("")

    const [search,setSearch]=useState("")
    const [newReservationSortType,setNewReservationSortType]=useState("name_increase")
    const [filteredReservationsData,setFilteredReservationsData]=useState([])

    const [services,setServices]=useState([])
    const [filteredServices,setFilteredServices]=useState([])

    const [selectedService,setSelectedService]=useState(null)
    const [selectedDate,setSelectedDate]=useState(new Date().toISOString().split("T")[0])
    const [timeSlots,setTimeSlots]=useState([])
    const [selectedTimeSlot,setSelectedTimeSlot]=useState(null)

    const [currentPage,setCurrentPage]=useState(1)

    const [showFilters,setShowFilters]=useState(false)

    const [isPanelVisible,setIsPanelVisible]=useState(false)

    const [newReservationPanel,setNewReservationPanel]=useState("main")

    const [errors,setErrors]=useState([])

    const pageSize=6
    const totalPages=Math.max(1,Math.ceil(filteredReservations.length/pageSize))
    const visibleReservations=filteredReservations.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

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
        const filterByStatus=filterStatusList(reservations,selectedStates)
        const filteredList=filterList(filterByStatus,dateFrom,dateTo,totalMin,totalMax)
        const sortedList=sortBy(filteredList,sortType)

        setFilteredReservations(sortedList)
    },[reservations,selectedStates,sortType,dateFrom,dateTo,totalMin,totalMax])

    useEffect(() => {
        if(newReservationPanel==="main"){
            const filterBySearch=filterSearchList(services,search)
            const sortedList=sortBy(filterBySearch,newReservationSortType)
            
            setFilteredServices(sortedList)
        }
    },[services,search,newReservationSortType])

    useEffect(() => {
        if(newReservationPanel==="load_data"){
            const filterBySearch=filterSearchList(reservations,search)
            const sortedList=sortBy(filterBySearch,newReservationSortType)

            setFilteredReservationsData(sortedList)
        }
    },[reservations,search,newReservationSortType])

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
            status:"open",
            createdAt:"",
            closedAt:"",
            comment:""
        }

        const servicesData=db.services.filter(s => s.businessId===business.id)

        setServices(servicesData)
        setNewReservation(newReservationData)
        setNewReservationPanel("main")
        setIsPanelVisible(true)
    }

    function toggleStatus(status){
        setSelectedStates(prev =>
            prev.includes(status) ? prev.filter(s => s!==status):[...prev,status]
        )
    }

    function clearFilters(){
        setSelectedStates([])
        setDateFrom("")
        setDateTo("")
        setTotalMin("")
        setTotalMax("")
    }

    function changeCreationPanel(panel){
        setSearch("")
        setNewReservationSortType()

        setSelectedService(null)
        setSelectedDate(new Date().toISOString().split("T")[0])
        setTimeSlots([])
        setSelectedTimeSlot(null)

        setNewReservationPanel(panel)
    }

    function selectServiceToBook(id){
        setSelectedTimeSlot(null)
        setSelectedService(id)

        setNewReservationPanel("time_table")
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
    
    function loadReservationDataToNew(reservationId){
        const db=getDb()
        const selectedReservation=db.reservations.find(r => r.id===reservationId)

        setCustomerName(selectedReservation.customerName)
        setCustomerPhone(selectedReservation.customerPhone)

        setNewReservationPanel("main")
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
        newReservation.comment=comment

        db.reservations.push(newReservation)

        saveDb(db)

        toast.success(`SMS žinutė išsiųsta\nRezervacijos ID: ${newReservation.id}\nVardas: ${newReservation.customerName}\nTelefonas: ${newReservation.customerPhone}\nPaslauga: ${db.services.find(s => s.id===newReservation.serviceId).name}\nLaikas: ${formatter.format(new Date(newReservation.appointmentTime))}`)
        onReservationOpen(newReservation.id)
    }

    if(!user || !user.info || !business)
        return null

    return(
        <div>
            <div id="controls" className="col_align">
                <div id="main_controls" className="row_align">
                    <button id="filter_button" className="control_button" onClick={() => setShowFilters(prev => !prev)}>Filtrai</button>
                    <div id="sort_button" className="control_button">Rikiavimas
                        <div id="sort_content">
                            <button id="sort_item_button" onClick={() => setSortType("id_increase")}>ID: Didėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("id_decrease")}>ID: Mažėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("date_increase")}>Data: Nuo Naujausios</button>
                            <button id="sort_item_button" onClick={() => setSortType("date_decrease")}>Data: Nuo seniausios</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_increase")}>Suma: Didėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_decrease")}>Suma: Mažėjančiai</button>
                        </div>
                    </div>
                    <button id="create_button" className="control_button" onClick={openReservationCreatePanel}>Sukurti Rezervaciją</button>
                </div>
                <hr className={!showFilters ? "hide_element":""}/>
                <div id="filter_controls" className={"row_align "+(!showFilters ? "hide_element":"")}>
                    <div id="filter_option" className="col_align">
                        <p id="filter_title">Būklė:</p>
                        <hr/>
                        <div id="filter_checkbox_options" className="col_align">
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("open")} onChange={() => toggleStatus("open")}/>Atvira</div>
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("closed")} onChange={() => toggleStatus("closed")}/>Uždaryta</div>
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("paid")} onChange={() => toggleStatus("paid")}/>Apmokėta</div>
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("refund")} onChange={() => toggleStatus("refund")}/>Gražinta</div>
                        </div>
                    </div>
                    <div id="filter_option" className="col_align">
                        <p id="filter_title">Data:</p>
                        <hr/>
                        <label id="filter_label">Nuo:</label>
                        <input className="filter_input_field" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}/>
                        <label id="filter_label">Iki:</label>
                        <input className="filter_input_field" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}/>
                    </div>
                    <div id="filter_option" className="col_align">
                        <p id="filter_title">Suma:</p>
                        <hr/>
                        <label id="filter_label">Min:</label>
                        <input className="filter_input_field" type="number" value={totalMin} onChange={(e) => setTotalMin(e.target.value)}/>
                        <label id="filter_label">Max:</label>
                        <input className="filter_input_field" type="number" value={totalMax} onChange={(e) => setTotalMax(e.target.value)}/>
                    </div>
                    <button id="clear_button" className="control_button" onClick={() => clearFilters()}>Išvalyti Filtrus</button>
                </div>
            </div>
            <div id="item_list">
                {visibleReservations.length===0 ? (
                    <p id="reservation_card_not_found">Nerasta rezervacijų</p>
                ):(
                    visibleReservations.map(r => (
                        <button key={r.id} id="reservation_card" className="col_align" onClick={() => onReservationOpen(r.id)}>
                            <p id="reservation_card_id">ID: {r.id}</p>
                            <p id="reservation_card_created">Sukurtas: {formatter.format(new Date(r.createdAt))}</p>
                            {r.closedAt!=="" && (
                                <p id="reservation_card_closed">Uždarytas: {formatter.format(new Date(r.closedAt))}</p>
                            )}
                            <p id="reservation_card_time">Vizitas: {formatter.format(new Date(r.appointmentTime))}</p>
                            <div id="reservation_card_info" className="row_align">
                                <p id="reservation_card_status">Būklė: {
                                    r.status==="open" ? "Atvira":
                                    r.status==="closed" ? "Uždaryta":
                                    r.status==="paid" ? "Apmokėta":
                                    r.status==="refund" ? "Gražinta":""
                                }</p>
                                <p id="reservation_card_total">Iš viso: {r.total.toFixed(2)}€</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
            <PageControls page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)}/>
            {isPanelVisible && (
                <>
                    <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
                    <div id="reservation_create_panel" className="row_align">
                        <div id="create_reservation_input_fields" className="col_align">
                            <button id="create_reservation_load_button" onClick={() => changeCreationPanel("load_data")}>Užkrauti duomenis</button>
                            <input className={"create_reservation_input_field "+(errors.customerName ? "invalid":"")} type="text" placeholder="Kliento vardas pavardė" value={customerName} onChange={e => setCustomerName(e.target.value)}/>
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
                            <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                        </div>
                        <div id="create_reservation_main_panel" className="col_align">
                            <div id="create_reservation_controls" className="row_align">
                                {newReservationPanel!=="main" && (
                                    <button id="create_reservation_back_button" onClick={() => changeCreationPanel("main")}>Grižti</button>
                                )}
                                {newReservationPanel!=="time_table" ? (
                                    <>
                                        <input id="create_reservation_search" type="text" placeholder="Pieška" value={search} onChange={(e) => setSearch(e.target.value)}/>
                                        <div id="create_reservation_sort_button" className="control_button">Rikiavimas
                                            <div id="sort_content">
                                                {newReservationPanel==="main" ? (
                                                    <>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("name_increase")}>Pavadinimas: A-Z</button>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("name_decrease")}>Pavadinimas: Z-A</button>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("price_increase")}>Kaina: Didėjančiai</button>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("price_decrease")}>Kaina: Mažėjančiai</button>
                                                    </>
                                                ):(
                                                    <>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("name_increase")}>Vardas Pavardė: A-Z</button>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("name_decrease")}>Vardas Pavardė: Z-A</button>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("date_increase")}>Data: Nuo Naujausios</button>
                                                        <button id="sort_item_button" onClick={() => setNewReservationSortType("date_decrease")}>Data: Nuo seniausios</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ):(
                                    <>
                                        <p id="create_reservation_service_picked">{getDb().services.find(s => s.id===selectedService).name}</p>
                                        <div id="create_reservation_date_picker" className="row_align">
                                            <label>Pasirinkite datą:</label>
                                            <input id="create_reservation_date_picker_input" type="date" value={selectedDate} onChange={e => selectBookingDate(e.target.value)}/>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div id="create_reservation_main" className={"col_align"+(newReservationPanel==="time_table" ? " time_table":"")}>
                                {newReservationPanel==="main" ? (
                                    filteredServices.length===0 ? (
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
                                    )
                                ):(newReservationPanel==="load_data" ? (
                                    filteredReservationsData.length===0 ? (
                                        <p id="reservation_card_not_found">Nerasta rezervacijų</p>
                                    ):(
                                        filteredReservationsData.map(r => (
                                            <button key={r.id} id="reservation_card" className="col_align" onClick={() => loadReservationDataToNew(r.id)}>
                                                <p id="reservation_card_customer_name">Klientas: {r.customerName}</p>
                                                <p id="reservation_card_customer_phone">Telefonas: {r.customerPhone}</p>
                                                <p id="reservation_card_created">Sukurtas: {formatter.format(new Date(r.createdAt))}</p>
                                                {r.closedAt==="" && (
                                                    <p id="reservation_card_closed">Uždarytas: {formatter.format(new Date(r.createdAt))}</p>
                                                )}
                                            </button>
                                        ))
                                    )
                                ):(
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
                                ))}
                            </div>
                        </div>
                        <div id="create_reservation_buttons" className="col_align">
                            <button id="create_reservation_discount_button" onClick={() => setIsPanelVisible(false)}>Nuolaidos</button>
                            <button id="create_reservation_cancel_button" onClick={() => setIsPanelVisible(false)}>Atšaukti</button>
                            <button id="create_reservation_button" onClick={() => createReservation()}>Sukurti</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}