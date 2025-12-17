import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./employees.css"

import {getDb,saveDb,getNextId} from "../utils/tempDB"

import {PageControls} from "../components/controls/pageControls"
import {filterSearchList,sortBy} from "../utils/filtering"

export const Employees=({user,business}) => {
    const navigate=useNavigate()
    
    const [employees,setEmployees]=useState([])

    const [search,setSearch]=useState("")
    const [sortType,setSortType]=useState("name_increase")
    const [filteredEmployees,setFilteredEmployees]=useState([])

    //const [showFilters,setShowFilters]=useState(false)

    const [selectedEmployee,setSelectedEmployee]=useState(null)

    const [newEmployeeName,setNewEmployeeName]=useState("")
    const [newEmployeeEmail,setNewEmployeesEmail]=useState("")
    const [newEmployeesPassword,setNewEmployeesPassword]=useState(10)
    
    const [errors,setErrors]=useState([])

    const [isPanelVisible,setIsPanelVisible]=useState(false)

    const [isEditingEmployee,setIsEditingEmployee]=useState(false)

    const [currentPage,setCurrentPage]=useState(1)
    const pageSize=9
    const totalPages=Math.max(1,Math.ceil(filteredEmployees.length/pageSize))
    const visibleEmployees=filteredEmployees.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }

        loadEmployees()
    },[user])

    useEffect(() => {
        const filterBySearchList=filterSearchList(employees,search)
        const sortedList=sortBy(filterBySearchList,sortType)

        setFilteredEmployees(sortedList)
    },[employees,search,sortType])

    function loadEmployees(){
        const db=getDb()

        const employeesData=db.employees
            .filter(e => e.businessId===business.id)

        setEmployees(employeesData)
    }

    function openEmployeePanel(editing,employeeId){
        setErrors([])
        if(editing){
            const db=getDb()

            setSelectedEmployee(employeeId)
            const editingEmployee=db.employees.find(e => e.id===employeeId)

            setNewEmployeeName(editingEmployee.name)
            setNewEmployeesEmail(editingEmployee.email)
        }else{
            setNewEmployeeName("")
            setNewEmployeesEmail("")
        }

        setNewEmployeesPassword("")

        setIsEditingEmployee(editing)
        setIsPanelVisible(true)
    }

    /*function clearFilters(){
        setTotalMin("")
        setTotalMax("")
    }*/

    function createNewEmployee(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!newEmployeeName.trim())
          newErrors.newEmployeeName="Įveskite darbuotojo vardą"
        if(!newEmployeeEmail.trim())
          newErrors.newEmployeeEmail="Įveskite darbuotojo email"
        if(!newEmployeesPassword.trim() || newEmployeesPassword.length<6)
          newErrors.newEmployeesPassword="Įveskite darbuotojo slaptažodį (min 4 simboliai)"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }

        let newUser={
            id: getNextId(db.users),
            username: newEmployeeName.split(" ").join(""),
            password: newEmployeesPassword
        }
        
        let newEmploye={
            id: getNextId(db.employees),
            userId: newUser.id,
            businessId: business.id,
            name: newEmployeeName,
            email: newEmployeeEmail,
            role: "Savininkas"
        }

        db.users.push(newUser)
        db.employees.push(newEmploye)

        saveDb(db)

        toast.success(`Darbuotojas ${newEmploye.name} sėkmingai sukurta`)
        setIsPanelVisible(false)

        loadEmployees()
    }

    function deleteEmployee(){
        const db=getDb()
        
        const existing=db.employees.find(e => e.id===selectedEmployee)

        if(!existing){
            toast.error("Klaida: darbuotojas nerastas")
            return
        }

        if(db.users.find(u => u.id===existing.userId).id===business.ownerId){
            toast.error("Klaida: savininko negalima ištrinti")
            return
        }

        db.employees=db.employees.filter(e => e.id!==selectedEmployee)
        db.users=db.users.filter(u => u.id!==existing.userId)

        saveDb(db)

        toast.success(`Darbuotojas ${existing.name} sėkmingai ištrintas`)
        setIsPanelVisible(false)

        loadEmployees()
    }

    function saveEmployee(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!newEmployeeName.trim())
          newErrors.newEmployeeName="Įveskite darbuotojo vardą"
        if(!newEmployeeEmail.trim())
          newErrors.newEmployeeEmail="Įveskite darbuotojo email"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }
        
        const existing=db.employees.find(e => e.id===selectedEmployee)

        if(!existing){
            toast.error("Klaida: darbuotojas nerastas")
            return
        }

        const existingUser=db.users.find(u => u.id===existing.userId)

        if(!existingUser){
            toast.error("Klaida: darbuotojo vartotojas nerastas")
            return
        }
        
        existing.name=newEmployeeName
        existing.email=newEmployeeEmail
        existingUser.password=newEmployeesPassword || existingUser.password
        
        saveDb(db)

        toast.success(`Darbuotojas ${existing.name} sėkmingai pakeistas`)
        setIsPanelVisible(false)

        loadEmployees()
    }

    return(
        <div>
            <div id="controls" className="col_align">
                <div id="main_controls" className="row_align">
                    <input id="employees_search" type="text" placeholder="Pieška" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    <div id="sort_button" className="control_button">Rikiavimas
                        <div id="sort_content">
                            <button id="sort_item_button" onClick={() => setSortType("name_increase")}>Vardas: A-Z</button>
                            <button id="sort_item_button" onClick={() => setSortType("name_decrease")}>Vardas: Z-A</button>
                        </div>
                    </div>
                    <button id="create_button" className="control_button" onClick={() => openEmployeePanel(false,0)}>Sukurti Darbuotoją</button>
                </div>
            </div>
            <div id="item_list">
                {visibleEmployees.length===0 ? (
                    <p id="employee_card_not_found">Nerasta darbuotojų</p>
                ):(
                    visibleEmployees.map(e => (
                        <button key={e.id} id="employee_card" className="col_align" onClick={() => openEmployeePanel(true,e.id)}>
                            <p id="employee_card_id">Id: {e.id}</p>
                            <p id="employee_card_name">{e.name}</p>
                            <p id="employee_card_email"> Email: {e.email}</p>
                        </button>
                    ))
                )}
            </div>
            <PageControls page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)}/>
            {isPanelVisible && (
                <>
                    <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
                    <div id="employee_create_edit_panel" className="col_align">
                        <label>Vardas Pavardė</label>
                        <input type="text" className="employee_create_edit_input_field" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)}/>
                        {errors.newEmployeeName && (
                            <div className="error_text">
                                {errors.newEmployeeName}
                            </div>
                        )}
                        <label>Email</label>
                        <input className="employee_create_edit_input_field" value={newEmployeeEmail} onChange={e => setNewEmployeesEmail(e.target.value)}/>
                        {errors.newEmployeeEmail && (
                            <div className="error_text">
                                {errors.newEmployeeEmail}
                            </div>
                        )}
                        <label>Slaptažodis</label>
                        <input className="employee_create_edit_input_field" value={newEmployeesPassword} onChange={e => setNewEmployeesPassword(e.target.value)}/>
                        {errors.newEmployeesPassword && (
                            <div className="error_text">
                                {errors.newEmployeesPassword}
                            </div>
                        )}
                        <div id="employee_create_edit_controls" className="row_align">
                            <button id="employee_create_edit_cancel_button" className="control_button">Atšaukti</button>
                            {isEditingEmployee ? (
                                <button id="employee_create_edit_confirm_button" className="control_button" onClick={() => saveEmployee()}>Išsaugoti</button>
                            ):(
                                <button id="employee_create_edit_confirm_button" className="control_button" onClick={() => createNewEmployee()}>Sukurti</button>
                            )}
                            {isEditingEmployee && (
                                <button id="employee_create_edit_delete_button" className="control_button" onClick={() => deleteEmployee()}>Ištrinti</button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}