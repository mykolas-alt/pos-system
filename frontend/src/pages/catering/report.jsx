import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./orders.css"
import "./report.css"

import { getDb } from "../../utils/tempDB"

export const Report = ({ user, business }) => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [displayRows, setDisplayRows] = useState([])
  const [total, setTotal] = useState(0)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [productQuery, setProductQuery] = useState("")
  const [orderIdQuery, setOrderIdQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("date")
  const [sortDir, setSortDir] = useState("desc")

  const updateTotal = (list) => {
    const sum = list.reduce((acc, r) => acc + (r.subtotal || 0), 0)
    setTotal(sum)
  }

  const sortList = (list) => {
    const dir = sortDir === "desc" ? -1 : 1
    return [...list].sort((a, b) => {
      let aVal = 0
      let bVal = 0

      if (sortBy === "date") {
        aVal = a.orderDate ? new Date(a.orderDate).getTime() : 0
        bVal = b.orderDate ? new Date(b.orderDate).getTime() : 0
      } else if (sortBy === "total") {
        aVal = a.subtotal || 0
        bVal = b.subtotal || 0
      } else if (sortBy === "order") {
        aVal = a.orderId || 0
        bVal = b.orderId || 0
      }

      if (aVal < bVal) return -1 * dir
      if (aVal > bVal) return 1 * dir
      return 0
    })
  }

  useEffect(() => {
    setDisplayRows(prev => {
      const sorted = sortList(prev)
      updateTotal(sorted)
      return sorted
    })
  }, [sortBy, sortDir])

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

    
    const businessOrders = db.orders.filter(o => o.businessId === business.id)
    const orderIds = businessOrders.map(o => o.id)
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

    const sorted = sortList(built)

    setRows(built)
    setDisplayRows(sorted)
    setTotal(t)
  }, [user, business])

  function handlePrint() {
    window.print()
  }

  function handleApplyFilters() {
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null
    const toTs = dateTo ? new Date(dateTo).getTime() : null
    const min = minPrice !== "" ? parseFloat(minPrice) : null
    const max = maxPrice !== "" ? parseFloat(maxPrice) : null
    const nameQ = productQuery.trim().toLowerCase()
    const idQ = orderIdQuery.trim()

    // datos filtravimas
    const filtered = rows.filter(r => {
      if ((fromTs !== null || toTs !== null)) {
        if (!r.orderDate) return false
        const ts = new Date(r.orderDate).getTime()
        if (Number.isNaN(ts)) return false
        if (fromTs !== null && ts < fromTs) return false
        if (toTs !== null && ts > toTs) return false
      }

      // Sumos
      const price = r.subtotal || 0
      if (min !== null && price < min) return false
      if (max !== null && price > max) return false

      //Id 
      if (nameQ && !(r.productName || "").toLowerCase().includes(nameQ)) return false
      if (idQ && !String(r.orderId || "").includes(idQ)) return false

      return true
    })

    const sorted = sortList(filtered)
    setDisplayRows(sorted)
    updateTotal(sorted)
  }

  function handleResetFilters() {
    const sorted = sortList(rows)
    setDisplayRows(sorted)
    updateTotal(sorted)
    setDateFrom("")
    setDateTo("")
    setMinPrice("")
    setMaxPrice("")
    setProductQuery("")
    setOrderIdQuery("")
  }

  if(!user || !user.info || !business)
    return null

  return (
    <div className="report-container">
      <h2 className="report-title">Detali ataskaita — {business?.name || ''}</h2>

      <div className="report-controls">
        <div className="filter-actions">
          <button className="control_button" onClick={() => setShowFilters(v => !v)}>
            {showFilters ? "Slėpti filtrus" : "Filtruoti"}
          </button>
          {showFilters && (
            <button className="control_button" onClick={handleResetFilters}>Išvalyti filtrus</button>
          )}
          <button className="control_button" onClick={handlePrint}>Spausdinti / Eksportuoti</button>
          <button className="control_button" onClick={() => navigate(-1)}>Atgal</button>
        </div>

        {showFilters && (
          <>
            <div className="filter-group">
              <div className="filter-field">
                <label htmlFor="dateFrom">Data nuo</label>
                <input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="dateTo">Data iki</label>
                <input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-field">
                <label htmlFor="minPrice">Suma nuo (€)</label>
                <input
                  id="minPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="maxPrice">Suma iki (€)</label>
                <input
                  id="maxPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-field">
                <label htmlFor="productQuery">Prekės pavadinimas</label>
                <input
                  id="productQuery"
                  type="text"
                  placeholder="pvz. Latte"
                  value={productQuery}
                  onChange={e => setProductQuery(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="orderIdQuery">Užsakymo ID</label>
                <input
                  id="orderIdQuery"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="pvz. 12"
                  value={orderIdQuery}
                  onChange={e => setOrderIdQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <button className="control_button" onClick={handleApplyFilters}>Taikyti filtrus</button>
            </div>

            <div className="filter-group">
              <div className="filter-field">
                <label htmlFor="sortBy">Rikiuoti pagal</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="date">Data</option>
                  <option value="total">Suma</option>
                  <option value="order">Užsakymo ID</option>
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="sortDir">Tvarka</label>
                <select
                  id="sortDir"
                  value={sortDir}
                  onChange={e => setSortDir(e.target.value)}
                >
                  <option value="asc">Didėjanti</option>
                  <option value="desc">Mažėjanti</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <table className="report-table">
        <thead>
          <tr className="report-head-row">
            <th>Užsakymas</th>
            <th>Data / Laikas</th>
            <th>Prekė</th>
            <th>Kiekis</th>
            <th>Vieneto kaina</th>
            <th>Suma</th>
            <th>Būsena</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.length === 0 ? (
            <tr>
              <td colSpan={7} className="report-empty">Nėra įrašų</td>
            </tr>
          ) : (
            displayRows.map((r, i) => (
              <tr key={i} className="report-row">
                <td>{r.orderId}</td>
                <td>{r.orderDate ? new Date(r.orderDate).toLocaleString() : ''}</td>
                <td>{r.productName}</td>
                <td>{r.quantity}</td>
                <td>{(r.unitPrice || 0).toFixed(2)}€</td>
                <td>{(r.subtotal || 0).toFixed(2)}€</td>
                <td>{r.status}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="report-total-row">
            <td colSpan={5}>Viso:</td>
            <td>{total.toFixed(2)}€</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default Report
