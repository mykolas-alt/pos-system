import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./products.css"

import {getDb,saveDb,getNextId} from "../../utils/tempDB"

import {PageControls} from "../../components/controls/pageControls"
import {filterList,sortBy} from "../../utils/filtering"

export const Products=({user,business}) => {
    const navigate=useNavigate()
    
    const [products,setProducts]=useState([])
    
    const [totalMin,setTotalMin]=useState("")
    const [totalMax,setTotalMax]=useState("")

    const [sortType,setSortType]=useState("name_increase")
    const [filteredProducts,setFilteredProducts]=useState([])

    const [showFilters,setShowFilters]=useState(false)

    const [selectedProduct,setSelectedProduct]=useState(null)

    const [newProductName,setNewProductName]=useState("")
    const [newProductCategory,setNewProductCategory]=useState("")
    const [newProductPrice,setNewProductPrice]=useState(0)
    const [newProductOptionGroups,setNewProductOptionGroups]=useState([])
    
    const [errors,setErrors]=useState([])

    const [isPanelVisible,setIsPanelVisible]=useState(false)

    const [isEditingProduct,setIsEditingProduct]=useState(false)

    const categories=getDb().categories.filter(c => c.businessId===business.id)

    const [currentPage,setCurrentPage]=useState(1)
    const pageSize=6
    const totalPages=Math.max(1,Math.ceil(filteredProducts.length/pageSize))
    const visibleProducts=filteredProducts.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

    useEffect(() => {
        if(!user){
            navigate("/")
            return
        }

        loadProducts()
    },[user])

    useEffect(() => {
        const filteredList=filterList(products,undefined,undefined,totalMin,totalMax)
        const sortedList=sortBy(filteredList,sortType)

        setFilteredProducts(sortedList)
    },[products,sortType,totalMin,totalMax])

    function loadProducts(){
        const db=getDb()

        const productsData=db.products
            .filter(p => p.businessId===business.id)

        setProducts(productsData)
    }

    function openProductPanel(editing,productId){
        setErrors([])
        if(editing){
            const db=getDb()

            setSelectedProduct(productId)
            const editingProduct=db.products.find(p => p.id===productId)

            const groups=db.productOptionGroups
                .filter(g => g.productId===productId)
                .map(g => ({
                    tempId: crypto.randomUUID(),
                    id: g.id,
                    name: g.name,
                    type: g.type,
                    minSelect: g.minSelect,
                    maxSelect: g.maxSelect,
                    values: db.productOptionValues
                        .filter(v => v.productOptionGroupId===g.id)
                        .map(v => ({
                            tempId: crypto.randomUUID(),
                            id: v.id,
                            name: v.name,
                            priceDelta: v.priceDelta
                        }))
                }))

            setNewProductName(editingProduct.name)
            setNewProductCategory(String(editingProduct.categoryId))
            setNewProductPrice(editingProduct.price)
            setNewProductOptionGroups(groups)
        }else{
            setNewProductName("")
            setNewProductCategory("")
            setNewProductPrice(0)
            setNewProductOptionGroups([])
        }

        setIsEditingProduct(editing)
        setIsPanelVisible(true)
    }

    function clearFilters(){
        setTotalMin("")
        setTotalMax("")
    }

    function createNewProduct(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!newProductName.trim())
          newErrors.newProductName="Įveskite produkto pavadinimą"
        if(newProductPrice<=0)
          newErrors.newProductPrice="Įveskite kainą"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }

        const nextId=getNextId(db.products)
        let newProduct={
            id: nextId,
            businessId: business.id,
            name: newProductName,
            price: Number(newProductPrice),
            categoryId: Number(newProductCategory)
        }

        db.products.push(newProduct)

        newProductOptionGroups.forEach(group => {
            const groupId=getNextId(db.productOptionGroups)

            db.productOptionGroups.push({
                id: groupId,
                productId: newProduct.id,
                name: group.name,
                type: group.type,
                minSelect: group.minSelect,
                maxSelect: group.maxSelect
            })

            if(group.type!=="slider"){
                group.values.forEach(value => {
                    db.productOptionValues.push({
                        id: getNextId(db.productOptionValues),
                        productOptionGroupId: groupId,
                        name: value.name,
                        priceDelta: Number(value.priceDelta || 0)
                    })
                })
            }
        })

        saveDb(db)

        toast.success(`Produktas ${newProduct.name} sėkmingai sukurtas`)
        setIsPanelVisible(false)

        loadProducts()
    }

    function deleteProduct(){
        const db=getDb()
        
        const existing=db.products.find(s => s.id===selectedProduct)

        if(!existing){
            toast.error("Klaida: produktas nerastas")
            return
        }

        const groupIdsToRemove=db.productOptionGroups
            .filter(g => g.productId===selectedProduct)
            .map(g => g.id)

        db.productOptionGroups=db.productOptionGroups.filter(g => g.productId!==selectedProduct)
        db.productOptionValues=db.productOptionValues.filter(v => !groupIdsToRemove.includes(v.productOptionGroupId))
        db.products=db.products.filter(p => p.id!==selectedProduct)

        saveDb(db)

        toast.success(`Produktas ${existing.name} sėkmingai ištrintas`)
        setIsPanelVisible(false)

        loadProducts()
    }

    function saveProduct(){
        setErrors([])
        const db=getDb()
        const newErrors={}

        if(!newProductName.trim())
          newErrors.newProductName="Įveskite produkto pavadinimą"
        if(newProductPrice<=0)
          newErrors.newProductPrice="Įveskite kainą"

        if(Object.keys(newErrors).length>0){
          setErrors(newErrors)
          toast.error("Prašau pataisikit paryškintas vietas")
          return
        }
        
        const existing=db.products.find(s => s.id===selectedProduct)

        if(!existing){
            toast.error("Klaida: produktas nerastas")
            return
        }
        
        existing.name=newProductName
        existing.price=Number(newProductPrice)
        existing.categoryId=Number(newProductCategory)

        const groupIdsToRemove=db.productOptionGroups
            .filter(g => g.productId===selectedProduct)
            .map(g => g.id)

        db.productOptionGroups=db.productOptionGroups.filter(g => g.productId!==selectedProduct)
        db.productOptionValues=db.productOptionValues.filter(v => !groupIdsToRemove.includes(v.productOptionGroupId))
        
        newProductOptionGroups.forEach(group => {
            const groupId=getNextId(db.productOptionGroups)

            db.productOptionGroups.push({
                id: groupId,
                productId: selectedProduct,
                name: group.name,
                type: group.type,
                minSelect: group.minSelect,
                maxSelect: group.maxSelect
            })

            if(group.type!=="slider"){
                group.values.forEach(value => {
                    db.productOptionValues.push({
                        id: getNextId(db.productOptionValues),
                        productOptionGroupId: groupId,
                        name: value.name,
                        priceDelta: Number(value.priceDelta || 0)
                    })
                })
            }
        })

        saveDb(db)

        toast.success(`Produktas ${existing.name} sėkmingai pakeistas`)
        setIsPanelVisible(false)

        loadProducts()
    }

    return(
        <div>
            <div id="controls" className="col_align">
                <div id="main_controls" className="row_align">
                    <button id="filter_button" className="control_button" onClick={() => setShowFilters(prev => !prev)}>Filtrai</button>
                    <div id="sort_button" className="control_button">Rikiavimas
                        <div id="sort_content">
                            <button id="sort_item_button" onClick={() => setSortType("name_increase")}>Pavadinimas: A-Z</button>
                            <button id="sort_item_button" onClick={() => setSortType("name_decrease")}>Pavadinimas: Z-A</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_increase")}>Suma: Didėjančiai</button>
                            <button id="sort_item_button" onClick={() => setSortType("total_decrease")}>Suma: Mažėjančiai</button>
                        </div>
                    </div>
                    <button id="create_button" className="control_button" onClick={() => openProductPanel(false,0)}>Sukurti Produktą</button>
                </div>
                <hr className={!showFilters ? "hide_element":""}/>
                <div id="filter_controls" className={"row_align "+(!showFilters ? "hide_element":"")}>
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
                {visibleProducts.length===0 ? (
                    <p id="product_card_not_found">Nerasta paslaugų</p>
                ):(
                    visibleProducts.map(p => (
                        <button key={p.id} id="product_card" className="col_align" onClick={() => openProductPanel(true,p.id)}>
                            <p id="product_card_name">{p.name}</p>
                            {getDb().categories.find(c => c.id===p.categoryId) && (
                                <p id="product_card_category">Kategorija: {getDb().categories.find(c => c.id===p.categoryId).name}</p>
                            )}
                            <p id="product_card_price">Kaina: {p.price.toFixed(2)}€</p>
                        </button>
                    ))
                )}
            </div>
            <PageControls page={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)}/>
            {isPanelVisible && (
                <>
                    <div id="transparent_panel" onClick={() => setIsPanelVisible(false)}/>
                    <div id="product_create_edit_panel" className="col_align">
                        <label>Pavadinimas</label>
                        <input className="product_create_edit_input_field" placeholder="Pavadinimas" value={newProductName} onChange={e => setNewProductName(e.target.value)}/>
                        {errors.newProductName && (
                            <div className="error_text">
                                {errors.newProductName}
                            </div>
                        )}
                        <label>Kategorija</label>
                        <select className="product_create_edit_select" value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)}>
                            <option value="">-- Pasirinkite categoriją --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <label>Opcijos</label>
                        <div id="product_create_edit_option_list" className="col_align">
                            {Array.isArray(newProductOptionGroups) && newProductOptionGroups.map((group,gi) => (
                                <div key={group.tempId} id="product_create_edit_option_group" className="col_align">
                                    <button id="product_create_edit_option_delete" className="control_button" onClick={() => {
                                        const copy=[...newProductOptionGroups]
                                        setNewProductOptionGroups(copy.filter((_,i) => i!==gi))
                                    }}>Naikinti</button>
                                    <div id="product_create_edit_option_group_wrapper" className="row_align">
                                        <input className="product_create_edit_option_group_name product_create_edit_input_field" placeholder="Opcijos pavadinimas" value={group.name} onChange={e => {
                                            const copy=[...newProductOptionGroups]
                                            copy[gi].name=e.target.value
                                            setNewProductOptionGroups(copy)
                                        }}/>
                                        <select className="product_create_edit_option_group_type product_create_edit_select" value={group.type} onChange={e => {
                                            const copy=[...newProductOptionGroups]
                                            copy[gi].type=e.target.value
                                            if(e.target.value==="slider"){
                                                copy[gi].values=[]
                                            }
                                            setNewProductOptionGroups(copy)
                                        }}>
                                            <option value="slider">Slider</option>
                                            <option value="single">Single</option>
                                            <option value="multi">Multi</option>
                                        </select>
                                    </div>
                                    {group.type==="slider" && (
                                        <div id="product_create_edit_option_group_wrapper" className="row_align">
                                            <input className="product_create_edit_option_group_input product_create_edit_input_field" type="number" placeholder="Min" value={group.minSelect} onChange={e => {
                                                const copy=[...newProductOptionGroups]
                                                copy[gi].minSelect=Number(e.target.value)
                                                setNewProductOptionGroups(copy)
                                            }}/>
                                            <input className="product_create_edit_option_group_input product_create_edit_input_field" type="number" placeholder="Max" value={group.maxSelect} onChange={e => {
                                                const copy=[...newProductOptionGroups]
                                                copy[gi].maxSelect=Number(e.target.value)
                                                setNewProductOptionGroups(copy)
                                            }}/>
                                        </div>
                                    )}
                                    {group.type!=="slider" && (
                                        <div className="col_align">
                                            <hr/>
                                            {Array.isArray(group.values) && group.values.map((v,vi) => (
                                                <div key={v.tempId} className="row_align">
                                                    <input className="product_create_edit_option_value_name product_create_edit_input_field" placeholder="Pasirinkimas" value={v.name} onChange={e => {
                                                        const copy=[...newProductOptionGroups]
                                                        copy[gi].values[vi].name=e.target.value
                                                        setNewProductOptionGroups(copy)
                                                    }}/>
                                                    <input type="number" className="product_create_edit_option_value_price product_create_edit_input_field" value={v.priceDelta} onChange={e => {
                                                        const copy=[...newProductOptionGroups]
                                                        copy[gi].values[vi].priceDelta=e.target.value
                                                        setNewProductOptionGroups(copy)
                                                    }}/>
                                                    <p>€</p>
                                                    <button id="product_create_edit_option_value_delete" className="control_button" onClick={() => {
                                                        const copy=[...newProductOptionGroups]
                                                        copy[gi].values=copy[gi].values.filter((_,i) => i!==vi)
                                                        setNewProductOptionGroups(copy)
                                                    }}>Naikinti</button>
                                                </div>
                                            ))}
                                            <button id="product_create_edit_option_value_create" className="control_button" onClick={() => {
                                                const copy=[...newProductOptionGroups]
                                                copy[gi].values.push({
                                                    tempId: crypto.randomUUID(),
                                                    name: "",
                                                    priceDelta: 0
                                                })
                                                setNewProductOptionGroups(copy)
                                            }}>Pridėti pasirinkimą</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button id="product_create_edit_option_create" className="control_button" onClick={() => {
                                setNewProductOptionGroups(prev => [
                                    ...prev,
                                    {
                                        tempId: crypto.randomUUID(),
                                        name: "",
                                        type: "slider",
                                        minSelect: 0,
                                        maxSelect: 1,
                                        values: []
                                    }
                                ])
                            }}>
                                Pridėti opciją
                            </button>
                        </div>
                        <label>Kaina</label>
                        <div id="product_create_edit_input_wrapper" className="row_align">
                            <input type="number" className="product_create_edit_input_number_field" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value<0 ? 0:e.target.value)}/>
                            <p id="product_create_edit_input_text">€</p>
                        </div>
                        {errors.newProductPrice && (
                            <div className="error_text">
                                {errors.newProductPrice}
                            </div>
                        )}
                        <div id="product_create_edit_controls" className="row_align">
                            <button id="product_create_edit_cancel_button" className="control_button">Atšaukti</button>
                            {isEditingProduct ? (
                                <button id="product_create_edit_confirm_button" className="control_button" onClick={() => saveProduct()}>Išsaugoti</button>
                            ):(
                                <button id="product_create_edit_confirm_button" className="control_button" onClick={() => createNewProduct()}>Sukurti</button>
                            )}
                            {isEditingProduct && (
                                <button id="product_create_edit_delete_button" className="control_button" onClick={() => deleteProduct()}>Ištrinti</button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}