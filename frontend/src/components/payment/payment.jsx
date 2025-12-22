import {useEffect,useState} from "react"
import "./payment.css"
import toast from "react-hot-toast"

export const Payment=({api,token,type,id,closePaymentWindow,onPaymentSuccess}) => {
    const [paymentType,setPaymentType]=useState("CASH")
    const [amount,setAmount]=useState(0)
    const [tip,setTip]=useState(0)
    const [serviceCharge,setServiceCharge]=useState(0)
    const [stripeToken,setStripeToken]=useState("")
    const [giftCardCode,setGiftCardCode]=useState("")
    const [isProcessingPayment,setIsProcessingPayment]=useState(false)

    async function processPayment(){
        if(!amount || amount<=0){
            toast.error("Įveskite sumą")
            return
        }

        const payload={
            id,
            type,
            paymentType,
            amount: Number(amount),
            tip: tip ? Number(tip):null,
            serviceCharge: serviceCharge ? Number(serviceCharge):null
        }
        
        if(paymentType==="CARD"){
            if(!stripeToken){
                toast.error("Įveskite kortelės žetoną")
                return
            }
            payload.stripeToken=stripeToken
        }

        if(paymentType==="GIFT_CARD"){
            if(!giftCardCode){
                toast.error("Įveskite dovanų kortelės kodą")
                return
            }
            payload.giftCardCode=giftCardCode
        }

        try{
            setIsProcessingPayment(true)

            const response=await fetch(`${api}payment`,{
                method: "POST",
                headers: {
                    "Authorization":`Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if(!response.ok){
                const msg=await response.text()
                throw new Error(msg || "Failed to process payment")
            }

            toast.success("Mokėjimas sėkmingai apdorotas")
            closePaymentWindow(false)
            onPaymentSuccess?.()
        }catch(e){
            console.error(e)
            toast.error("Klaida apdorojant mokėjimą")
        }finally{
            setIsProcessingPayment(false)
        }
    }

    return(
        <>
            <div id="transparent_panel" onClick={() => closePaymentWindow(false)}/>
            <div id="payment_panel" className="col_align">
                <button className="close_button" onClick={() => closePaymentWindow(false)}>X</button>
                <p id="payment_title">Apmokėjimas</p>
                <hr/>
                <div id="payment_card" className="col_align">
                    <div id="payment_card_wrapper" className="row_align">
                        <select className="payment_type_selector" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                            <option value="CASH">Grynais</option>
                            <option value="CARD">Kortele</option>
                            <option value="GIFT_CARD">Dovanų kortele</option>
                        </select>
                        <label>Kaina</label>
                        <input type="number" className="payment_input_field" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                    </div>
                    <div className="row_align">
                        <div className="col_align">
                            <label>Arbatpinigiai</label>
                            <input type="number" className="payment_input_field" value={tip} onChange={(e) => setTip(e.target.value)}/>
                        </div>
                        <div className="col_align">
                            <label>Aptarnavimo mokestis</label>
                            <input type="number" className="payment_input_field" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)}/>
                        </div>
                    </div>
                    {paymentType==="CARD" && (
                        <input type="text" className="payment_input_field" placeholder="Kortelės žetonas" value={stripeToken} onChange={(e) => setStripeToken(e.target.value)}/>
                    )}
                    {paymentType==="GIFT_CARD" && (
                        <input type="text" className="payment_input_field" placeholder="Dovanų kortelės kodas" value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value)}/>
                    )}
                </div>
                <div id="payment_panel_controls" className="row_align">
                    <button id="payment_button" className="control_button" onClick={processPayment}>Apmokėti</button>
                </div>
            </div>
        </>
    )
}