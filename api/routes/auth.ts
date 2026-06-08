import { Router, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, password, name, avatar } = req.body
    if (!phone || !password || !name) {
      res.status(400).json({ success: false, error: '手机号、密码和姓名不能为空' })
      return
    }
    const existing = query('SELECT id FROM users WHERE phone = ?', [phone])
    if (existing.length > 0) {
      res.status(400).json({ success: false, error: '该手机号已注册' })
      return
    }
    run('INSERT INTO users (phone, password, name, avatar) VALUES (?, ?, ?, ?)', [phone, password, name, avatar || null])
    const users = query('SELECT id, phone, name, avatar, role FROM users WHERE phone = ?', [phone])
    const user = users[0]
    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ success: true, data: { token, user } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      res.status(400).json({ success: false, error: '手机号和密码不能为空' })
      return
    }
    const users = query('SELECT id, phone, password, name, avatar, role FROM users WHERE phone = ?', [phone])
    if (users.length === 0) {
      res.status(400).json({ success: false, error: '用户不存在' })
      return
    }
    const user = users[0]
    if (user.password !== password) {
      res.status(400).json({ success: false, error: '密码错误' })
      return
    }
    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, phone: user.phone, name: user.name, avatar: user.avatar, role: user.role }
      }
    })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = query('SELECT id, phone, name, avatar, role, created_at FROM users WHERE id = ?', [req.user!.id])
    if (users.length === 0) {
      res.status(404).json({ success: false, error: '用户不存在' })
      return
    }
    res.json({ success: true, data: users[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
