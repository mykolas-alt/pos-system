export function filterSearchList(itemList,searchInput){
    const list=[...itemList]
    
    return list.filter(l => {
        if(l.name){
            const matchesSearch=l.name.toLowerCase().includes(searchInput.toLowerCase())

            if(!matchesSearch)
                return false
        }else if(l.customerName){
            const matchesSearch=l.customerName.toLowerCase().includes(searchInput.toLowerCase())

            if(!matchesSearch)
                return false
        }

        return true
    })
}

export function filterCategoryList(itemList,selectedCategories){
    const list=[...itemList]
    
    return list.filter(l => {
        const matchesCategory=selectedCategories.length===0 || selectedCategories.includes(l.categoryId)

        return matchesCategory
    })
}

export function filterStatusList(itemList,selectedStates){
    const list=[...itemList]
    
    return list.filter(l => {
        const matchesStates=selectedStates.length===0 || selectedStates.includes(l.status)

        return matchesStates
    })
}

export function filterList(itemList,dateFrom,dateTo,totalMin,totalMax){
    const list=[...itemList]

    const filteredList=list.filter(l => {
        const created=new Date(l.createdAt).getTime()
        if(dateFrom){
            const from=new Date(dateFrom).getTime()
            if(created<from)
                return false
        }

        if(dateTo){
            const to=new Date(dateTo).getTime()
            if(created>to)
                return false
        }

        const total=Number(l.total) || Number(l.price)
        if(totalMin!=="" && total<Number(totalMin))
            return false
        if(totalMax!=="" && total>Number(totalMax))
            return false

        return true
    })
    
    return filteredList
}

export function sortBy(itemList,sortType){
    const list=[...itemList]

    switch(sortType){
        case "id_increase":
            return list.sort((a,b) => a.id-b.id)
        case "id_decrease":
            return list.sort((a,b) => b.id-a.id)
        case "name_increase":
            return list.sort((a,b) => {
                const aName=a.name ?? a.customerName ?? ""
                const bName=b.name ?? b.customerName ?? ""
                return aName.localeCompare(bName,"lt",{sensitivity: "base"})
            })
        case "name_decrease":
            return list.sort((a,b) => {
                const aName=a.name ?? a.customerName ?? ""
                const bName=b.name ?? b.customerName ?? ""
                return bName.localeCompare(aName,"lt",{sensitivity: "base"})
            })
        case "date_increase":
            return list.sort((a,b) => {
                return new Date(b.createdAt)-new Date(a.createdAt)
            })
        case "date_decrease":
            return list.sort((a,b) => {
                return new Date(a.createdAt)-new Date(b.createdAt)
            })
        case "total_increase":
            return list.sort((a,b) => {
                const aVal=a.total ?? a.price ?? 0
                const bVal=b.total ?? b.price ?? 0
                return aVal-bVal
            })
        case "total_decrease":
            return list.sort((a,b) => {
                const aVal=a.total ?? a.price ?? 0
                const bVal=b.total ?? b.price ?? 0
                return bVal-aVal
            })
        default:
            return list
    }
}