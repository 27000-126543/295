import { Router, type Response } from 'express'
import { query } from '../db.js'

const router = Router()

const CITY_COORDS: Record<string, [number, number]> = {
  '北京': [39.90, 116.40], '上海': [31.23, 121.47], '广州': [23.13, 113.26],
  '深圳': [22.54, 114.06], '杭州': [30.27, 120.15], '武汉': [30.59, 114.31],
  '苏州': [31.30, 120.62], '成都': [30.57, 104.07], '南京': [32.06, 118.80],
  '重庆': [29.56, 106.55],
}

router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { category, age_min, age_max, keyword, page = '1', pageSize = '10' } = req.query
    let sql = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []
    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }
    if (age_min !== undefined) {
      sql += ' AND age_max >= ?'
      params.push(Number(age_min))
    }
    if (age_max !== undefined) {
      sql += ' AND age_min <= ?'
      params.push(Number(age_max))
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    const countResult = query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params)
    const total = countResult[0].total
    const offset = (Number(page) - 1) * Number(pageSize)
    sql += ' ORDER BY sales DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), offset)
    const products = query(sql, params)
    res.json({ success: true, data: { list: products, total, page: Number(page), pageSize: Number(pageSize) } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/categories', async (_req, res: Response): Promise<void> => {
  try {
    const categories = query('SELECT DISTINCT category FROM products ORDER BY category')
    res.json({ success: true, data: categories.map((c: any) => c.category) })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const products = query('SELECT * FROM products WHERE id = ?', [id])
    if (products.length === 0) {
      res.status(404).json({ success: false, error: '商品不存在' })
      return
    }
    const product = products[0]
    const warehouseStock = query(
      'SELECT wi.stock, w.name as warehouse_name, w.city as warehouse_city FROM warehouse_inventory wi JOIN warehouses w ON wi.warehouse_id = w.id WHERE wi.product_id = ? AND wi.stock > 0 ORDER BY wi.stock DESC',
      [id]
    )
    const totalWarehouseStock = warehouseStock.reduce((sum: number, ws: any) => sum + ws.stock, 0)
    const city = req.query.city as string | undefined
    let expectedWarehouse = null
    if (city && CITY_COORDS[city]) {
      const [cLat, cLng] = CITY_COORDS[city]
      let minDist = Infinity
      for (const ws of warehouseStock) {
        const whData = query('SELECT lat, lng FROM warehouses WHERE name = ?', [ws.warehouse_name])
        if (whData.length > 0) {
          const dist = Math.sqrt((cLat - whData[0].lat) ** 2 + (cLng - whData[0].lng) ** 2)
          if (dist < minDist && ws.stock > 0) {
            minDist = dist
            expectedWarehouse = { name: ws.warehouse_name, city: ws.warehouse_city, stock: ws.stock }
          }
        }
      }
    }
    res.json({
      success: true,
      data: {
        ...product,
        warehouseStock,
        totalWarehouseStock,
        expectedWarehouse,
      }
    })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
