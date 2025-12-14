import {getDb} from "./tempDB"


export function calcProductPrice(product,productOptions,selectedOptions,quantity){
    const db=getDb()
    
    let price=product.price
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