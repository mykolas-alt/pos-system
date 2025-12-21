import {useEffect,useState} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {toast} from 'react-hot-toast'
import "./products.css"

import {PageControls} from "../../components/controls/pageControls"
import {filterList,sortBy} from "../../utils/filtering"

export const Products=({api,user,business}) => {
    const navigate=useNavigate()
    
    const [products,setProducts]=useState([])
    
    const [totalMin,setTotalMin]=useState("")
    const [totalMax,setTotalMax]=useState("")

    const [sortType,setSortType]=useState("name_increase")
    const [filteredProducts,setFilteredProducts]=useState([])

    const [showFilters,setShowFilters]=useState(false)

    const [selectedProduct,setSelectedProduct]=useState(null)

    const [newProductName,setNewProductName]=useState("")
    const [newProductPrice,setNewProductPrice]=useState(0)
    const [newProductOptionGroups,setNewProductOptionGroups]=useState([])
    
    const [errors,setErrors]=useState([])

    const [isPanelVisible,setIsPanelVisible]=useState(false)

    const [isEditingProduct,setIsEditingProduct]=useState(false)

    const [currentPage,setCurrentPage]=useState(1)
    const pageSize=9
    const totalPages=Math.max(1,Math.ceil(filteredProducts.length/pageSize))
    const visibleProducts=filteredProducts.slice(
        (currentPage-1)*pageSize,
        currentPage*pageSize
    )

    useEffect(() => {
        async function initProducts(){
            try{
                setCurrentPage(1)
                const productList=await loadProducts(user.token)
                setProducts(productList)
            }catch{
                setProducts([])
            }
        }

        if(!user){
            navigate("/")
            return
        }

        initProducts()
    },[user])

    useEffect(() => {
        const filteredList=filterList(products,undefined,undefined,totalMin,totalMax)
        const sortedList=sortBy(filteredList,sortType)

        setFilteredProducts(sortedList)
    },[products,sortType,totalMin,totalMax])

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

    async function fetchAllPages(url,token){
        let page=0;
        let all=[];

        while(true){
            const res=await fetch(`${url}?page=${page}&size=50`,{
                method: "GET",
                headers: {"Authorization":`Bearer ${token}`}
            })

            if(!res.ok){
                throw new Error("Failed to load data")
            }

            const data=await res.json();
            all.push(...data.content);

            if(page>=data.totalPages-1)
                break;

            page++;
        }

        return all;
    }

    async function openProductPanel(editing,productId){
        setErrors([])
        setIsEditingProduct(editing)
        setIsPanelVisible(true)

        if(!editing){
            setNewProductName("")
            setNewProductPrice(0)
            setNewProductOptionGroups([])
            return
        }

        setSelectedProduct(productId)
        const editingProduct=products.find(p => p.id===productId)
        setNewProductName(editingProduct.name)
        setNewProductPrice(editingProduct.price)

        const groups=await fetchAllPages(`${api}product-option/group/${productId}`,user.token)

        const groupsWithValues=await Promise.all(
            groups.map(async g => {
                const values=await fetchAllPages(`${api}product-option/value/${g.id}`,user.token)

                return {
                    ...g,
                    values
                }
            })
        )

        const groupsWithTempIds=groupsWithValues.map(g => ({
            ...g,
            tempId: crypto.randomUUID(),
            values: (g.values ?? []).map(v => ({
                ...v,
                tempId: crypto.randomUUID()
            }))
        }))

        setNewProductOptionGroups(groupsWithTempIds)
    }

    function clearFilters(){
        setTotalMin("")
        setTotalMax("")
    }

    async function createNewProduct(){
        setErrors([])
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

        const productRes=await fetch(`${api}product`,{
            method: "POST",
            headers: {
                "Authorization":`Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: newProductName,
                price: Number(newProductPrice)
            })
        })

        if(!productRes.ok){
            throw new Error("Failed to create product")
        }

        const productId=await productRes.json()

        for(const group of newProductOptionGroups){
            const groupRes=await fetch(`${api}product-option/group`,{
                method: "POST",
                headers: {
                    "Authorization":`Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productId,
                    name: group.name,
                    type: group.type,
                    minSelect: group.minSelect,
                    maxSelect: group.maxSelect
                })
            })

            if(!groupRes.ok){
                throw new Error("Failed to create product option group")
            }

            const createdGroup=await groupRes.json()

            for(const value of group.values ?? []){
                await fetch(`${api}product-option/value`,{
                    method: "POST",
                    headers: {
                        "Authorization":`Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        optionGroupId: createdGroup.id,
                        name: value.name,
                        priceDelta: Number(value.priceDelta || 0)
                    })
                })
            }
        }

        toast.success(`Productas ${newProductName} sėkmingai sukurtas`)
        setIsPanelVisible(false)
        setProducts(await loadProducts(user.token))
    }

    function addDraftGroup(){
        setNewProductOptionGroups(prev => [
            ...prev,
            {
                tempId: crypto.randomUUID(),
                name: "",
                type: "SLIDER",
                minSelect: 0,
                maxSelect: 1,
                values: []
            }
        ])
    }

    function addDraftValue(groupTempId){
        setNewProductOptionGroups(prev => 
            prev.map(g => 
                g.tempId===groupTempId ? {
                    ...g,
                    values: [
                        ...g.values,
                        {
                            tempId: crypto.randomUUID(),
                            name: "",
                            priceDelta: 0
                        }
                    ]
                }:g
            )
        )
    }

    function markGroupDeleted(groupTempId){
        setNewProductOptionGroups(prev => prev.map(g => 
            g.tempId===groupTempId ? {...g,deleted:true}:g
        ))
    }

    function markValueDeleted(groupTempId,valueTempId){
        setNewProductOptionGroups(prev => 
            prev.map(g => {
                if(g.tempId!==groupTempId)
                    return g

                return {
                    ...g,
                    values: g.values.map(v => 
                        v.tempId===valueTempId ? {...v,deleted:true}:v
                    )
                }
            })
        )
    }

    async function saveProduct(){
        setErrors([])
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
        
        try{
            const response=await fetch(`${api}product/${selectedProduct}`,{
                method: "PUT",
                headers: {
                    "Authorization":`Bearer ${user.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newProductName,
                    price: Number(newProductPrice)
                })
            })
        
            if(!response.ok){
                throw new Error("Failed to update product")
            }

            const existingGroups=newProductOptionGroups.filter(g => g.id && !g.deleted)
            const newGroups=newProductOptionGroups.filter(g => !g.id && !g.deleted)
            const deletedGroups=newProductOptionGroups.filter(g => g.deleted && g.id)

            for(const group of newGroups){
                const res=await fetch(`${api}product-option/group`,{
                    method: "POST",
                    headers: {
                        "Authorization":`Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: selectedProduct,
                        name: group.name,
                        type: group.type,
                        minSelect: group.minSelect,
                        maxSelect: group.maxSelect
                    })
                })
            
                if(!res.ok){
                    throw new Error("Failed to create product option group")
                }
            
                const createdGroup=await res.json()
                
                for(const value of group.values.filter(v => !v.deleted)){
                    const resVal=await fetch(`${api}product-option/value`,{
                        method: "POST",
                        headers: {
                            "Authorization":`Bearer ${user.token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            optionGroupId: createdGroup.id,
                            name: value.name,
                            priceDelta: Number(value.priceDelta || 0)
                        })
                    })
                
                    if(!resVal.ok){
                        throw new Error("Failed to create product option value")
                    }
                }
            }

            for(const group of deletedGroups){
                await fetch(`${api}product-option/group/${group.id}`,{
                    method: "DELETE",
                    headers: {"Authorization":`Bearer ${user.token}`}
                })
            }

            for(const group of existingGroups){
                const newValues=group.values.filter(v => !v.deleted && !v.id)
                const deletedValues=group.values.filter(v => v.deleted && v.id)

                for(const value of newValues){
                    const resVal=await fetch(`${api}product-option/value`,{
                        method: "POST",
                        headers: {
                            "Authorization":`Bearer ${user.token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            optionGroupId: group.id,
                            name: value.name,
                            priceDelta: Number(value.priceDelta || 0)
                        })
                    })
                
                    if(!resVal.ok){
                        throw new Error("Failed to create product option value")
                    }
                }

                for(const value of deletedValues){
                    await fetch(`${api}product-option/value/${value.id}`,{
                        method: "DELETE",
                        headers: {"Authorization":`Bearer ${user.token}`}
                    })
                }
            }

            toast.success(`Produktas ${newProductName} sėkmingai atnaujintas`)

            setIsPanelVisible(false)
            try{
                const productList=await loadProducts(user.token)
                setProducts(productList)
            }catch{
                setProducts([])
            }
        }catch{
            toast.error("Klaida: nepavyko pakeist produkto")
        }
    }

    if(!user || !user.info || !business)
        return null

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
                        <p id="filter_title">Kaina:</p>
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
                        <label>Opcijos</label>
                        <div id="product_create_edit_option_list" className="col_align">
                            {Array.isArray(newProductOptionGroups) && newProductOptionGroups.filter(g => !g.deleted).map((group,gi) => (
                                <div key={group.tempId} id="product_create_edit_option_group" className="col_align">
                                    <button id="product_create_edit_option_delete" className="control_button" onClick={() => markGroupDeleted(group.tempId)}>Naikinti</button>
                                    <div id="product_create_edit_option_group_wrapper" className="row_align">
                                        <input className="product_create_edit_option_group_name product_create_edit_input_field" placeholder="Opcijos pavadinimas" value={group.name} onChange={e => {
                                            const value=e.target.value
                                            setNewProductOptionGroups(prev => 
                                                prev.map(g => 
                                                    g.tempId===group.tempId ? {...g,name:value}:g
                                                )
                                            )
                                        }}/>
                                        <select className="product_create_edit_option_group_type product_create_edit_select" value={group.type} onChange={e => {
                                            const type=e.target.value
                                            setNewProductOptionGroups(prev => 
                                                prev.map(g => 
                                                    g.tempId===group.tempId ? {
                                                        ...g,
                                                        type,
                                                        values: type==="SLIDER" ? []:g.values
                                                    }:g
                                                )
                                            )
                                        }}>
                                            <option value="SLIDER">Slider</option>
                                            <option value="SINGLE">Single</option>
                                            <option value="MULTI">Multi</option>
                                        </select>
                                    </div>
                                    {group.type==="SLIDER" && (
                                        <div id="product_create_edit_option_group_wrapper" className="row_align">
                                            <input className="product_create_edit_option_group_input product_create_edit_input_field" type="number" placeholder="Min" value={group.minSelect} onChange={e => {
                                                const minSelect=Number(e.target.value)
                                                setNewProductOptionGroups(prev => 
                                                    prev.map(g => 
                                                        g.tempId===group.tempId ? {...g,minSelect}:g
                                                    )
                                                )
                                            }}/>
                                            <input className="product_create_edit_option_group_input product_create_edit_input_field" type="number" placeholder="Max" value={group.maxSelect} onChange={e => {
                                                const maxSelect=Number(e.target.value)
                                                setNewProductOptionGroups(prev => 
                                                    prev.map(g => 
                                                        g.tempId===group.tempId ? {...g,maxSelect}:g
                                                    )
                                                )
                                            }}/>
                                        </div>
                                    )}
                                    {group.type!=="SLIDER" && (
                                        <div className="col_align">
                                            <hr/>
                                            {Array.isArray(group.values) && group.values.filter(v => !v.deleted).map((v,vi) => (
                                                <div key={v.tempId} className="row_align">
                                                    <input className="product_create_edit_option_value_name product_create_edit_input_field" placeholder="Pasirinkimas" value={v.name} onChange={e => {
                                                        const name=e.target.value
                                                        setNewProductOptionGroups(prev => 
                                                            prev.map(g => 
                                                                g.tempId===group.tempId ? {
                                                                    ...g,
                                                                    values: g.values.map(val => 
                                                                        val.tempId===v.tempId ? {...val,name}:val
                                                                    )
                                                                }:g
                                                            )
                                                        )
                                                    }}/>
                                                    <input type="number" className="product_create_edit_option_value_price product_create_edit_input_field" value={v.priceDelta} onChange={e => {
                                                        const priceDelta=e.target.value
                                                        setNewProductOptionGroups(prev => 
                                                            prev.map(g => 
                                                                g.tempId===group.tempId ? {
                                                                    ...g,
                                                                    values: g.values.map(val => 
                                                                        val.tempId===v.tempId ? {...val,priceDelta}:val
                                                                    )
                                                                }:g
                                                            )
                                                        )
                                                    }}/>
                                                    <p>€</p>
                                                    <button id="product_create_edit_option_value_delete" className="control_button" onClick={() => markValueDeleted(group.tempId,v.tempId)}>Naikinti</button>
                                                </div>
                                            ))}
                                            <button id="product_create_edit_option_value_create" className="control_button" onClick={() => addDraftValue(group.tempId)}>Pridėti pasirinkimą</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button id="product_create_edit_option_create" className="control_button" onClick={() => addDraftGroup()}>
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
                            <button id="product_create_edit_cancel_button" className="control_button" onClick={() => {
                                setIsPanelVisible(false)
                                setSelectedProduct(null)
                                setNewProductName("")
                                setNewProductPrice(0)
                                setNewProductOptionGroups([])
                            }}>Atšaukti</button>
                            {isEditingProduct ? (
                                <button id="product_create_edit_confirm_button" className="control_button" onClick={saveProduct}>Išsaugoti</button>
                            ):(
                                <button id="product_create_edit_confirm_button" className="control_button" onClick={createNewProduct}>Sukurti</button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}