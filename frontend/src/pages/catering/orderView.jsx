import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./orderView.css"

import {getDb} from "../../utils/tempDB"

export const OrderView=({user,business}) => {
    const {orderId}=useParams()
    const navigate=useNavigate()

    const [order,setOrders]=useState()
    const [products,setProducts]=useState([])
    const [orderProducts,setOrderProducts]=useState([])
    const [categories,setCategories]=useState([])

    const [search,setSearch]=useState("")
    const [selectedCategories,setSelectedCategories]=useState([])

    const [isOrderLoading,setIsOrderLoading]=useState(true)

    const filteredProducts=products.filter(p => {
        const matchesSearch=p.name.toLowerCase().includes(search.toLowerCase())

        const matchesCategory=selectedCategories.length===0 || selectedCategories.includes(p.categoryId)

        return matchesSearch && matchesCategory
    })

    useEffect(() => {
        const db=getDb()

        const orderData=db.orders.find(o => o.id===Number(orderId))
        const productsData=db.products.filter(p => p.businessId===business.id)
        const orderProductsData=db.orderProduct.filter(op => op.orderId===Number(orderId))
        const categoriesData=db.categories.filter(c => c.businessId===business.id)
        console.log(categoriesData)
        let orderContent=[]
        let total=0
        let quantity=0
        orderProductsData.forEach(orderProduct => {
            const products=db.products.filter(p => p.id===orderProduct.productId)
            products.forEach(product => {
                product.quantity=orderProduct.quantity
                orderContent.push(product)
                total=product.price*orderProduct.quantity+total
            })
            quantity=orderProduct.quantity+quantity
        });

        orderData.total=total!==undefined ? total:0
        orderData.quantity=quantity!==undefined ? quantity:0

        setOrders(orderData)
        setProducts(productsData)
        setOrderProducts(orderContent)
        setCategories(categoriesData)
        setIsOrderLoading(false)
    },[user])

    function toggleCategory(id){
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c!==id):[...prev,id]
        )
    }

    return(
        <div>
            {isOrderLoading ? (
                <div className="loading_anim"/>
            ):(
                <div id="order_panels">
                    <div id="order_filters" className="col_align">
                        <input id="order_search" type="text" placeholder="Pieška" value={search} onChange={(e) => setSearch(e.target.value)}/>
                        {categories.length===0 ? (
                            <></>
                        ):(
                            <div id="order_category_list" className="col_align">
                                Kategorijos
                                <hr/>
                                {categories.map(c => (
                                    <div key={c.id} className="order_category row_align">
                                        <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)}/>{c.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div id="order_products">
                        {filteredProducts.length===0 ? (
                            <p id="product_card_not_found">Nerasta pozicijų</p>
                        ):(
                            filteredProducts.map(p => (
                                <button key={p.id} className="product_card col_align">
                                    <div id="product_card_name">{p.name}</div>
                                    <div id="product_card_price">{p.price.toFixed(2)}€</div>
                                </button>
                            ))
                        )}
                    </div>
                    <div id="order_info" className="col_align">
                        <div id="order_info_id">Užsakymo ID: {order.id}</div>
                        <div id="order_product_list" className="col_align">
                            {orderProducts.length===0 ? (
                                <></>
                            ):(
                                orderProducts.map(op => (
                                    <button key={op.id} className="order_product_card col_align">
                                        {op.name} * {op.quantity}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="order_total_info row_align">
                            <p id="order_total">Iš viso: {order.total}</p>
                            <p id="order_quantity">Kiekis: {order.quantity}</p>
                        </div>
                        <button className="payment_button">Apmokėti</button>
                    </div>
                </div>
            )}
        </div>
    )
}