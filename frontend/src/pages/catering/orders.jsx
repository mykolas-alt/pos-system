import {use, useEffect,useState} from "react"
import {useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./orders.css"

import {PageControls} from "../../components/controls/pageControls"

export const Orders=({api,user,business,onOrderOpen}) => {
    const navigate=useNavigate()

    const [orders,setOrders]=useState([])

    const [currentPage,setCurrentPage]=useState(1)
    const [totalPages,setTotalPages]=useState(1)
    const pageSize=6

    const statusMap={
        OPEN:"Atvira",
        IN_PROGRESS:"Vykdoma",
        PAID:"Apmokėta",
        REFUNDED:"Gražinta",
        CANCELLED:"Atšaukta",
        PARTIALLY_PAID:"Daliniai apmokėta"
    }

    const formatter=new Intl.DateTimeFormat("lt-LT",{
        year:"numeric",
        month:"2-digit",
        day:"2-digit",
        hour:"2-digit",
        minute:"2-digit",
    })

    useEffect(() => {
        async function initOrders(){
            try{
                setCurrentPage(1)
                const orderPage=await loadOrders(1,user.token)
                setOrders(orderPage.content)
                setTotalPages(orderPage.totalPages===0 ? 1:orderPage.totalPages)
            }catch{
                setOrders([])
                setTotalPages(1)
            }
        }

        if(!user){
            navigate("/")
            return
        }

        initOrders()
    },[user])

    useEffect(() => {
        async function updateOrders(){
            try{
                const orderPage=await loadOrders(currentPage,user.token)
                setOrders(orderPage.content)
                setTotalPages(orderPage.totalPages===0 ? 1:orderPage.totalPages)
            }catch{
                setOrders([])
                setCurrentPage(1)
                setTotalPages(1)
            }
        }

        updateOrders()
    },[currentPage])

    async function loadOrders(page,token){
        const response=await fetch(`${api}order?page=${page-1}&size=${pageSize}`,{
            method: "GET",
            headers: {"Authorization":`Bearer ${token}`}
        })

        if(!response.ok){
            throw new Error("Failed to load orders")
        }

        return await response.json()
    }

    async function createOrder(){
        try{
            const response=await fetch(`${api}order`,{
                method: "POST",
                headers: {
                    "Authorization":`Bearer ${user.token}`
                }
            })

            if(!response.ok){
                throw new Error("Failed to create order")
            }

            toast.success("Užsakymas sėkmingai sukurtas")
            try{
                const orderPage=await loadOrders(currentPage,user.token)
                setOrders(orderPage.content)
                setTotalPages(orderPage.totalPages===0 ? 1:orderPage.totalPages)
            }catch{
                setOrders([])
                setTotalPages(1)
            }
        }catch{
            toast.error("Klaida: nepavyko sukurti užsakymo")
        }
    }

    if(!user || !user.info || !business)
        return null

    return(
        <div>
            <div id="controls" className="col_align">
                <div id="main_controls" className="row_align">
                    <button id="create_button" className="control_button" onClick={createOrder}>Sukurti Užsakyma</button>
                </div>
            </div>
            <div id="item_list">
                {orders.length===0 ? (
                    <p id="order_card_not_found">Nerasta užsakymų</p>
                ):(
                    orders.map(o => (
                        <button key={o.id} id="order_card" className="col_align" onClick={() => onOrderOpen(o.id)}>
                            <p id="order_card_id">ID: {o.id}</p>
                            <p id="order_card_status">Būklė: {statusMap[o.status] ?? o.status}</p>
                            <p id="order_card_created">Sukurtas: {formatter.format(new Date(o.createdAt))}</p>
                            {o.closedAt && (
                                <p id="order_card_closed">Uždarytas: {formatter.format(new Date(o.closedAt))}</p>
                            )}
                            <p id="order_card_total">Iš viso: {(o.total ?? 0).toFixed(2)}€</p>
                        </button>
                    ))
                )}
            </div>
            <PageControls page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)}/>
        </div>
    )
}