import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./services.css"

import {getDb,saveDb,getNextId} from "../../utils/tempDB"

import {PageControls} from "../../components/controls/pageControls"
import {filterList,sortBy} from "../../utils/filtering"

export const Services=({user,business}) => {
    const navigate=useNavigate()
    
    const [services,setServices]=useState([])
    
    const [totalMin,setTotalMin]=useState("")
    const [totalMax,setTotalMax]=useState("")

    const [sortType,setSortType]=useState("name_increase")
    const [filteredServices,setFilteredServices]=useState([])

    const [showFilters,setShowFilters]=useState(false)

    const [selectedService,setSelectedService]=useState(null)

    const [newServiceName,setNewServiceName]=useState("")
    const [newServiceSpecialist,setNewServiceSpecialist]=useState("")
    const [newServiceDuration,setNewServiceDuration]=useState(10)
    const [newServiceOpensHour,setNewServiceOpensHour]=useState(0)
    const [newServiceOpensMin,setNewServiceOpensMin]=useState(0)
    const [newServiceClosesHour,setNewServiceClosesHour]=useState(0)
    const [newServiceClosesMin,setNewServiceClosesMin]=useState(0)
    const [newServicePrice,setNewServicePrice]=useState(0)
    
    const [errors,setErrors]=useState([])

    const [isPanelVisible,setIsPanelVisible]=useState(false)

    const [isEditingService,setIsEditingService]=useState(false)

    const employees=getDb().employees.filter(e => e.businessId===business.id)

    const [currentPage,setCurrentPage]=useState(1)
    const pageSize=6
    const totalPages=Math.max(1,Math.ceil(filteredServices.length/pageSize))
    const visibleServices=filteredServices.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }

        loadServices()
    },[user])

    useEffect(() => {
        const filteredList=filterList(services,undefined,undefined,totalMin,totalMax)
        const sortedList=sortBy(filteredList,sortType)

        setFilteredServices(sortedList)
    },[services,sortType,totalMin,totalMax])

    function loadServices(){
        const db=getDb()

        const servicesData=db.services
            .filter(s => s.businessId===business.id)

        setServices(servicesData)
    }

    function openServicePanel(editing,serviceId){
        setErrors([])
        if(editing){
            const db=getDb()

            setSelectedService(serviceId)
            const editingService=db.services.find(s => s.id===serviceId)

            setNewServiceName(editingService.name)
            setNewServiceSpecialist(String(editingService.employeeId))
            setNewServiceDuration(editingService.durationMin)
            setNewServiceOpensHour(editingService.opensAt.split(":")[0])
            setNewServiceOpensMin(editingService.opensAt.split(":")[1])
            setNewServiceClosesHour(editingService.closesAt.split(":")[0])
            setNewServiceClosesMin(editingService.closesAt.split(":")[1])
            setNewServicePrice(editingService.price)
        }else{
            setNewServiceName("")
            setNewServiceSpecialist("")
            setNewServiceDuration(10)
            setNewServiceOpensHour(0)
            setNewServiceOpensMin(0)
            setNewServiceClosesHour(0)
            setNewServiceClosesMin(0)
            setNewServicePrice(0)
        }

        setIsEditingService(editing)
        setIsPanelVisible(true)
    }

    function clearFilters(){
        setTotalMin("")
        setTotalMax("")
    }

    function createNewService(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!newServiceName.trim())
          newErrors.newServiceName="Įveskite paslaugos pavadinimą"
        if(!newServiceSpecialist)
          newErrors.newServiceSpecialist="Pasirinkite specialistą"
        if(newServiceOpensHour===newServiceClosesHour && newServiceOpensMin===newServiceClosesMin)
          newErrors.selectedWorkTime="Pasirinkite teisinga darbo laiką"
        if(newServicePrice<=0)
          newErrors.newServicePrice="Įveskite kainą"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }

        const nextId=getNextId(db.services)
        let newService={
            id: nextId,
            businessId: business.id,
            employeeId: Number(newServiceSpecialist),
            name: newServiceName,
            durationMin: newServiceDuration,
            opensAt: newServiceOpensHour+":"+newServiceOpensMin,
            closesAt: newServiceClosesHour+":"+newServiceClosesMin,
            price: Number(newServicePrice)
        }

        db.services.push(newService)

        saveDb(db)

        toast.success(`Paslauga ${newService.name} sėkmingai sukurta`)
        setIsPanelVisible(false)

        loadServices()
    }

    function deleteService(){
        const db=getDb()
        
        const existing=db.services.find(s => s.id===selectedService)

        if(!existing){
            toast.error("Klaida: paslauga nerasta")
            return
        }

        db.services=db.services.filter(p => p.id!==selectedService)

        saveDb(db)

        toast.success(`Paslauga ${existing.name} sėkmingai ištrinta`)
        setIsPanelVisible(false)

        loadServices()
    }

    function saveService(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!newServiceName.trim())
          newErrors.newServiceName="Įveskite paslaugos pavadinimą"
        if(!newServiceSpecialist)
          newErrors.newServiceSpecialist="Pasirinkite specialistą"
        if(newServiceOpensHour===newServiceClosesHour && newServiceOpensMin===newServiceClosesMin)
          newErrors.selectedWorkTime="Pasirinkite teisinga darbo laiką"
        if(newServicePrice<=0)
          newErrors.newServicePrice="Įveskite kainą"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }
        
        const existing=db.services.find(s => s.id===selectedService)

        if(!existing){
            toast.error("Klaida: paslauga nerasta")
            return
        }
        
        existing.employeeId=Number(newServiceSpecialist)
        existing.name=newServiceName
        existing.durationMin=newServiceDuration
        existing.opensAt=newServiceOpensHour+":"+newServiceOpensMin
        existing.closesAt=newServiceClosesHour+":"+newServiceClosesMin
        existing.price=Number(newServicePrice)
        
        saveDb(db)

        toast.success(`Paslauga ${existing.name} sėkmingai pakeista`)
        setIsPanelVisible(false)

        loadServices()
    }

    return(
        <div>
            <div id="controls" className="col_align">
                <div id="main_controls" className="row_align">
                    <button id="filter_button" className="control_button" onClick={() => setShowFilters(prev => !prev)}>Filtrai</button>
                    <div id="sort_button" className="control_button">Rikiavimas
                        <div id="sort_content">
                            <button id="sort_item_button" onClick={() => setSortType("name_increase")}>Pavadinimas: A-Z</button>
                            <button id="sort_item_button" onClick={() => setSortType("name_decrease")}>Pavadinimas: Z-A</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_increase")}>Suma: Didėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_decrease")}>Suma: Mažėjančiai</button>
                        </div>
                    </div>
                    <button id="create_button" className="control_button" onClick={() => openServicePanel(false,0)}>Sukurti Paslaugą</button>
                </div>
                <hr className={!showFilters ? "hide_element":""}/>
                <div id="filter_controls" className={"row_align "+(!showFilters ? "hide_element":"")}>
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
                {visibleServices.length===0 ? (
                    <p id="service_card_not_found">Nerasta paslaugų</p>
                ):(
                    visibleServices.map(s => (
                        <button key={s.id} id="service_card" className="col_align" onClick={() => openServicePanel(true,s.id)}>
                            <p id="service_card_name">{s.name}</p>
                            <p id="service_card_specialist">Specialistas: {getDb().employees.find(e => e.id===s.employeeId).name}</p>
                            <p id="service_card_duration">Trukmė: {s.durationMin} Min.</p>
                            <div id="service_card_more_info" className="row_align">
                                <p id="service_card_work_time">{s.opensAt} - {s.closesAt}</p>
                                <p id="service_card_price">Kaina: {s.price.toFixed(2)}€</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
            <PageControls page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)}/>
            {isPanelVisible && (
                <>
                    <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
                    <div id="service_create_edit_panel" className="col_align">
                        <label>Pavadinimas</label>
                        <input type="text" className="service_create_edit_input_field" value={newServiceName} onChange={e => setNewServiceName(e.target.value)}/>
                        {errors.newServiceName && (
                            <div className="error_text">
                                {errors.newServiceName}
                            </div>
                        )}
                        <label>Specialistas</label>
                        <select className="service_create_edit_select" value={newServiceSpecialist} onChange={e => setNewServiceSpecialist(e.target.value)}>
                            <option value="">-- Pasirinkite specialistą</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                        {errors.newServiceSpecialist && (
                            <div className="error_text">
                                {errors.newServiceSpecialist}
                            </div>
                        )}
                        <label>Trukmė</label>
                        <div id="service_create_edit_input_wrapper" className="row_align">
                            <input type="number" className="service_create_edit_input_number_field" min={10} step={10} value={newServiceDuration} onChange={e => setNewServiceDuration(e.target.value<10 ? 10:e.target.value)}/><p id="service_create_edit_input_text">Min.</p>
                        </div>
                        <label>Darbo Laikas</label>
                        <div className="row_align">
                            <input type="number" className="service_create_edit_input_time_field" min={0} max={23} step={1} value={newServiceOpensHour} onChange={e => setNewServiceOpensHour(e.target.value>23 ? 23:(e.target.value<0 ? 0:e.target.value))}/>
                            <p id="service_create_edit_input_time_text">:</p>
                            <input type="number" className="service_create_edit_input_time_field" min={0} max={50} step={1} value={newServiceOpensMin} onChange={e => setNewServiceOpensMin(e.target.value>50 ? 50:(e.target.value<0 ? 0:e.target.value))}/>
                            <p id="service_create_edit_input_time_text">-</p>
                            <input type="number" className="service_create_edit_input_time_field" min={0} max={23} step={1} value={newServiceClosesHour} onChange={e => setNewServiceClosesHour(e.target.value>23 ? 23:(e.target.value<0 ? 0:e.target.value))}/>
                            <p id="service_create_edit_input_time_text">:</p>
                            <input type="number" className="service_create_edit_input_time_field" min={0} max={50} step={1} value={newServiceClosesMin} onChange={e => setNewServiceClosesMin(e.target.value>50 ? 50:(e.target.value<0 ? 0:e.target.value))}/>
                        </div>
                        {errors.selectedWorkTime && (
                            <div className="error_text">
                                {errors.selectedWorkTime}
                            </div>
                        )}
                        <label>Kaina</label>
                        <div id="service_create_edit_input_wrapper" className="row_align">
                            <input type="number" className="service_create_edit_input_number_field" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value<0 ? 0:e.target.value)}/><p id="service_create_edit_input_text">€</p>
                        </div>
                        {errors.newServicePrice && (
                            <div className="error_text">
                                {errors.newServicePrice}
                            </div>
                        )}
                        <div id="service_create_edit_controls" className="row_align">
                            <button id="service_create_edit_cancel_button" className="control_button">Atšaukti</button>
                            {isEditingService ? (
                                <button id="service_create_edit_confirm_button" className="control_button" onClick={() => saveService()}>Išsaugoti</button>
                            ):(
                                <button id="service_create_edit_confirm_button" className="control_button" onClick={() => createNewService()}>Sukurti</button>
                            )}
                            {isEditingService && (
                                <button id="service_create_edit_delete_button" className="control_button" onClick={() => deleteService()}>Ištrinti</button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}