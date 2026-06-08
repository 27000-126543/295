import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { address, city, payment_method, items } = req.body
    if (!address || !items || !items.length) {
      res.status(400).json({ success: false, error: '地址和商品不能为空' })
      return
    }
    let total = 0
    const orderItems: any[] = []
    for (const item of items) {
      const products = query('SELECT * FROM products WHERE id = ?', [item.product_id])
      if (products.length === 0) continue
      const product = products[0]
      const price = product.price
      total += price * item.quantity
      orderItems.push({ product_id: item.product_id, quantity: item.quantity, price, spec: item.spec || null })
    }
    const cityCoords: Record<string, [number, number]> = {
      '北京': [39.90, 116.40], '上海': [31.23, 121.47], '广州': [23.13, 113.26],
      '深圳': [22.54, 114.06], '杭州': [30.27, 120.15], '武汉': [30.59, 114.31],
      '苏州': [31.30, 120.62], '成都': [30.57, 104.07], '南京': [32.06, 118.80],
      '重庆': [29.56, 106.55],
    }
    let warehouseName: string | null = null
    if (city && cityCoords[city]) {
      const [cLat, cLng] = cityCoords[city]
      const warehouses = query('SELECT * FROM warehouses')
      let minDist = Infinity
      for (const w of warehouses) {
        const dist = Math.sqrt((cLat - w.lat) ** 2 + (cLng - w.lng) ** 2)
        if (dist < minDist) {
          minDist = dist
          warehouseName = w.name
        }
      }
    }
    if (!warehouseName) {
      const firstProduct = query('SELECT * FROM products WHERE id = ?', [items[0].product_id])
      warehouseName = firstProduct.length > 0 ? firstProduct[0].warehouse_city + '仓' : null
    }
    run('INSERT INTO orders (user_id, total_amount, status, address, city, warehouse, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user!.id, total, 'pending', address, city || null, warehouseName, payment_method || 'wechat'])
    const orderResult = query('SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user!.id])
    const orderId = orderResult[0].id
    for (const oi of orderItems) {
      run('INSERT INTO order_items (order_id, product_id, quantity, price, spec) VALUES (?, ?, ?, ?, ?)', [orderId, oi.product_id, oi.quantity, oi.price, oi.spec])
      run('UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ?', [oi.quantity, oi.quantity, oi.product_id])
    }
    run('INSERT INTO logistics_records (order_id, status, description, location) VALUES (?, ?, ?, ?)', [orderId, 'created', `订单已创建，由${warehouseName}发货`, warehouseName || '仓库'])
    for (const item of items) {
      run('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user!.id, item.product_id])
    }
    const order = query('SELECT * FROM orders WHERE id = ?', [orderId])
    res.json({ success: true, data: order[0] })
  } catch (e: any) {
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

export default router
