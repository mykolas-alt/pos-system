import React,{useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import "./orderView.css"

import {getDb,saveDb} from "../../utils/tempDB"

export const OrderView=({user,business}) => {
    const {orderId}=useParams()
    const navigate=useNavigate()

    const [order,setOrder]=useState()
    const [productsInOrder,setProductsInOrder]=useState([])

    const [search,setSearch]=useState("")
    const [categories,setCategories]=useState([])
    const [selectedCategories,setSelectedCategories]=useState([])

    const [products,setProducts]=useState([])
    const [comment,setComment]=useState("")

    const [selectedProduct,setSelectedProduct]=useState()
    const [selectedProductOptions,setSelectedProductOptions]=useState([])
    const [selectedProductPrice,setSelectedProductPrice]=useState(0)
    const [selectedProductQuantity,setSelectedProductQuantity]=useState(1)
    const [selectedOptions,setSelectedOptions]=useState({})

    const [isOrderLoading,setIsOrderLoading]=useState(true)
    const [isPanelVisible,setIsPanelVisible]=useState(false)
    const [isCommentVisible,setIsCommentVisible]=useState(false)
    const [addingNewProduct,setAddingNewProduct]=useState(false)
    const [editingOrderProductId,setEditingOrderProductId]=useState(null)

    const filteredProducts=products.filter(p => {
        const matchesSearch=p.name.toLowerCase().includes(search.toLowerCase())

        const matchesCategory=selectedCategories.length===0 || selectedCategories.includes(p.categoryId)

        return matchesSearch && matchesCategory
    })

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }
        
        loadOrderData()

        setIsOrderLoading(false)
    },[user])

    useEffect(() => {
        if(!selectedProduct || selectedProductOptions.length===0)
            return

        const newPrice=recalcPrice(selectedProduct,selectedProductOptions,selectedOptions)
        setSelectedProductPrice(newPrice)
    },[selectedOptions,selectedProductQuantity])

    function loadOrderData(){
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
                orderContent.push({
                    ...product,
                    quantity:orderProduct.quantity,
                    orderProductId:orderProduct.id
                })
                total=product.price*orderProduct.quantity+total
            })
            quantity=orderProduct.quantity+quantity
        });

        orderData.total=total!==undefined ? total:0
        orderData.quantity=quantity!==undefined ? quantity:0

        setOrder(orderData)
        setProducts(productsData)
        setProductsInOrder(orderContent)
        setCategories(categoriesData)
    }

    function getNextId(arr){
        return arr.reduce((m,it) => Math.max(m,(it && it.id) || 0),0)+1
    }

    function toggleCategory(id){
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c!==id):[...prev,id]
        )
    }

    function openProductOptions(id,isEditing){
        const db=getDb()

        let product
        let quantity=1
        let initialSelections={}

        if(isEditing){
            setEditingOrderProductId(id)
            const orderProduct=db.orderProducts.find(op => op.id===id)
            product=db.products.find(p => p.id===orderProduct.productId)

            quantity=orderProduct.quantity

            const selectedOptionRows=db.orderProductSelectedOptions.filter(o => o.orderProductId===orderProduct.id)
            selectedOptionRows.forEach(row => {
                const group=db.productOptionGroups.find(g => g.id===row.productOptionGroupId)

                if(group.type==="slider"){
                    initialSelections[group.id]=row.value
                }
                if(group.type==="single"){
                    initialSelections[group.id]=row.value
                }
                if(group.type==="multi"){
                    if(!initialSelections[group.id])
                        initialSelections[group.id]=[]

                    if(Array.isArray(row.value)){
                        initialSelections[group.id]=row.value
                    }else{
                        initialSelections[group.id].push(row.value)
                    }
                }
            })
        }else{
            setEditingOrderProductId(null)
            product=db.products.find(p => p.id===id)

            const optionGroups=db.productOptionGroups.filter(g => g.productId===id)
            optionGroups.forEach(group => {
                if(group.type==="slider"){
                    initialSelections[group.id]=group.minSelect
                }
                if(group.type==="single"){
                    initialSelections[group.id]=null
                }
                if(group.type==="multi"){
                    initialSelections[group.id]=[]
                }
            })
        }

        let productOptions=[]
        const optionGroups=db.productOptionGroups.filter(g => g.productId===product.id)
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

        setSelectedProduct(product)

        setSelectedProductOptions(productOptions)
        setSelectedOptions(initialSelections)

        setSelectedProductPrice(recalcPrice(product,productOptions,initialSelections))
        setSelectedProductQuantity(quantity)

        setIsPanelVisible(true)
    }

    function openComment(){
        const db=getDb()

        const orderComment=order.comment

        setComment(orderComment)
        setIsCommentVisible(true)
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

    function changeQuantity(delta){
        setSelectedProductQuantity(prev => {
            let value=prev+delta;
            if(value<1)
                value=1

            return value
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

        price=price*selectedProductQuantity

        return price
    }

    function addProductToOrder(){
        const db=getDb()

        const nextOrderProductId=getNextId(db.orderProducts)
        const newOrderProduct={
            id:nextOrderProductId,
            orderId:order.id,
            productId:selectedProduct.id,
            quantity:selectedProductQuantity
        }

        let nextOptId=getNextId(db.orderProductSelectedOptions)
        selectedProductOptions.forEach(group => {
            const newOrderProductSelectedOptions={
                id:nextOptId++,
                orderProductId:newOrderProduct.id,
                productOptionGroupId:group.id,
                value:selectedOptions[group.id]
            }

            db.orderProductSelectedOptions.push(newOrderProductSelectedOptions)
        })

        db.orderProducts.push(newOrderProduct)
        saveDb(db)

        loadOrderData()
        setIsPanelVisible(false)
    }

    function changeProductInOrder(){
        const db=getDb()

        const orderProduct=db.orderProducts.find(op => op.id===editingOrderProductId)
        if(!orderProduct)
            return

        orderProduct.quantity=selectedProductQuantity

        let nextId=getNextId(db.orderProductSelectedOptions)

        db.orderProductSelectedOptions=db.orderProductSelectedOptions.filter(o => o.orderProductId!==editingOrderProductId)

        selectedProductOptions.forEach(group => {
            const existing=db.orderProductSelectedOptions.find(o => o.orderProductId===editingOrderProductId && o.productOptionGroupId===group.id)
            const valueToStore=selectedOptions[group.id]

            if(existing){
                existing.value=valueToStore
            }else{
                const newOptionRow={
                    id:nextId++,
                    orderProductId:editingOrderProductId,
                    productOptionGroupId:group.id,
                    value:valueToStore
                }

                db.orderProductSelectedOptions.push(newOptionRow)
            }
        })

        const groupIds=selectedProductOptions.map(g => g.id)
        db.orderProductSelectedOptions=db.orderProductSelectedOptions.filter(o => !(o.orderProductId===editingOrderProductId && !groupIds.includes(o.productOptionGroupId)))

        saveDb(db)

        loadOrderData()
        setIsPanelVisible(false)
        setEditingOrderProductId(null)
    }

    function deleteProductInOrder(orderProductId){
        const db=getDb()

        db.orderProducts=db.orderProducts.filter(op => op.id!==orderProductId)

        db.orderProductSelectedOptions=db.orderProductSelectedOptions.filter(o => o.orderProductId!==orderProductId)

        saveDb(db)
        loadOrderData()
    }

    function saveComment(){
        const db=getDb()

        const orderData=db.orders.find(o => o.id===Number(orderId))
        if(!orderData)
            return

        orderData.comment=comment

        saveDb(db)
        loadOrderData()
        setIsCommentVisible(false)
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
                                {selectedProductOptions.length===0 ? (
                                    <></>
                                ):(
                                    <div className="product_options_list">
                                        {selectedProductOptions.map(po => (
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
                                        ))}
                                    </div>
                                )}
                                <div className="product_quantity row_align">
                                    <p className="product_quantity_text">Kiekis: {selectedProductQuantity}</p>
                                    <button className="product_quantity_button" onClick={() => changeQuantity(-1)}>-</button>
                                    <button className="product_quantity_button" onClick={() => changeQuantity(1)}>+</button>
                                    <p className="product_price">Kaina: {selectedProductPrice.toFixed(2)}€</p>
                                </div>
                                {addingNewProduct ? (
                                    <button className="product_confirm_button" onClick={() => addProductToOrder()}>
                                        Pridėti
                                    </button>
                                ):(
                                    <button className="product_confirm_button" onClick={() => changeProductInOrder()}>
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
                                        <button key={p.id} className="product_card col_align" onClick={() => {setAddingNewProduct(true);openProductOptions(p.id,false)}}>
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
                            {productsInOrder.length===0 ? (
                                <></>
                            ):(
                                productsInOrder.map(op => (
                                    order.status!=="Atvira" ? (
                                        <div key={op.orderProductId} className="order_product_card row_align">
                                            {op.name} * {op.quantity}
                                        </div>
                                    ):(
                                        <div key={op.orderProductId} className="order_product_card row_align">
                                            {op.name} * {op.quantity}
                                            <button className="order_product_card_edit_button" onClick={() => {setAddingNewProduct(false);openProductOptions(op.orderProductId,true)}}>Keisti</button>
                                            <button className="order_product_card_delete_button" onClick={() => deleteProductInOrder(op.orderProductId)}>X</button>
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                        <div className="order_total_info row_align">
                            <p id="order_total">Iš viso: {order.total.toFixed(2)}€</p>
                            <p id="order_quantity">Kiekis: {order.quantity}</p>
                        </div>
                        <div className="order_more_functions row_align">
                            <button className="order_options_button">Opcijos</button>
                            <button className="order_comment_button" onClick={() => openComment()}>Pastaba</button>
                            {isCommentVisible && (
                                <div className="order_comment_panel col_align">
                                    <button className="comment_close_button" onClick={() => setIsCommentVisible(false)}>X</button>
                                    {order.status!=="Atvira" ? (
                                        <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} readOnly/>
                                    ):(
                                        <>
                                            <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                                            <button className="comment_save_button" onClick={() => saveComment()}>Išsaugoti</button>
                                        </>
                                    )}
                                </div>
                            )}
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