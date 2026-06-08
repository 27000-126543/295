import jwt from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'

const JWT_SECRET = 'beibei2026secret'

export interface AuthRequest extends Request {
  user?: { id: number; phone: string; role: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录' })
    return
  }
  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; phone: string; role: string }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token无效或已过期' })
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: '权限不足' })
    return
  }
  next()
}

export { JWT_SECRET }
