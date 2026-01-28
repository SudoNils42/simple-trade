const KEY = 'tradesimple'
const NOTIF_KEY = 'tradesimple_notif'

const initial = {
  balance: 10000,
  positions: [],
  history: [],
  createdAt: Date.now()
}

export function load() {
  try {
    const data = localStorage.getItem(KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (!parsed.createdAt) {
        parsed.createdAt = Date.now()
      }
      return parsed
    }
    return { ...initial, createdAt: Date.now() }
  } catch {
    return { ...initial, createdAt: Date.now() }
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function reset() {
  const data = { ...initial, createdAt: Date.now() }
  save(data)
  clearUnseen()
  return data
}

export function setBalance(amount) {
  const data = load()
  data.balance = amount
  save(data)
  return data
}

export function buy(symbol, name, qty, price) {
  const data = load()
  const cost = qty * price
  
  if (cost > data.balance) return null
  
  data.balance -= cost
  
  const idx = data.positions.findIndex(p => p.symbol === symbol)
  if (idx >= 0) {
    const pos = data.positions[idx]
    const newQty = pos.qty + qty
    const newAvg = (pos.qty * pos.avg + cost) / newQty
    pos.qty = newQty
    pos.avg = newAvg
  } else {
    data.positions.push({ symbol, name, qty, avg: price })
  }
  
  data.history.unshift({
    type: 'buy',
    symbol,
    name,
    qty,
    price,
    date: Date.now()
  })
  
  save(data)
  incrementUnseen()
  return data
}

export function sell(symbol, qty, price) {
  const data = load()
  const idx = data.positions.findIndex(p => p.symbol === symbol)
  
  if (idx < 0) return null
  
  const pos = data.positions[idx]
  if (qty > pos.qty) qty = pos.qty
  
  data.balance += qty * price
  pos.qty -= qty
  
  if (pos.qty <= 0) {
    data.positions.splice(idx, 1)
  }
  
  data.history.unshift({
    type: 'sell',
    symbol,
    name: pos.name,
    qty,
    price,
    date: Date.now()
  })
  
  save(data)
  return data
}

export function getUnseenCount() {
  try {
    const count = localStorage.getItem(NOTIF_KEY)
    return count ? parseInt(count, 10) : 0
  } catch {
    return 0
  }
}

export function incrementUnseen() {
  const current = getUnseenCount()
  localStorage.setItem(NOTIF_KEY, String(current + 1))
}

export function clearUnseen() {
  localStorage.setItem(NOTIF_KEY, '0')
}
