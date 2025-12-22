import {useEffect,useState} from "react"
import "./pageControls.css"

export const PageControls=({page,totalPages,onPageChange}) => {
    const [inputValue,setInputValue]=useState(page)

    useEffect(() => {
        setInputValue(page)
    },[page])

    function goToPage(p){
        if(p<1)
            p=1
        if(p>totalPages)
            p=totalPages

        onPageChange(p)
    }

    function handleInput(e){
        let val=e.target.value
        setInputValue(val)

        if(val==="")
            return

        const num=parseInt(val)
        if(!isNaN(num))
            goToPage(num)
    }

    return(
        <div id="page_controls" className="row_align">
            <button className="page_button" disabled={page<=1} onClick={() => goToPage(page-1)}>‹</button>
            <input className="page_input" value={inputValue} onChange={handleInput}/>
            <span className="page_divider">/</span>
            <span className="page_total">{totalPages}</span>
            <button className="page_button" disabled={page>=totalPages} onClick={() => goToPage(page+1)}>›</button>
        </div>
    )
}