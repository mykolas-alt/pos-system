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
    const [selectedProduct,setSelectedProduct]=useState()
    const [selectedProductOptions,setSelectedProductOptions]=useState([])
    const [selectedProductPrice,setSelectedProductPrice]=useState(0)
    const [selectedOptions,setSelectedOptions]=useState({})

    const [isOrderLoading,setIsOrderLoading]=useState(true)
    const [isPanelVisible,setIsPanelVisible]=useState(false)
    const [addingNewProduct,setAddingNewProduct]=useState(false)

    const filteredProducts=products.filter(p => {
        const matchesSearch=p.name.toLowerCase().includes(search.toLowerCase())

        const matchesCategory=selectedCategories.length===0 || selectedCategories.includes(p.categoryId)

        return matchesSearch && matchesCategory
    })

    useEffect(() => {
        const db=getDb()

        const orderData=db.orders.find(o => o.id===Number(orderId))
        const productsData=db.products.filter(p => p.businessId===business.id)
        const orderProductsData=db.orderProducts.filter(op => op.orderId===Number(orderId))
        const categoriesData=db.categories.filter(c => c.businessId===business.id)
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

    useEffect(() => {
        if(!selectedProduct || selectedProductOptions.length===0)
            return

        const newPrice=recalcPrice(selectedProduct,selectedProductOptions,selectedOptions)
        setSelectedProductPrice(newPrice)
    },[selectedOptions])

    function toggleCategory(id){
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c!==id):[...prev,id]
        )
    }

    function openProductOptions(id){
        const db=getDb()
        const product=db.products.find(p => p.id===id)

        let productOptions=[]
        const optionGroups=db.productOptionGroups.filter(g => g.productId===id)
        optionGroups.forEach(group => {
            const productOptionValues=db.productOptionValues.filter(pov => pov.productOptionGroupId===group.id)

            productOptions.push({
                id: group.id,
                type: group.type,
                name: group.name,
                minSelect: group.minSelect,
                maxSelect: group.maxSelect,
                selections: productOptionValues
            })
        })

        setSelectedProductOptions(productOptions)
        let initial={}

        productOptions.forEach(group => {
            if(group.type==="slider"){
                initial[group.id]=group.minSelect
            }
            if(group.type==="single"){
                initial[group.id]=null
            }
            if(group.type==="multi"){
                initial[group.id]=[]
            }
        })

        setSelectedOptions(initial)
        setSelectedProductPrice(recalcPrice(product,productOptions,initial))
        setSelectedProduct(product)
        setIsPanelVisible(true)
    }

    function changeSlider(groupId,delta,min,max){
        setSelectedOptions(prev => {
            let value=prev[groupId]+delta;
            if(value<min)
                value=min
            if(value>max)
                value=max

            return {...prev,[groupId]:value}
        })
    }

    function selectSingle(groupId,valueId){
        setSelectedOptions(prev => ({...prev,[groupId]: valueId}))
    }

    function toggleMulti(groupId,valueId){
        setSelectedOptions(prev => {
            const current=prev[groupId]

            const newValues=current.includes(valueId) ? current.filter(v => v!==valueId):[...current,valueId]

            return {...prev,[groupId]: newValues}
        })
    }

    function recalcPrice(product,productOptions,selectedOptions){
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

            if(group.type==="multi"){
                value.forEach(vId => {
                    const opValue=db.productOptionValues.find(v => v.id===vId)
                    if(opValue)
                        price+=opValue.priceDelta
                })
            }
        })

        return price
    }

    return(
        <div>
            {isOrderLoading ? (
                <div className="loading_anim"/>
            ):(
                <div id="order_panels">
                    {isPanelVisible && (
                        <>
                            <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
                            <div id="product_options" className="col_align">
                                <button className="product_exit_button" onClick={() => setIsPanelVisible(false)}>X</button>
                                <p className="product_name">{selectedProduct.name}</p>
                                <hr/>
                                <div className="product_options">
                                    {selectedProductOptions.length===0 ? (
                                        <></>
                                    ):(
                                        selectedProductOptions.map(po => (
                                            <div key={po.id} className="product_option_group">
                                                {po.type==="slider" && (
                                                    <div className="col_align">
                                                        <p className="product_group_name">{po.name}</p>
                                                        <div className="row_align">
                                                            <button className="slider_button" onClick={() => changeSlider(po.id,-1,po.minSelect,po.maxSelect)}>-</button>
                                                            {Array.from({length: po.maxSelect-po.minSelect+1}).map((_,i) => (
                                                                <div key={i} className={"slider_point"+(selectedOptions[po.id]>=(po.minSelect+i) ? " active":"")}/>
                                                            ))}
                                                            <button className="slider_button" onClick={() => changeSlider(po.id,1,po.minSelect,po.maxSelect)}>+</button>
                                                        </div>
                                                    </div>
                                                )}
                                                {po.type==="single" && (
                                                    <div className="col_align">
                                                        <p className="product_group_name">{po.name}</p>
                                                        <div className="col_align">
                                                            {po.selections.length===0 ? (
                                                                <></>
                                                            ):(
                                                                po.selections.map(selection => (
                                                                    <div key={selection.id} className="product_group_selection row_align" onClick={() => selectSingle(po.id,selection.id)}>
                                                                        <div className={"selection_point"+(selectedOptions[po.id]===selection.id ? " active":"")}/>
                                                                        {selection.name}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {po.type==="multi" && (
                                                    <div className="col_align">
                                                        <p className="product_group_name">{po.name}</p>
                                                        <div className="col_align">
                                                            {po.selections.length===0 ? (
                                                                <></>
                                                            ):(
                                                                po.selections.map(selection => (
                                                                    <div key={selection.id} className="product_group_selection row_align" onClick={() => toggleMulti(po.id,selection.id)}>
                                                                        <div className={"selection_point"+(selectedOptions[po.id].includes(selection.id) ? " active":"")}/>
                                                                        {selection.name}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="product_quantity row_align">
                                    <p className="product_quantity_text">Kiekis: 0</p>
                                    <button className="product_quantity_button">-</button>
                                    <button className="product_quantity_button">+</button>
                                    <p className="product_price">Kaina: {selectedProductPrice.toFixed(2)}€</p>
                                </div>
                                {addingNewProduct ? (
                                    <button className="product_confirm_button">
                                        Pridėti
                                    </button>
                                ):(
                                    <button className="product_confirm_button">
                                        Pakeisti
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                    {order.status!=="Atvira" ? (
                        <></>
                    ):(
                        <>
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
                                        <button key={p.id} className="product_card col_align" onClick={() => {setAddingNewProduct(true);openProductOptions(p.id)}}>
                                            <div id="product_card_name">{p.name}</div>
                                            <div id="product_card_price">{p.price.toFixed(2)}€</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                    <div id="order_info" className={(order.status!=="Atvira" ? "closed_order":"")+" col_align"}>
                        <div id="order_info_id">Užsakymo ID: {order.id}</div>
                        <div id="order_product_list" className="col_align">
                            {orderProducts.length===0 ? (
                                <></>
                            ):(
                                orderProducts.map(op => (
                                    <button key={op.id} className="order_product_card col_align" onClick={() => {setAddingNewProduct(false);openProductOptions(op.id)}}>
                                        {op.name} * {op.quantity}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="order_total_info row_align">
                            <p id="order_total">Iš viso: {order.total}</p>
                            <p id="order_quantity">Kiekis: {order.quantity}</p>
                        </div>
                        {order.status!=="Atvira" ? (
                            <></>
                        ):(
                            <button className="payment_button">Apmokėti</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}