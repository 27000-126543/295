import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { tag, page = '1', pageSize = '10' } = req.query
    let sql = 'SELECT p.*, u.name as author_name, u.avatar as author_avatar FROM posts p JOIN users u ON p.user_id = u.id WHERE 1=1'
    const params: any[] = []
    if (tag) {
      sql += ' AND p.tags LIKE ?'
      params.push(`%${tag}%`)
    }
    const countResult = query(sql.replace('SELECT p.*, u.name as author_name, u.avatar as author_avatar', 'SELECT COUNT(*) as total'), params)
    const total = countResult[0].total
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize))
    const posts = query(sql, params)
    res.json({ success: true, data: { list: posts, total, page: Number(page), pageSize: Number(pageSize) } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const posts = query('SELECT p.*, u.name as author_name, u.avatar as author_avatar FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?', [id])
    if (posts.length === 0) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }
    const post = posts[0]
    post.comments = query('SELECT c.*, u.name as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at', [id])
    res.json({ success: true, data: post })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, images, tags } = req.body
    if (!content) {
      res.status(400).json({ success: false, error: '内容不能为空' })
      return
    }
    run('INSERT INTO posts (user_id, content, images, tags) VALUES (?, ?, ?, ?)', [req.user!.id, content, images || null, tags || null])
    const posts = query('SELECT p.*, u.name as author_name, u.avatar as author_avatar FROM posts p JOIN users u ON p.user_id = u.id WHERE p.user_id = ? ORDER BY p.id DESC LIMIT 1', [req.user!.id])
    run('UPDATE member_profiles SET activity_score = activity_score + 5 WHERE user_id = ?', [req.user!.id])
    res.json({ success: true, data: posts[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existing = query('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', [id, req.user!.id])
    if (existing.length > 0) {
      run('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, req.user!.id])
      run('UPDATE posts SET like_count = like_count - 1 WHERE id = ?', [id])
      res.json({ success: true, data: { liked: false } })
    } else {
      run('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [id, req.user!.id])
      run('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [id])
      res.json({ success: true, data: { liked: true } })
    }
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/comments', async (req, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const comments = query('SELECT c.*, u.name as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at', [id])
    res.json({ success: true, data: comments })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/:id/comments', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { content } = req.body
    if (!content) {
      res.status(400).json({ success: false, error: '评论内容不能为空' })
      return
    }
    const posts = query('SELECT * FROM posts WHERE id = ?', [id])
    if (posts.length === 0) {
      res.status(404).json({ success: false, error: '帖子不存在' })
      return
    }
    run('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [id, req.user!.id, content])
    run('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [id])
    const comments = query('SELECT c.*, u.name as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.id DESC LIMIT 1', [id])
    res.json({ success: true, data: comments[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
