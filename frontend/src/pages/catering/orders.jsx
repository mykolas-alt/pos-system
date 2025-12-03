import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./orders.css"

import {getDb, saveDb} from "../../utils/tempDB"

export const Orders=({user,business,onOrderOpen}) => {
    const navigate=useNavigate()

    const [orders,setOrders]=useState([])
    const [isResModalOpen,setIsResModalOpen]=useState(false)
    const [resForm,setResForm]=useState({custumerName:'',customerPhone:'',serviceId:'',appointmentTime:''})
    const [servicesList,setServicesList]=useState([])

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }

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
    },[user])

    function handleCreateReservation(){
        if(!business){
            alert('Nėra verslo informacijos')
            return
        }

        const db = getDb()
        const services = db.services.filter(s => s.businessId===business.id)
        setServicesList(services)
        setResForm(prev => ({
            ...prev,
            serviceId: services.length>0 ? String(services[0].id) : ''
        }))
        setIsResModalOpen(true)
    }

    function handleResChange(e){
        const {name, value} = e.target
        setResForm(prev => ({...prev, [name]: value}))
    }

    function handleSubmitReservation(e){
        e.preventDefault()
        if(!business){
            alert('Nėra verslo informacijos')
            return
        }

        const db = getDb()
        const newRes = {
            id: db.reservations.length + 1,
            businessId: business.id,
            serviceId: resForm.serviceId ? Number(resForm.serviceId) : null,
            appointmentTime: new Date(resForm.appointmentTime),
            custumerName: resForm.custumerName,
            customerPhone: resForm.customerPhone,
            status: "Atvira",
            createdAt: new Date(),
            closedAt: ""
        }

        db.reservations.push(newRes)
        saveDb(db)
        alert('Rezervacija sukurta')
        setIsResModalOpen(false)
        setResForm({custumerName:'',customerPhone:'',serviceId:'',appointmentTime:''})
    }

    return(
        <div>
            <div className="controls row_align">
                <button className="control_button create_button">Sukurti Nauja Užsakyma</button>
                <button className="control_button" onClick={handleCreateReservation}>Sukurti Rezervaciją</button>
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
            {isResModalOpen && (
                <div className="modal_overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
                    <div className="modal" style={{background:'#fff',padding:20,borderRadius:6,width:400,maxWidth:'95%'}}>
                        <h3>Sukurti rezervaciją - {business?.name || ''}</h3>
                        <form onSubmit={handleSubmitReservation}>
                            <div style={{marginBottom:8}}>
                                <label>Vardas:<br/>
                                    <input name="custumerName" value={resForm.custumerName} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Telefonas:<br/>
                                    <input name="customerPhone" value={resForm.customerPhone} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Paslauga:<br/>
                                    <select name="serviceId" value={resForm.serviceId} onChange={handleResChange} style={{width:'100%'}}>
                                        {servicesList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div style={{marginBottom:8}}>
                                <label>Laikas:<br/>
                                    <input name="appointmentTime" type="datetime-local" value={resForm.appointmentTime} onChange={handleResChange} required style={{width:'100%'}}/>
                                </label>
                            </div>
                            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                                <button type="button" onClick={() => setIsResModalOpen(false)}>Atšaukti</button>
                                <button type="submit">Sukurti</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}