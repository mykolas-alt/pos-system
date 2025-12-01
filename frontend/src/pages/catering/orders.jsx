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
                                <p className="order_total">Iš viso: {o.total}</p>
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