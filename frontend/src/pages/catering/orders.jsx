import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./orders.css"

import {getDb} from "../../utils/tempDB"

export const Orders=({user,business}) => {
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
            let total=0
            const orderProducts=db.OrderProduct.filter(op => op.orderId===order.id)
            
            let productTotal
            orderProducts.forEach(ordProd => {
                productTotal=0
                const products=db.Products.filter(p => p.id===ordProd.productId)
                
                products.forEach(product => {
                    productTotal=product.price*ordProd.quantity
                })
            })

            total+=productTotal!==undefined ? productTotal:0.00

            console.log(productTotal)

            order.total=total
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
                    <p id="order_card_not_found">No orders found</p>
                ):(
                    orders.map(o => (
                        <div key={o.id} className="order_card col_align"/*onClick={() => handleBusinessClick(b)}*/>
                            <p className="order_id">ID: {o.id}</p>
                            <p className="order_created">Sukurtas: {o.createdAt}</p>
                            {o.closedAt!=="" && (
                                <p className="order_closed">Uždarytas: {o.closedAt}</p>
                            )}
                            <div className="row_align">
                                <p className="order_status">Statusas: {o.status}</p>
                                <p className="order_total">Iš viso: {o.total.toFixed(2)}€</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="page_controls row_align">
                
            </div>
        </div>
    )
}