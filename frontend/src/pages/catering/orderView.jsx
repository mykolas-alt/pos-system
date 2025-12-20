import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./orderView.css"

import {getDb,saveDb,getNextId} from "../../utils/tempDB"
import {calcProductPrice} from "../../utils/priceCalculations"
import {filterSearchList,filterList,sortBy} from "../../utils/filtering"

export const OrderView=({api,user,business}) => {
    const {orderId}=useParams()
    const navigate=useNavigate()

    const [order,setOrder]=useState(null)

    const [search,setSearch]=useState("")
    const [totalMin,setTotalMin]=useState("")
    const [totalMax,setTotalMax]=useState("")
    const [sortType,setSortType]=useState("name_increase")
    const [filteredProducts,setFilteredProducts]=useState([])

    const [products,setProducts]=useState([])
    const [comment,setComment]=useState("")

    const [selectedProduct,setSelectedProduct]=useState()
    const [selectedProductOptions,setSelectedProductOptions]=useState([])
    const [selectedProductPrice,setSelectedProductPrice]=useState(0)
    const [selectedProductQuantity,setSelectedProductQuantity]=useState(1)
    const [selectedOptions,setSelectedOptions]=useState({})

    const [productsToPay,setProductsToPay]=useState([])
    const [selectedProductsToPay,setSelectedProductsToPay]=useState([])

    const [isOrderLoading,setIsOrderLoading]=useState(true)
    const [isPanelVisible,setIsPanelVisible]=useState(false)
    const [isOptionsVisible,setIsOptionsVisible]=useState(false)
    const [isCommentVisible,setIsCommentVisible]=useState(false)
    const [isPaymentPanelVisible,setIsPaymentPanelVisible]=useState(false)

    const [addingNewProduct,setAddingNewProduct]=useState(false)
    const [editingOrderProductId,setEditingOrderProductId]=useState(null)
    const [isSplitCheck,setIsSplitCheck]=useState(false)

    const statusMap={
        OPEN:"Atvira",
        IN_PROGRESS:"Vykdoma",
        PAID:"Apmokėta",
        REFUNDED:"Gražinta",
        CANCELLED:"Atšaukta",
        PARTIALLY_PAID:"Daliniai apmokėta"
    }

    useEffect(() => {
        async function initOrder(){
            try{
                setIsOrderLoading(true)
                const orderData=await loadOrderData(user.token)
                setOrder(orderData)
                const productList=await loadProducts(user.token)
                setProducts(productList)
            }catch{
                navigate(`/${user.info.username}/CATERING/${business.id}/orders`)
                return
            }finally{
                setIsOrderLoading(false)
            }
        }

        initOrder()
    },[user,orderId])

    useEffect(() => {
        if(!selectedProduct)
            return

        const newPrice=selectedProduct.price*selectedProductQuantity
        setSelectedProductPrice(newPrice)
    },[selectedOptions,selectedProductQuantity])

    useEffect(() => {
        const filterBySearchList=filterSearchList(products,search)
        const filteredList=filterList(filterBySearchList,"","",totalMin,totalMax)
        const sortedList=sortBy(filteredList,sortType)

        setFilteredProducts(sortedList)
    },[products,sortType,totalMin,totalMax])

    async function loadOrderData(token){
        const response=await fetch(`${api}order/${orderId}`,{
            method: "GET",
            headers: {"Authorization":`Bearer ${token}`}
        })

        if(!response.ok){
            throw new Error("Failed to load order")
        }

        return await response.json()
    }

    async function loadProducts(token){
        const response=await fetch(`${api}product`,{
            method: "GET",
            headers: {"Authorization":`Bearer ${token}`}
        })

        if(!response.ok){
            throw new Error("Failed to load products")
        }

        return await response.json()
    }

    function openProductOptions(id,isEditing){
        let product
        let quantity=1
        let initialSelections={}

        if(isEditing){
            setEditingOrderProductId(id)
            const orderProduct=order.items.find(op => op.id===id)
            product=orderProduct.product

            quantity=orderProduct.quantity

            /*const selectedOptionRows=db.orderProductSelectedOptions.filter(o => o.orderProductId===orderProduct.id)
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
            })*/
        }else{
            setEditingOrderProductId(null)
            product=products.find(p => p.id===id)

            /*const optionGroups=db.productOptionGroups.filter(g => g.productId===id)
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
            })*/
        }

        let productOptions=[]
        /*const optionGroups=db.productOptionGroups.filter(g => g.productId===product.id)
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
        })*/

        setSelectedProduct(product)

        setSelectedProductOptions(productOptions)
        setSelectedOptions(initialSelections)

        setSelectedProductQuantity(quantity)
        setSelectedProductPrice(product.price)

        setIsPanelVisible(true)
    }
    
    function openSplitCheck(){
        setIsSplitCheck(true)
        const db=getDb()

        const orderProductsData=db.orderProducts.filter(op => op.orderId===Number(orderId))
        let orderContent=[]
        orderProductsData.forEach(orderProduct => {
            const products=db.products.filter(p => p.id===orderProduct.productId)
            products.forEach(product => {
                orderContent.push({
                    ...product,
                    quantity:orderProduct.quantity,
                    orderProductId:orderProduct.id,
                    price:calcProductPrice(product,
                                    db.productOptionGroups.filter(g => g.productId === product.id).map(group => {
                                        const selections = db.productOptionValues.filter(pov => pov.productOptionGroupId === group.id);
                                        return {...group, selections};
                                    }),
                                    db.orderProductSelectedOptions.filter(o => o.orderProductId === orderProduct.id)
                                    .reduce((acc,row) => {
                                        acc[row.productOptionGroupId] = row.value;
                                        return acc;
                                    }, {}))
                })
            })
        });
        
        setProductsToPay(orderContent)
        setSelectedProductsToPay([])
    }

    function openComment(){
        setComment(order.note || "")

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

    function toggleProductSelection(orderProductId){
        setSelectedProductsToPay(prev => prev.includes(orderProductId) ? prev.filter(id => id!==orderProductId):[...prev,orderProductId])
    }

    function changeQuantity(delta){
        setSelectedProductQuantity(prev => {
            let value=prev+delta;
            if(value<1)
                value=1

            return value
        })
    }
    
    async function addProductToOrder(){
        const response=await fetch(`${api}order/${orderId}/product`,{
            method: "POST",
            headers: {
                "Authorization":`Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: selectedProduct.id,
                quantity: selectedProductQuantity
            })
        })

        if(!response.ok){
            throw new Error("Failed to add product to order")
        }
        /*selectedProductOptions.forEach(group => {
            const newOrderProductSelectedOptions={
                id:nextOptId++,
                orderProductId:newOrderProduct.id,
                productOptionGroupId:group.id,
                value:selectedOptions[group.id]
            }

            db.orderProductSelectedOptions.push(newOrderProductSelectedOptions)
        })

        db.orderProducts.push(newOrderProduct)*/

        const orderData=await loadOrderData(user.token)
        setOrder(orderData)
        setComment(orderData.note || "")
        setIsPanelVisible(false)
    }

    async function changeProductInOrder(){
        const response=await fetch(`${api}order/${orderId}/product/${editingOrderProductId}`,{
            method: "PUT",
            headers: {
                "Authorization":`Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quantity: selectedProductQuantity
            })
        })

        if(!response.ok){
            throw new Error("Failed to change product in order")
        }

        const orderData=await loadOrderData(user.token)
        setOrder(orderData)
        setComment(orderData.note || "")
        setIsPanelVisible(false)
        setEditingOrderProductId(null)
    }

    async function deleteProductInOrder(orderProductId){
        const response=await fetch(`${api}order/${orderId}/product/${orderProductId}`,{
            method: "DELETE",
            headers: {"Authorization":`Bearer ${user.token}`}
        })

        if(!response.ok){
            throw new Error("Failed to remove product from order")
        }
        /*selectedProductOptions.forEach(group => {
            const newOrderProductSelectedOptions={
                id:nextOptId++,
                orderProductId:newOrderProduct.id,
                productOptionGroupId:group.id,
                value:selectedOptions[group.id]
            }

            db.orderProductSelectedOptions.push(newOrderProductSelectedOptions)
        })

        db.orderProducts.push(newOrderProduct)*/

        const orderData=await loadOrderData(user.token)
        setOrder(orderData)
        setComment(orderData.note || "")
        setIsPanelVisible(false)
    }

    function clearFilters(){
        setSelectedCategories([])
        setTotalMin("")
        setTotalMax("")
    }

    async function cancelOrder(){
        const response=await fetch(`${api}order/${orderId}`,{
            method: "DELETE",
            headers: {"Authorization":`Bearer ${user.token}`}
        })

        if(!response.ok){
            throw new Error("Failed to cancel order")
        }

        const orderData=await loadOrderData(user.token)
        setOrder(orderData)
        setComment(orderData.note || "")
        setIsOptionsVisible(false)
    }

    async function completeOrder(){
        const response=await fetch(`${api}order/${orderId}`,{
            method: "POST",
            headers: {"Authorization":`Bearer ${user.token}`}
        })

        if(!response.ok){
            throw new Error("Failed to complete order")
        }

        const orderData=await loadOrderData(user.token)
        setOrder(orderData)
        setComment(orderData.note || "")
    }

    async function saveComment(){
        const response=await fetch(`${api}order/${orderId}`,{
            method: "PUT",
            headers: {
                "Authorization":`Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: comment})
        })

        if(!response.ok){
            throw new Error("Failed to update order")
        }

        const orderData=await loadOrderData(user.token)
        setOrder(orderData)
        setComment(orderData.note || "")
        const productList=await loadProducts(user.token)
        setProducts(productList)
        setIsCommentVisible(false)
    }

    function confirmPayment(){
        const db=getDb()
        
        if(isSplitCheck){
            if(selectedProductsToPay.length===0){
                toast.error("Pasirinkite bent vieną produktą")
                return
            }

            const remainingProducts=productsToPay.filter(p => !selectedProductsToPay.includes(p.orderProductId))
            setProductsToPay(remainingProducts)
            setSelectedProductsToPay([])
            toast.success("Apmokėta")

            if(remainingProducts.length===0){
                const existing=db.orders.find(o => o.id===Number(orderId))

                if(existing){
                    existing.status="paid"
                    saveDb(db)
                }
            
                setIsPaymentPanelVisible(false)
                loadOrderData()
            }
        }else{
            const existing=db.orders.find(o => o.id===Number(orderId))

            if(!existing){
                toast.error("Klaida: užsakymas nerasta")
                return
            }

            existing.status="paid"

            saveDb(db)
            setIsPaymentPanelVisible(false)
            loadOrderData()
        }
    }

    if(!user || !user.info || !business || !order)
        return null

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
                                <button id="product_close_button" className="close_button" onClick={() => setIsPanelVisible(false)}>X</button>
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
                                    <button className="product_confirm_button" onClick={addProductToOrder}>
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
                    {order.status!=="OPEN" ? (
                        <></>
                    ):(
                        <>
                            <div id="order_filters" className="col_align">
                                <input id="order_search" type="text" placeholder="Pieška" value={search} onChange={(e) => setSearch(e.target.value)}/>
                                <div id="order_sort_button" className="control_button">Rikiavimas
                                    <div id="sort_content">
                                        <button id="sort_item_button" onClick={() => setSortType("name_increase")}>Pavadinimas: A-Z</button>
                                        <button id="sort_item_button" onClick={() => setSortType("name_decrease")}>Pavadinimas: Z-A</button>
                                        <button id="sort_item_button" onClick={() => setSortType("price_increase")}>Kaina: Didėjančiai</button>
                                        <button id="sort_item_button" onClick={() => setSortType("price_decrease")}>Kaina: Mažėjančiai</button>
                                    </div>
                                </div>
                                <div id="order_filter_options" className="col_align">
                                    <p id="order_filter_title">Kaina:</p>
                                    <hr/>
                                    <label id="order_filter_label">Min:</label>
                                    <input className="order_filter_input_field" type="number" value={totalMin} onChange={(e) => setTotalMin(e.target.value)}/>
                                    <label id="order_filter_label">Max:</label>
                                    <input className="order_filter_input_field" type="number" value={totalMax} onChange={(e) => setTotalMax(e.target.value)}/>
                                </div>
                                <button id="clear_button" className="control_button" onClick={() => clearFilters()}>Išvalyti Filtrus</button>
                            </div>
                            <div id="products_to_add">
                                {filteredProducts.length===0 ? (
                                    <p id="product_card_to_add_not_found">Nerasta pozicijų</p>
                                ):(
                                    filteredProducts.map(p => (
                                        <button key={p.id} id="product_card_to_add" className="col_align" onClick={() => {setAddingNewProduct(true);openProductOptions(p.id,false)}}>
                                            <div id="product_card_to_add_name">{p.name}</div>
                                            <div id="product_card_to_add_price">{p.price.toFixed(2)}€</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                    <div id="order_info" className={(order.status!=="OPEN" ? "closed_order":"")+" col_align"}>
                        <div id="order_info_id">ID: {order.id}</div>
                        <div id="order_info_status">Būklė: {statusMap[order.status] ?? order.status}</div>
                        <div id="order_product_list" className="col_align">
                            {order.items.length===0 ? (
                                <></>
                            ):(
                                order.items.map(op => (
                                    order.status!=="OPEN" ? (
                                        <div key={op.id} className="order_product_card row_align">
                                            {op.product.name} * {op.quantity} - {(op.product.price * op.quantity).toFixed(2)}€
                                        </div>
                                    ):(
                                        <div key={op.id} className="order_product_card row_align">
                                            {op.product.name} * {op.quantity} - {(op.product.price * op.quantity).toFixed(2)}€
                                            <button className="order_product_card_edit_button" onClick={() => {setAddingNewProduct(false);openProductOptions(op.id,true)}}>Keisti</button>
                                            <button className="order_product_card_delete_button" onClick={() => deleteProductInOrder(op.id)}>X</button>
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                        <div className="order_total_info row_align">
                            <p id="order_total">Iš viso: {(order.total ?? 0).toFixed(2)}€</p>
                            <p id="order_quantity">Kiekis: {order.items.reduce((sum,op) => sum+op.quantity,0)}</p>
                        </div>
                        <div className="order_more_functions row_align">
                            <button id="order_options_button" onClick={() => setIsOptionsVisible(true)}>Opcijos</button>
                            {isOptionsVisible && (
                                <>
                                    <div id="invisible_panel" onClick={() => setIsOptionsVisible(false)}/>
                                    <div id="order_options_panel">
                                        <button id="order_option_button">Nuolaidos</button>
                                        {order.status!=="CANCELLED" && order.status!=="PAID" && (
                                            <button id="order_option_button" onClick={cancelOrder}>Atšaukti</button>
                                        )}
                                        {order.status==="PAID" && (
                                            <button id="order_option_button">Grąžinimas</button>
                                        )}
                                    </div>
                                </>
                            )}
                            <button className="order_comment_button" onClick={() => openComment()}>Pastaba</button>
                            {isCommentVisible && (
                                <>
                                    <div id="invisible_panel" onClick={() => setIsCommentVisible(false)}/>
                                    <div id="order_comment_panel" className="col_align">
                                        {order.status!=="OPEN" ? (
                                            <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} readOnly/>
                                        ):(
                                            <>
                                                <textarea className="comment_input" type="text" placeholder="Pastabos" value={comment} onChange={e => setComment(e.target.value)}/>
                                                <button className="comment_save_button" onClick={saveComment}>Išsaugoti</button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {order.status!=="OPEN" ? (
                            order.status==="IN_PROGRESS" ? (
                                <button className="payment_button">Apmokėti</button>
                            ):(
                                <></>
                            )
                        ):(
                            <button className="payment_button" onClick={completeOrder}>Užbaigti</button>
                        )}
                    </div>
                    {isPaymentPanelVisible && (
                        <>
                            {isSplitCheck ? (
                                <div id="transparent_panel"/>
                            ):(
                                <div id="transparent_panel" onClick={() => setIsPaymentPanelVisible(false)}/>
                            )}
                            <div id="payment_panel" className="col_align">
                                {isSplitCheck && (
                                    <div id="payment_product_list" className="col_align">
                                        {productsToPay.map(p => (
                                            <div key={p.orderProductId} className={"payment_product_card row_align"+(selectedProductsToPay.includes(p.orderProductId) ? " selected":"")} onClick={() => toggleProductSelection(p.orderProductId)}>
                                                {p.name} {p.price.toFixed(2)}€
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="payment_panel_button" onClick={() => confirmPayment()}>Grynais</button>
                                <button className="payment_panel_button" onClick={() => confirmPayment()}>Kortėle</button>
                                <button className="payment_panel_button" onClick={() => openSplitCheck()}>Sąskaitos padalijimas</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}