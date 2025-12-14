import {useEffect,useState} from "react"
import {useNavigate} from "react-router-dom"
import "./orders.css"

import {getDb,saveDb,getNextId} from "../../utils/tempDB"
import {calcProductPrice} from "../../utils/priceCalculations"

import {PageControls} from "../../components/controls/pageControls"
import {filterList,filterStatusList,sortBy} from "../../utils/filtering"

export const Orders=({user,business,onOrderOpen}) => {
    const navigate=useNavigate()

    const [orders,setOrders]=useState([])

    const [selectedStates,setSelectedStates]=useState([])
    const [dateFrom,setDateFrom]=useState("")
    const [dateTo,setDateTo]=useState("")
    const [totalMin,setTotalMin]=useState("")
    const [totalMax,setTotalMax]=useState("")

    const [sortType,setSortType]=useState("date_increase")
    const [filteredOrders,setFilteredOrders]=useState([])

    const [currentPage,setCurrentPage]=useState(1)

    const [showFilters,setShowFilters]=useState(false)

    const pageSize=6
    const totalPages=Math.max(1,Math.ceil(filteredOrders.length/pageSize))
    const visibleOrders=filteredOrders.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

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

    useEffect(() => {
        const filterByStatus=filterStatusList(orders,selectedStates)
        const filteredList=filterList(filterByStatus,dateFrom,dateTo,totalMin,totalMax)
        const sortedList=sortBy(filteredList,sortType)

        setFilteredOrders(sortedList)
    },[orders,selectedStates,sortType,dateFrom,dateTo,totalMin,totalMax])

    function loadOrders(){
        const db=getDb()

        const ordersData=db.orders
            .filter(o => o.businessId===business.id)

        ordersData.forEach(order => {
            let total=0

            const orderProductsData=db.orderProducts.filter(op => op.orderId===order.id)
            orderProductsData.forEach(orderProduct => {
                const product=db.products.find(p => p.id===orderProduct.productId)
                if(!product)
                    return

                let selectedOptions={}
                const selectedOptionRows=db.orderProductSelectedOptions.filter(o => o.orderProductId===orderProduct.id)
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

                const priceWithOptions=calcProductPrice(product,productOptions,selectedOptions,orderProduct.quantity)

                total+=priceWithOptions
            });

            order.total=total!==undefined ? total:0
        });

        setOrders(ordersData)
        setCurrentPage(1)
    }

    function clearFilters(){
        setSelectedStates([])
        setDateFrom("")
        setDateTo("")
        setTotalMin("")
        setTotalMax("")
    }

    function toggleStatus(status){
        setSelectedStates(prev =>
            prev.includes(status) ? prev.filter(s => s!==status):[...prev,status]
        )
    }

    function createOrder(){
        const db=getDb()

        const nextId=getNextId(db.orders)
        const newOrder={
            id:nextId,
            businessId:business.id,
            status:"open",
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
            <div id="controls" className="col_align">
                <div id="main_controls" className="row_align">
                    <button id="filter_button" className="control_button" onClick={() => setShowFilters(prev => !prev)}>Filtrai</button>
                    <div id="sort_button" className="control_button">Rikiavimas
                        <div id="sort_content">
                            <button id="sort_item_button" onClick={() => setSortType("id_increase")}>ID: Didėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("id_decrease")}>ID: Mažėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("date_increase")}>Data: Nuo Naujausios</button>
                            <button id="sort_item_button" onClick={() => setSortType("date_decrease")}>Data: Nuo seniausios</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_increase")}>Suma: Didėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_decrease")}>Suma: Mažėjančiai</button>
                        </div>
                    </div>
                    <button id="create_button" className="control_button" onClick={() => createOrder()}>Sukurti Užsakyma</button>
                </div>
                <hr className={!showFilters ? "hide_element":""}/>
                <div id="filter_controls" className={"row_align "+(!showFilters ? "hide_element":"")}>
                    <div id="filter_option" className="col_align">
                        <p id="filter_title">Būklė:</p>
                        <hr/>
                        <div id="filter_checkbox_options" className="col_align">
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("open")} onChange={() => toggleStatus("open")}/>Atvira</div>
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("closed")} onChange={() => toggleStatus("closed")}/>Uždaryta</div>
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("paid")} onChange={() => toggleStatus("paid")}/>Apmokėta</div>
                            <div id="filter_checkbox_option"><input type="checkbox" className="filter_checkbox" checked={selectedStates.includes("refund")} onChange={() => toggleStatus("refund")}/>Gražinta</div>
                        </div>
                    </div>
                    <div id="filter_option" className="col_align">
                        <p id="filter_title">Data:</p>
                        <hr/>
                        <label id="filter_label">Nuo:</label>
                        <input className="filter_input_field" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}/>
                        <label id="filter_label">Iki:</label>
                        <input className="filter_input_field" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}/>
                    </div>
                    <div id="filter_option" className="col_align">
                        <p id="filter_title">Suma:</p>
                        <hr/>
                        <label id="filter_label">Min:</label>
                        <input className="filter_input_field" type="number" value={totalMin} onChange={(e) => setTotalMin(e.target.value)}/>
                        <label id="filter_label">Max:</label>
                        <input className="filter_input_field" type="number" value={totalMax} onChange={(e) => setTotalMax(e.target.value)}/>
                    </div>
                    <button id="clear_button" className="control_button" onClick={() => clearFilters()}>Išvalyti Filtrus</button>
                </div>
            </div>
            <div id="item_list">
                {visibleOrders.length===0 ? (
                    <p id="order_card_not_found">Nerasta užsakymų</p>
                ):(
                    visibleOrders.map(o => (
                        <button key={o.id} id="order_card" className="col_align" onClick={() => onOrderOpen(o.id)}>
                            <p id="order_card_id">ID: {o.id}</p>
                            <p id="order_card_status">Būklė: {
                                o.status==="open" ? "Atvira":
                                o.status==="closed" ? "Uždaryta":
                                o.status==="paid" ? "Apmokėta":
                                o.status==="refund" ? "Gražinta":""
                            }</p>
                            <p id="order_card_created">Sukurtas: {formatter.format(new Date(o.createdAt))}</p>
                            {o.closedAt!=="" && (
                                <p id="order_card_closed">Uždarytas: {formatter.format(new Date(o.closedAt))}</p>
                            )}
                            <p id="order_card_total">Iš viso: {o.total.toFixed(2)}€</p>
                        </button>
                    ))
                )}
            </div>
            <PageControls page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)}/>
        </div>
    )
}