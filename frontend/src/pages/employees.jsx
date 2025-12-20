import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./employees.css"

import {PageControls} from "../components/controls/pageControls"
import {filterSearchList,sortBy} from "../utils/filtering"

export const Employees=({api,user,business}) => {
    const navigate=useNavigate()
    
    const [employees,setEmployees]=useState([])

    const [search,setSearch]=useState("")
    const [sortType,setSortType]=useState("name_increase")
    const [filteredEmployees,setFilteredEmployees]=useState([])
    
    const [selectedEmployee,setSelectedEmployee]=useState(null)

    const [newEmployeeName,setNewEmployeeName]=useState("")
    const [newEmployeeEmail,setNewEmployeesEmail]=useState("")
    const [newEmployeesPassword,setNewEmployeesPassword]=useState("")
    const [newEmployeesManager,setNewEmployeesManager]=useState("")
    
    const [errors,setErrors]=useState([])

    const [isPanelVisible,setIsPanelVisible]=useState(false)

    const [isEditingEmployee,setIsEditingEmployee]=useState(false)

    const [currentPage,setCurrentPage]=useState(1)
    const pageSize=6
    const totalPages=Math.max(1,Math.ceil(filteredEmployees.length/pageSize))
    const visibleEmployees=filteredEmployees.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

    useEffect(() => {
        async function initEmployees(){
            try{
                const employeeList=await loadEmployees(user.token)
                setEmployees(employeeList)
            }catch{
                setEmployees([])
            }
        }

        if(!user){
            navigate("/")
            return
        }

        initEmployees()
    },[user])

    useEffect(() => {
        const filterBySearchList=filterSearchList(employees,search)
        const sortedList=sortBy(filterBySearchList,sortType)

        setFilteredEmployees(sortedList)
    },[employees,search,sortType])

    async function loadEmployees(token){
        const response=await fetch(`${api}employee`,{
            method: "GET",
            headers: {"Authorization":`Bearer ${token}`}
        })

        if(!response.ok){
            throw new Error("Failed to load user info")
        }

        return await response.json()
    }

    function openEmployeePanel(editing,employeeId){
        setErrors([])
        if(editing){
            setSelectedEmployee(employeeId)
            const editingEmployee=employees.find(e => e.id===employeeId)

            setNewEmployeeName(editingEmployee.name)
            setNewEmployeesEmail(editingEmployee.email)
            setNewEmployeesManager(editingEmployee.manager ? String(editingEmployee.manager.id):"")
        }else{
            setNewEmployeeName("")
            setNewEmployeesEmail("")
            setNewEmployeesManager("")
        }

        setNewEmployeesPassword("")

        setIsEditingEmployee(editing)
        setIsPanelVisible(true)
    }

    async function createNewEmployee(){
        setErrors([])
        const newErrors={}

        if(!newEmployeeName.trim())
          newErrors.newEmployeeName="Įveskite darbuotojo vardą"
        if(!newEmployeeEmail.trim())
          newErrors.newEmployeeEmail="Įveskite darbuotojo email"
        if(!newEmployeesPassword.trim() || newEmployeesPassword.length<6)
          newErrors.newEmployeesPassword="Įveskite darbuotojo slaptažodį (min 6 simboliai)"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }

        try{
            const response=await fetch(`${api}employee`,{
                method: "POST",
                headers: {
                    "Authorization":`Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newEmployeeName,
                    email: newEmployeeEmail,
                    password: newEmployeesPassword,
                    managerId: newEmployeesManager
                })
            })
        
            if(!response.ok){
                throw new Error("Failed to create employee")
            }

            toast.success(`Darbuotojas ${newEmployeeName} sėkmingai sukurta`)

            setIsPanelVisible(false)
            try{
                const employeeList=await loadEmployees(user.token)
                setEmployees(employeeList)
            }catch{
                setEmployees([])
            }
        }catch{
            toast.error("Klaida: nepavyko sukurti darbuotojo")
        }
    }

    async function saveEmployee(){
        setErrors([])
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

        try{
            const response=await fetch(`${api}employee/${selectedEmployee}`,{
                method: "PUT",
                headers: {
                    "Authorization":`Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newEmployeeName!==employees.find(e => e.id===selectedEmployee).name ? newEmployeeName:null,
                    email: newEmployeeEmail!==employees.find(e => e.id===selectedEmployee).email ? newEmployeeEmail:null,
                    password: newEmployeesPassword!=="" ? newEmployeesPassword:null,
                    managerId: newEmployeesManager
                })
            })
        
            if(!response.ok){
                throw new Error("Failed to update employee")
            }

            toast.success(`Darbuotojas ${newEmployeeName} sėkmingai atnaujintas`)

            setIsPanelVisible(false)
            try{
                const employeeList=await loadEmployees(user.token)
                setEmployees(employeeList)
            }catch{
                setEmployees([])
            }
        }catch{
            toast.error("Klaida: nepavyko sukurti darbuotojo")
        }
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
                        <label>Vadybininkas</label>
                        <select className="employee_create_edit_select" value={newEmployeesManager} onChange={e => setNewEmployeesManager(e.target.value)}>
                            <option value="">-- Pasirinkite Vadybininką --</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                </option>
                            ))}
                        </select>
                        <div id="employee_create_edit_controls" className="row_align">
                            <button id="employee_create_edit_cancel_button" className="control_button">Atšaukti</button>
                            {isEditingEmployee ? (
                                <button id="employee_create_edit_confirm_button" className="control_button" onClick={saveEmployee}>Išsaugoti</button>
                            ):(
                                <button id="employee_create_edit_confirm_button" className="control_button" onClick={createNewEmployee}>Sukurti</button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}