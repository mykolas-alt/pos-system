import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./orders.css"

import {getDb} from "../../utils/tempDB"

export const Orders=({user,business,onOrderOpen}) => {
    const navigate=useNavigate()

    const [orders,setOrders]=useState([])

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }

        const db=getDb()

        const ordersData=db.orders
            .filter(o => o.businessId===business.id)

        ordersData.forEach(order => {
            const orderProducts=db.orderProduct.filter(op => op.orderId===order.id)
            
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
    },[user])

    return(
        <div>
            <div className="controls row_align">
                <button className="control_button create_button">Sukurti Nauja Užsakyma</button>
            </div>
            <div className="item_list">
                {orders.length===0 ? (
                    <p id="order_card_not_found">Nerasta užsakymų</p>
                ):(
                    orders.map(o => (
                        <button key={o.id} className="order_card col_align" onClick={() => onOrderOpen(o.id)}>
                            <p className="order_id">ID: {o.id}</p>
                            <p className="order_created">Sukurtas: {o.createdAt}</p>
                            {o.closedAt!=="" && (
                                <p className="order_closed">Uždarytas: {o.closedAt}</p>
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