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
            const orderProductsData=db.orderProducts.filter(op => op.orderId===order.id)
            let total=0
            orderProductsData.forEach(orderProduct => {
                const product=db.products.find(p => p.id===orderProduct.productId)
                if(!product)
                    return

                const selectedOptionRows=db.orderProductSelectedOptions.filter(
                    o => o.orderProductId===orderProduct.id
                )

                let selectedOptions={}
                selectedOptionRows.forEach(row => {
                    const group=db.productOptionGroups.find(g => g.id===row.productOptionGroupId)
                    if(!group)
                        return

                    if(group.type==="slider" || group.type==="single"){
                        selectedOptions[group.id]=row.value
                    }else if(group.type==="multi"){
                        if(!selectedOptions[group.id])
                            selectedOptions[group.id]=[]
                        if(Array.isArray(row.value)){
                            selectedOptions[group.id]=row.value
                        }else{
                            selectedOptions[group.id].push(row.value)
                        }
                    }
                })

                const productOptions=db.productOptionGroups.filter(g => g.productId===product.id).map(group => {
                    const selections=db.productOptionValues.filter(pov => pov.productOptionGroupId===group.id)
                    return {...group,selections}
                })

                const priceWithOptions=recalcPrice(product,productOptions,selectedOptions,orderProduct.quantity)

                total+=priceWithOptions
            });

            order.total=total!==undefined ? total:0
        });

        setOrders(ordersData)
    }

    function getNextId(arr){
        return arr.reduce((m,it) => Math.max(m,(it && it.id) || 0),0)+1
    }

    function recalcPrice(product,productOptions,selectedOptions,quantity){
        let price=product.price

        const db=getDb()

        productOptions.forEach(group => {
            const value=selectedOptions[group.id]

            if(group.type==="single"){
                if(value!=null){
                    const opValue=db.productOptionValues.find(v => v.id===value)
                    if(opValue)
                        price+=opValue.priceDelta
                }
                return
            }

            if(group.type==="multi" && Array.isArray(value)){
                value.forEach(vId => {
                    const opValue=db.productOptionValues.find(v => v.id===vId)
                    if(opValue)
                        price+=opValue.priceDelta
                })
            }
        })

        price=price*quantity

        return price
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
        onOrderOpen(nextId)
    }

    return(
        <div>
            <div className="controls row_align">
                <button className="control_button create_button" onClick={() => createOrder()}>Sukurti Užsakyma</button>
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