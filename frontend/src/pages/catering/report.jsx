import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./orders.css"

import { getDb } from "../../utils/tempDB"

export const Report = ({ user, business }) => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    if (!business) {
      navigate('/')
      return
    }

    const db = getDb()

    // Collect all orderProducts for orders belonging to this business
    const businessOrders = db.orders.filter(o => o.businessId === business.id)
    const orderIds = businessOrders.map(o => o.id)

    // tempDB uses the `orderProducts` key (plural)
    const relevantOP = (db.orderProducts || []).filter(op => orderIds.includes(op.orderId))

    let t = 0
    const built = relevantOP.map(op => {
      const order = db.orders.find(o => o.id === op.orderId) || { createdAt: null, status: '' }
      const product = db.products.find(p => p.id === op.productId) || { name: 'Unknown', price: 0 }
      const subtotal = (product.price || 0) * (op.quantity || 0)
      t += subtotal

      return {
        orderId: op.orderId,
        productName: product.name,
        quantity: op.quantity,
        unitPrice: product.price,
        subtotal,
        orderDate: order.createdAt,
        status: order.status
      }
    })

    setRows(built)
    setTotal(t)
  }, [user, business])

  function handlePrint() {
    window.print()
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Detali ataskaita — {business?.name || ''}</h2>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className="control_button" onClick={handlePrint}>Spausdinti / Eksportuoti</button>
        <button className="control_button" onClick={() => navigate(-1)}>Atgal</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: 8 }}>Užsakymas</th>
            <th style={{ padding: 8 }}>Data / Laikas</th>
            <th style={{ padding: 8 }}>Prekė</th>
            <th style={{ padding: 8 }}>Kiekis</th>
            <th style={{ padding: 8 }}>Vieneto kaina</th>
            <th style={{ padding: 8 }}>Suma</th>
            <th style={{ padding: 8 }}>Būsena</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 12 }}>Nėra įrašų</td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{r.orderId}</td>
                <td style={{ padding: 8 }}>{r.orderDate ? new Date(r.orderDate).toLocaleString() : ''}</td>
                <td style={{ padding: 8 }}>{r.productName}</td>
                <td style={{ padding: 8 }}>{r.quantity}</td>
                <td style={{ padding: 8 }}>{(r.unitPrice || 0).toFixed(2)}€</td>
                <td style={{ padding: 8 }}>{(r.subtotal || 0).toFixed(2)}€</td>
                <td style={{ padding: 8 }}>{r.status}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>Viso:</td>
            <td style={{ padding: 8, fontWeight: 700 }}>{total.toFixed(2)}€</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default Report
