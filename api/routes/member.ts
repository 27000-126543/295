import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/info', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let profiles = query('SELECT * FROM member_profiles WHERE user_id = ?', [req.user!.id])
    if (profiles.length === 0) {
      run('INSERT INTO member_profiles (user_id) VALUES (?)', [req.user!.id])
      profiles = query('SELECT * FROM member_profiles WHERE user_id = ?', [req.user!.id])
    }
    const profile = profiles[0]
    const levels = ['normal', 'silver', 'gold', 'platinum', 'diamond']
    const thresholds = [0, 2000, 5000, 10000, 30000]
    const currentIdx = levels.indexOf(profile.level)
    profile.level_name = { normal: '普通会员', silver: '银卡会员', gold: '金卡会员', platinum: '铂金会员', diamond: '钻石会员' }[profile.level] || '普通会员'
    if (currentIdx < levels.length - 1) {
      profile.next_level = levels[currentIdx + 1]
      profile.next_level_name = { normal: '普通会员', silver: '银卡会员', gold: '金卡会员', platinum: '铂金会员', diamond: '钻石会员' }[levels[currentIdx + 1]]
      profile.next_threshold = thresholds[currentIdx + 1]
      profile.upgrade_progress = Math.min(100, Math.round((profile.annual_spending / thresholds[currentIdx + 1]) * 100))
    } else {
      profile.next_level = null
      profile.next_level_name = null
      profile.next_threshold = null
      profile.upgrade_progress = 100
    }
    res.json({ success: true, data: profile })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/coupons', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query
    let sql = 'SELECT * FROM coupons WHERE user_id = ?'
    const params: any[] = [req.user!.id]
    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }
    sql += ' ORDER BY created_at DESC'
    const coupons = query(sql, params)
    res.json({ success: true, data: coupons })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/upgrade-progress', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let profiles = query('SELECT * FROM member_profiles WHERE user_id = ?', [req.user!.id])
    if (profiles.length === 0) {
      run('INSERT INTO member_profiles (user_id) VALUES (?)', [req.user!.id])
      profiles = query('SELECT * FROM member_profiles WHERE user_id = ?', [req.user!.id])
    }
    const profile = profiles[0]
    const levels = ['normal', 'silver', 'gold', 'platinum', 'diamond']
    const thresholds = [0, 2000, 5000, 10000, 30000]
    const currentIdx = levels.indexOf(profile.level)
    const progress = {
      current_level: profile.level,
      current_level_name: { normal: '普通会员', silver: '银卡会员', gold: '金卡会员', platinum: '铂金会员', diamond: '钻石会员' }[profile.level],
      annual_spending: profile.annual_spending,
      activity_score: profile.activity_score,
      points: profile.points,
      levels: levels.map((level, idx) => ({
        level,
        level_name: { normal: '普通会员', silver: '银卡会员', gold: '金卡会员', platinum: '铂金会员', diamond: '钻石会员' }[level],
        threshold: thresholds[idx],
        achieved: idx <= currentIdx,
      })),
    }
    res.json({ success: true, data: progress })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
