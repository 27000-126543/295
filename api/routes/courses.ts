import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { category, page = '1', pageSize = '10' } = req.query
    let sql = 'SELECT c.*, t.name as teacher_name FROM courses c LEFT JOIN teachers t ON c.teacher_id = t.id WHERE 1=1'
    const params: any[] = []
    if (category) {
      sql += ' AND c.category = ?'
      params.push(category)
    }
    const countResult = query(sql.replace('SELECT c.*, t.name as teacher_name', 'SELECT COUNT(*) as total'), params)
    const total = countResult[0].total
    sql += ' ORDER BY c.rating DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize))
    const courses = query(sql, params)
    res.json({ success: true, data: { list: courses, total, page: Number(page), pageSize: Number(pageSize) } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/categories', async (_req, res: Response): Promise<void> => {
  try {
    const categories = query('SELECT DISTINCT category FROM courses ORDER BY category')
    res.json({ success: true, data: categories.map((c: any) => c.category) })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const courses = query('SELECT c.*, t.name as teacher_name, t.avatar as teacher_avatar, t.specialty, t.bio as teacher_bio FROM courses c LEFT JOIN teachers t ON c.teacher_id = t.id WHERE c.id = ?', [id])
    if (courses.length === 0) {
      res.status(404).json({ success: false, error: '课程不存在' })
      return
    }
    const course = courses[0]
    course.schedules = query('SELECT * FROM schedules WHERE course_id = ? ORDER BY date, start_time', [id])
    res.json({ success: true, data: course })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/:id/book', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { schedule_id, baby_id } = req.body
    if (!schedule_id) {
      res.status(400).json({ success: false, error: '排班ID不能为空' })
      return
    }
    const courses = query('SELECT * FROM courses WHERE id = ?', [id])
    if (courses.length === 0) {
      res.status(404).json({ success: false, error: '课程不存在' })
      return
    }
    const schedules = query('SELECT * FROM schedules WHERE id = ? AND course_id = ?', [schedule_id, id])
    if (schedules.length === 0) {
      res.status(404).json({ success: false, error: '排班不存在' })
      return
    }
    const schedule = schedules[0]
    if (schedule.booked >= schedule.capacity) {
      res.status(400).json({ success: false, error: '该时段已约满' })
      return
    }
    const existing = query('SELECT * FROM course_tickets WHERE user_id = ? AND schedule_id = ?', [req.user!.id, schedule_id])
    if (existing.length > 0) {
      res.status(400).json({ success: false, error: '您已预约该时段' })
      return
    }
    const qrCode = `TICKET-${Date.now()}-${req.user!.id}-${schedule_id}`
    run('INSERT INTO course_tickets (user_id, schedule_id, course_id, status, qr_code) VALUES (?, ?, ?, ?, ?)', [req.user!.id, schedule_id, id, 'active', qrCode])
    run('UPDATE schedules SET booked = booked + 1 WHERE id = ?', [schedule_id])
    const tickets = query('SELECT * FROM course_tickets WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user!.id])
    res.json({ success: true, data: tickets[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/tickets/mine', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tickets = query('SELECT ct.*, c.name as course_name, c.cover_image, s.date, s.start_time, s.end_time, t.name as teacher_name FROM course_tickets ct JOIN courses c ON ct.course_id = c.id JOIN schedules s ON ct.schedule_id = s.id JOIN teachers t ON s.teacher_id = t.id WHERE ct.user_id = ? ORDER BY ct.created_at DESC', [req.user!.id])
    res.json({ success: true, data: tickets })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/tickets/:id/checkin', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { baby_id, teacher_comment } = req.body
    const tickets = query('SELECT * FROM course_tickets WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (tickets.length === 0) {
      res.status(404).json({ success: false, error: '课程票不存在' })
      return
    }
    const ticket = tickets[0]
    if (ticket.status === 'used') {
      res.status(400).json({ success: false, error: '该票已签到' })
      return
    }
    run('UPDATE course_tickets SET status = ? WHERE id = ?', ['used', id])
    if (baby_id) {
      run('INSERT INTO growth_track_items (ticket_id, baby_id, teacher_comment, checkin_time) VALUES (?, ?, ?, datetime("now"))', [id, baby_id, teacher_comment || null])
    }
    const updated = query('SELECT * FROM course_tickets WHERE id = ?', [id])
    res.json({ success: true, data: updated[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/growth-track', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { baby_id } = req.query
    let sql = 'SELECT gti.*, c.name as course_name, s.date, s.start_time, s.end_time FROM growth_track_items gti JOIN course_tickets ct ON gti.ticket_id = ct.id JOIN courses c ON ct.course_id = c.id JOIN schedules s ON ct.schedule_id = s.id WHERE ct.course_id = ?'
    const params: any[] = [id]
    if (baby_id) {
      sql += ' AND gti.baby_id = ?'
      params.push(baby_id)
    }
    sql += ' ORDER BY gti.created_at DESC'
    const tracks = query(sql, params)
    res.json({ success: true, data: tracks })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
