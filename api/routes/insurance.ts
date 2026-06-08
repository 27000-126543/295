import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/products', async (req, res: Response): Promise<void> => {
  try {
    const { type } = req.query
    let sql = 'SELECT * FROM insurance_products WHERE 1=1'
    const params: any[] = []
    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }
    const products = query(sql, params)
    res.json({ success: true, data: products })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/products/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const products = query('SELECT * FROM insurance_products WHERE id = ?', [id])
    if (products.length === 0) {
      res.status(404).json({ success: false, error: '保险产品不存在' })
      return
    }
    res.json({ success: true, data: products[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/purchase', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id, insured_name, insured_id } = req.body
    if (!product_id || !insured_name || !insured_id) {
      res.status(400).json({ success: false, error: '产品ID、被保人姓名和证件号不能为空' })
      return
    }
    const products = query('SELECT * FROM insurance_products WHERE id = ?', [product_id])
    if (products.length === 0) {
      res.status(404).json({ success: false, error: '保险产品不存在' })
      return
    }
    const product = products[0]
    const startDate = new Date().toISOString().slice(0, 10)
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    run('INSERT INTO insurance_policies (user_id, product_id, insured_name, insured_id, premium, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.user!.id, product_id, insured_name, insured_id, product.premium, 'active', startDate, endDate])
    const policies = query('SELECT * FROM insurance_policies WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user!.id])
    res.json({ success: true, data: policies[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/policies', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const policies = query('SELECT ip.*, ip2.name as product_name, ip2.type as product_type, ip2.coverage_amount FROM insurance_policies ip JOIN insurance_products ip2 ON ip.product_id = ip2.id WHERE ip.user_id = ? ORDER BY ip.created_at DESC', [req.user!.id])
    res.json({ success: true, data: policies })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/claims', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { policy_id, amount, description, documents } = req.body
    if (!policy_id || !amount || !description) {
      res.status(400).json({ success: false, error: '保单ID、理赔金额和描述不能为空' })
      return
    }
    const policies = query('SELECT * FROM insurance_policies WHERE id = ? AND user_id = ?', [policy_id, req.user!.id])
    if (policies.length === 0) {
      res.status(404).json({ success: false, error: '保单不存在' })
      return
    }
    run('INSERT INTO claims (policy_id, user_id, amount, description, documents, status) VALUES (?, ?, ?, ?, ?, ?)', [policy_id, req.user!.id, amount, description, documents || null, 'initial_review'])
    const claims = query('SELECT * FROM claims WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user!.id])
    res.json({ success: true, data: claims[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/claims', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const claims = query('SELECT c.*, ip.product_id, ip2.name as product_name FROM claims c JOIN insurance_policies ip ON c.policy_id = ip.id JOIN insurance_products ip2 ON ip.product_id = ip2.id WHERE c.user_id = ? ORDER BY c.created_at DESC', [req.user!.id])
    res.json({ success: true, data: claims })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/claims/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const claims = query('SELECT c.*, ip.product_id, ip.insured_name, ip.insured_id, ip2.name as product_name, ip2.type as product_type FROM claims c JOIN insurance_policies ip ON c.policy_id = ip.id JOIN insurance_products ip2 ON ip.product_id = ip2.id WHERE c.id = ? AND c.user_id = ?', [id, req.user!.id])
    if (claims.length === 0) {
      res.status(404).json({ success: false, error: '理赔记录不存在' })
      return
    }
    res.json({ success: true, data: claims[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.put('/claims/:id/review', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status, review_note } = req.body
    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, error: '审核状态无效' })
      return
    }
    const claims = query('SELECT * FROM claims WHERE id = ?', [id])
    if (claims.length === 0) {
      res.status(404).json({ success: false, error: '理赔记录不存在' })
      return
    }
    run('UPDATE claims SET status = ?, review_note = ?, reviewed_at = datetime("now") WHERE id = ?', [status, review_note || null, id])
    const updated = query('SELECT * FROM claims WHERE id = ?', [id])
    res.json({ success: true, data: updated[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
