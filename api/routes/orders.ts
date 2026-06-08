import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const CITY_COORDS: Record<string, [number, number]> = {
  '北京': [39.90, 116.40], '上海': [31.23, 121.47], '广州': [23.13, 113.26],
  '深圳': [22.54, 114.06], '杭州': [30.27, 120.15], '武汉': [30.59, 114.31],
  '苏州': [31.30, 120.62], '成都': [30.57, 104.07], '南京': [32.06, 118.80],
  '重庆': [29.56, 106.55], '天津': [39.08, 117.20], '西安': [34.26, 108.94],
  '长沙': [28.23, 112.94], '郑州': [34.75, 113.65], '济南': [36.65, 116.98],
  '福州': [26.07, 119.30], '合肥': [31.82, 117.23], '昆明': [25.04, 102.68],
  '南昌': [28.68, 115.86], '南宁': [22.82, 108.37],
}

const CITY_PATTERNS: [string, RegExp][] = [
  ['北京', /北京/], ['上海', /上海/], ['广州', /广州/], ['深圳', /深圳/],
  ['杭州', /杭州/], ['武汉', /武汉/], ['苏州', /苏州/], ['成都', /成都/],
  ['南京', /南京/], ['重庆', /重庆/], ['天津', /天津/], ['西安', /西安/],
  ['长沙', /长沙/], ['郑州', /郑州/], ['济南', /济南/], ['福州', /福州/],
  ['合肥', /合肥/], ['昆明', /昆明/], ['南昌', /南昌/], ['南宁', /南宁/],
]

function extractCityFromAddress(address: string): string | null {
  for (const [city, pattern] of CITY_PATTERNS) {
    if (pattern.test(address)) return city
  }
  return null
}

function getWarehousesByDistance(city: string) {
  const coords = CITY_COORDS[city]
  if (!coords) return []
  const [cLat, cLng] = coords
  const warehouses = query('SELECT * FROM warehouses')
  return warehouses
    .map((w: any) => ({
      ...w,
      distance: Math.sqrt((cLat - w.lat) ** 2 + (cLng - w.lng) ** 2),
    }))
    .sort((a: any, b: any) => a.distance - b.distance)
}

function getTotalWarehouseStock(productId: number): number {
  const result = query('SELECT COALESCE(SUM(stock), 0) as total FROM warehouse_inventory WHERE product_id = ?', [productId])
  return result[0].total
}

function checkSingleWarehouseStock(warehouseId: number, productIds: number[], quantities: number[]): { canFulfill: boolean; details: { productId: number; needed: number; available: number }[] } {
  const details = productIds.map((pid, i) => {
    const inv = query('SELECT stock FROM warehouse_inventory WHERE warehouse_id = ? AND product_id = ?', [warehouseId, pid])
    const available = inv.length > 0 ? inv[0].stock : 0
    return { productId: pid, needed: quantities[i], available }
  })
  return { canFulfill: details.every(d => d.available >= d.needed), details }
}

function allocateWarehouse(city: string, productIds: number[], quantities: number[]): { warehouseId: number; warehouseName: string; city: string } | null {
  const sorted = getWarehousesByDistance(city)
  for (const wh of sorted) {
    const check = checkSingleWarehouseStock(wh.id, productIds, quantities)
    if (check.canFulfill) {
      return { warehouseId: wh.id, warehouseName: wh.name, city: wh.city }
    }
    for (const d of check.details) {
      if (d.available < d.needed) {
        run('INSERT INTO stockout_logs (warehouse_id, product_id, requested, available) VALUES (?, ?, ?, ?)', [wh.id, d.productId, d.needed, d.available])
      }
    }
  }
  return null
}

function deductWarehouseStock(warehouseId: number, productIds: number[], quantities: number[]) {
  for (let i = 0; i < productIds.length; i++) {
    const existing = query('SELECT stock FROM warehouse_inventory WHERE warehouse_id = ? AND product_id = ?', [warehouseId, productIds[i]])
    if (existing.length > 0) {
      run('UPDATE warehouse_inventory SET stock = stock - ? WHERE warehouse_id = ? AND product_id = ?', [quantities[i], warehouseId, productIds[i]])
    }
  }
}

function rollbackWarehouseStock(warehouseId: number, productIds: number[], quantities: number[]) {
  for (let i = 0; i < productIds.length; i++) {
    const existing = query('SELECT stock FROM warehouse_inventory WHERE warehouse_id = ? AND product_id = ?', [warehouseId, productIds[i]])
    if (existing.length > 0) {
      run('UPDATE warehouse_inventory SET stock = stock + ? WHERE warehouse_id = ? AND product_id = ?', [quantities[i], warehouseId, productIds[i]])
    } else {
      run('INSERT INTO warehouse_inventory (warehouse_id, product_id, stock) VALUES (?, ?, ?)', [warehouseId, productIds[i], quantities[i]])
    }
  }
}

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { address, city, payment_method, items } = req.body
    if (!address || !items || !items.length) {
      res.status(400).json({ success: false, error: '地址和商品不能为空' })
      return
    }
    let resolvedCity = city
    if (!resolvedCity) {
      resolvedCity = extractCityFromAddress(address)
    }
    if (!resolvedCity) {
      res.status(400).json({ success: false, error: '无法识别收货城市，请填写城市信息' })
      return
    }

    const mergedMap = new Map<number, { quantity: number; price: number; spec: string | null; product_name: string }>()
    for (const item of items) {
      const products = query('SELECT * FROM products WHERE id = ?', [item.product_id])
      if (products.length === 0) continue
      const product = products[0]
      const existing = mergedMap.get(item.product_id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        mergedMap.set(item.product_id, {
          quantity: item.quantity,
          price: product.price,
          spec: item.spec || null,
          product_name: product.name,
        })
      }
    }

    if (mergedMap.size === 0) {
      res.status(400).json({ success: false, error: '无有效商品' })
      return
    }

    const productIds = Array.from(mergedMap.keys())
    const quantities = Array.from(mergedMap.values()).map(v => v.quantity)
    let total = 0
    const orderItems: any[] = []
    for (const [pid, info] of mergedMap) {
      total += info.price * info.quantity
      orderItems.push({ product_id: pid, quantity: info.quantity, price: info.price, spec: info.spec, product_name: info.product_name })
    }

    const outOfStockItems: string[] = []
    for (let i = 0; i < productIds.length; i++) {
      const totalStock = getTotalWarehouseStock(productIds[i])
      if (totalStock < quantities[i]) {
        outOfStockItems.push(`${orderItems[i].product_name}（需${quantities[i]}件，全仓仅${totalStock}件）`)
      }
    }
    if (outOfStockItems.length > 0) {
      res.status(400).json({ success: false, error: `库存不足：${outOfStockItems.join('；')}` })
      return
    }

    const allocation = allocateWarehouse(resolvedCity, productIds, quantities)
    if (!allocation) {
      res.status(400).json({ success: false, error: '所有仓库均无足够库存，无法完成下单' })
      return
    }

    const warehouseName = allocation.warehouseName
    const warehouseId = allocation.warehouseId

    deductWarehouseStock(warehouseId, productIds, quantities)
    for (const oi of orderItems) {
      run('UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ?', [oi.quantity, oi.quantity, oi.product_id])
    }

    run('INSERT INTO orders (user_id, total_amount, status, address, city, warehouse, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user!.id, total, 'pending', address, resolvedCity, warehouseName, payment_method || 'wechat'])
    const orderResult = query('SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user!.id])
    const orderId = orderResult[0].id

    for (const oi of orderItems) {
      run('INSERT INTO order_items (order_id, product_id, quantity, price, spec) VALUES (?, ?, ?, ?, ?)', [orderId, oi.product_id, oi.quantity, oi.price, oi.spec])
    }

    run('INSERT INTO logistics_records (order_id, status, description, location) VALUES (?, ?, ?, ?)', [orderId, 'created', `订单已创建，由${warehouseName}发货`, warehouseName])

    for (const item of items) {
      run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user!.id, item.product_id])
    }

    const order = query('SELECT * FROM orders WHERE id = ?', [orderId])
    const fullOrder: any = order[0]
    fullOrder.items = query('SELECT oi.*, p.name as product_name, p.image as product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [orderId])
    fullOrder.logistics = query('SELECT * FROM logistics_records WHERE order_id = ? ORDER BY created_at DESC', [orderId])
    res.json({ success: true, data: fullOrder })
  } catch (e: any) {
    console.error('Order error:', e)
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', pageSize = '10' } = req.query
    let sql = 'SELECT * FROM orders WHERE user_id = ?'
    const params: any[] = [req.user!.id]
    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }
    const countResult = query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params)
    const total = countResult[0].total
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize))
    const orders = query(sql, params)
    for (const order of orders) {
      order.items = query('SELECT oi.*, p.name as product_name, p.image as product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [order.id])
    }
    res.json({ success: true, data: { list: orders, total, page: Number(page), pageSize: Number(pageSize) } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const orders = query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: '订单不存在' })
      return
    }
    const order = orders[0]
    order.items = query('SELECT oi.*, p.name as product_name, p.image as product_image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [id])
    order.logistics = query('SELECT * FROM logistics_records WHERE order_id = ? ORDER BY created_at DESC', [id])
    order.afterSales = query('SELECT as2.*, p.name as product_name FROM after_sales as2 JOIN products p ON as2.product_id = p.id WHERE as2.order_id = ?', [id])
    res.json({ success: true, data: order })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/logistics', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const orders = query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: '订单不存在' })
      return
    }
    const logistics = query('SELECT * FROM logistics_records WHERE order_id = ? ORDER BY created_at DESC', [id])
    res.json({ success: true, data: logistics })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/:id/after-sale', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { type, reason, product_id, quantity } = req.body
    if (!type || !product_id || !quantity) {
      res.status(400).json({ success: false, error: '请填写完整的售后信息' })
      return
    }
    if (!['refund', 'return_refund', 'exchange'].includes(type)) {
      res.status(400).json({ success: false, error: '无效的售后类型' })
      return
    }
    const orders = query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: '订单不存在' })
      return
    }
    const order = orders[0]
    if (!['shipped', 'delivered'].includes(order.status)) {
      res.status(400).json({ success: false, error: '仅已发货或已签收订单可申请售后' })
      return
    }
    const existing = query('SELECT * FROM after_sales WHERE order_id = ? AND product_id = ? AND status = ?', [id, product_id, 'pending'])
    if (existing.length > 0) {
      res.status(400).json({ success: false, error: '该商品已有待处理的售后申请' })
      return
    }
    const orderItem = query('SELECT * FROM order_items WHERE order_id = ? AND product_id = ?', [id, product_id])
    if (orderItem.length === 0) {
      res.status(400).json({ success: false, error: '该商品不在本订单中' })
      return
    }
    if (quantity > orderItem[0].quantity) {
      res.status(400).json({ success: false, error: '售后数量不能超过购买数量' })
      return
    }
    const refund_amount = type === 'exchange' ? 0 : orderItem[0].price * quantity
    run('INSERT INTO after_sales (order_id, user_id, type, reason, product_id, quantity, refund_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, req.user!.id, type, reason || '', product_id, quantity, refund_amount, 'pending'])
    const asResult = query('SELECT * FROM after_sales WHERE order_id = ? ORDER BY id DESC LIMIT 1', [id])
    res.json({ success: true, data: asResult[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.put('/:id/cancel', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const orders = query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: '订单不存在' })
      return
    }
    const order = orders[0]
    if (order.status === 'cancelled') {
      res.status(400).json({ success: false, error: '订单已取消' })
      return
    }
    if (order.status === 'delivered') {
      res.status(400).json({ success: false, error: '已签收订单不可取消' })
      return
    }
    if (order.status === 'delivery_failed') {
      res.status(400).json({ success: false, error: '发货失败订单请通过发货失败回滚处理' })
      return
    }
    run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [id])

    const orderItems = query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id])
    for (const oi of orderItems) {
      run('UPDATE products SET stock = stock + ?, sales = sales - ? WHERE id = ?', [oi.quantity, oi.quantity, oi.product_id])
    }

    const warehouses = query("SELECT id FROM warehouses WHERE name = ?", [order.warehouse])
    if (warehouses.length > 0) {
      const pids = orderItems.map((oi: any) => oi.product_id)
      const qts = orderItems.map((oi: any) => oi.quantity)
      rollbackWarehouseStock(warehouses[0].id, pids, qts)
    }

    run('INSERT INTO logistics_records (order_id, status, description, location) VALUES (?, ?, ?, ?)', [id, 'cancelled', '订单已取消，库存已回滚', order.warehouse || '系统'])
    res.json({ success: true, data: { id: Number(id), status: 'cancelled' } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.put('/:id/delivery-failed', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const orders = query('SELECT * FROM orders WHERE id = ?', [id])
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: '订单不存在' })
      return
    }
    const order = orders[0]
    if (order.status !== 'shipped' && order.status !== 'pending' && order.status !== 'paid') {
      res.status(400).json({ success: false, error: `当前状态${order.status}不可标记发货失败，仅pending/paid/shipped可操作` })
      return
    }
    if (order.status === 'delivery_failed') {
      res.status(400).json({ success: false, error: '订单已标记发货失败，请勿重复操作' })
      return
    }

    run("UPDATE orders SET status = 'delivery_failed' WHERE id = ?", [id])

    const orderItems = query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id])
    for (const oi of orderItems) {
      run('UPDATE products SET stock = stock + ?, sales = sales - ? WHERE id = ?', [oi.quantity, oi.quantity, oi.product_id])
    }

    const warehouses = query("SELECT id FROM warehouses WHERE name = ?", [order.warehouse])
    if (warehouses.length > 0) {
      const pids = orderItems.map((oi: any) => oi.product_id)
      const qts = orderItems.map((oi: any) => oi.quantity)
      rollbackWarehouseStock(warehouses[0].id, pids, qts)
    }

    run('INSERT INTO logistics_records (order_id, status, description, location) VALUES (?, ?, ?, ?)', [id, 'delivery_failed', `发货失败，库存已回滚至${order.warehouse || '系统'}`, order.warehouse || '系统'])
    res.json({ success: true, data: { id: Number(id), status: 'delivery_failed' } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
