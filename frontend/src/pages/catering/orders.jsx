import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./orders.css"

import {getDb, saveDb} from "../../utils/tempDB"

export const Orders=({user,business,onOrderOpen}) => {
    const navigate=useNavigate()

    const [orders,setOrders]=useState([])

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

        loadOrders()
    },[user])

    function loadOrders(){
        const db=getDb()

        const ordersData=db.orders
            .filter(o => o.businessId===business.id)

        ordersData.forEach(order => {
            const orderProducts=db.orderProducts.filter(op => op.orderId===order.id)
            
            let total=0
            orderProducts.forEach(ordProd => {
                const products=db.products.filter(p => p.id===ordProd.productId)
                products.forEach(product => {
                    total=product.price*ordProd.quantity+total
                })
            })

            order.total=total!==undefined ? total:0
        });

        setOrders(ordersData)
    }

    function getNextId(arr){
        return arr.reduce((m,it) => Math.max(m,(it && it.id) || 0),0)+1
    }

    function createOrder(){
        const db=getDb()

        const nextId=getNextId(db.orders)
        const newOrder={
            id:nextId,
            businessId:business.id,
            status:"Atvira",
            createdAt:new Date(),
            closedAt:"",
            comment:""
        }

        db.orders.push(newOrder)
        saveDb(db)
        loadOrders()
    }

    return(
        <div>
            <div className="controls row_align">
                <button className="control_button create_button" onClick={() => createOrder()}>Sukurti Nauja Užsakyma</button>
                </div>
            <div className="item_list">
                {orders.length===0 ? (
                    <p id="order_card_not_found">Nerasta užsakymų</p>
                ):(
                    orders.map(o => (
                        <button key={o.id} className="order_card col_align" onClick={() => onOrderOpen(o.id)}>
                            <p className="order_id">ID: {o.id}</p>
                            <p className="order_created">Sukurtas: {formatter.format(new Date(o.createdAt))}</p>
                            {o.closedAt!=="" && (
                                <p className="order_closed">Uždarytas: {formatter.format(new Date(o.closedAt))}</p>
                            )}
                            <div className="order_info row_align">
                                <p className="order_status">Būklė: {o.status}</p>
                                <p className="order_total">Iš viso: {o.total.toFixed(2)}€</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
            <div className="page_controls row_align">
                
            </div>
        </div>
    )
}