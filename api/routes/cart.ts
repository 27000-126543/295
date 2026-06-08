import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = query('SELECT ci.*, p.name as product_name, p.image as product_image, p.price as product_price, p.category FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?', [req.user!.id])
    res.json({ success: true, data: items })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id, quantity = 1, spec } = req.body
    if (!product_id) {
      res.status(400).json({ success: false, error: '商品ID不能为空' })
      return
    }
    const products = query('SELECT * FROM products WHERE id = ?', [product_id])
    if (products.length === 0) {
      res.status(404).json({ success: false, error: '商品不存在' })
      return
    }
    const existing = query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND spec IS ?', [req.user!.id, product_id, spec || null])
    if (existing.length > 0) {
      run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id])
    } else {
      run('INSERT INTO cart_items (user_id, product_id, quantity, spec) VALUES (?, ?, ?, ?)', [req.user!.id, product_id, quantity, spec || null])
    }
    const items = query('SELECT ci.*, p.name as product_name, p.image as product_image, p.price as product_price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?', [req.user!.id])
    res.json({ success: true, data: items })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { quantity, spec } = req.body
    const existing = query('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (existing.length === 0) {
      res.status(404).json({ success: false, error: '购物车项不存在' })
      return
    }
    if (quantity !== undefined) {
      run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id])
    }
    if (spec !== undefined) {
      run('UPDATE cart_items SET spec = ? WHERE id = ?', [spec, id])
    }
    const items = query('SELECT ci.*, p.name as product_name, p.image as product_image, p.price as product_price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ?', [id])
    res.json({ success: true, data: items[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existing = query('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (existing.length === 0) {
      res.status(404).json({ success: false, error: '购物车项不存在' })
      return
    }
    run('DELETE FROM cart_items WHERE id = ?', [id])
    res.json({ success: true, data: null })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
