import { Router, type Response } from 'express'
import { query } from '../db.js'

const router = Router()

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
    res.json({ success: true, data: products[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
