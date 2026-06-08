import { Router, type Response } from 'express'
import { query, run } from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const babies = query('SELECT * FROM babies WHERE user_id = ?', [req.user!.id])
    res.json({ success: true, data: babies })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, gender, birth_date, avatar, growth, vaccines } = req.body
    if (!name || !gender || !birth_date) {
      res.status(400).json({ success: false, error: '姓名、性别和出生日期不能为空' })
      return
    }
    run('INSERT INTO babies (user_id, name, gender, birth_date, avatar) VALUES (?, ?, ?, ?, ?)', [req.user!.id, name, gender, birth_date, avatar || null])
    const babies = query('SELECT * FROM babies WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user!.id])
    const baby = babies[0]
    if (growth && Array.isArray(growth)) {
      for (const g of growth) {
        if (g.height && g.weight && g.record_date) {
          run('INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (?, ?, ?, ?)', [baby.id, g.height, g.weight, g.record_date])
        }
      }
    }
    if (vaccines && Array.isArray(vaccines)) {
      for (const v of vaccines) {
        if (v.vaccine_name) {
          run('INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (?, ?, ?, ?, ?)', [baby.id, v.vaccine_name, v.vaccinated_date || null, v.hospital || null, v.status || 'completed'])
        }
      }
    }
    res.json({ success: true, data: baby })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existing = query('SELECT * FROM babies WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (existing.length === 0) {
      res.status(404).json({ success: false, error: '宝宝档案不存在' })
      return
    }
    const { name, gender, birth_date, avatar, growth, vaccines } = req.body
    run('UPDATE babies SET name = ?, gender = ?, birth_date = ?, avatar = ? WHERE id = ?', [name || existing[0].name, gender || existing[0].gender, birth_date || existing[0].birth_date, avatar !== undefined ? avatar : existing[0].avatar, id])
    if (growth && Array.isArray(growth)) {
      for (const g of growth) {
        if (g.height && g.weight && g.record_date) {
          run('INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (?, ?, ?, ?)', [id, g.height, g.weight, g.record_date])
        }
      }
    }
    if (vaccines && Array.isArray(vaccines)) {
      for (const v of vaccines) {
        if (v.vaccine_name) {
          run('INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (?, ?, ?, ?, ?)', [id, v.vaccine_name, v.vaccinated_date || null, v.hospital || null, v.status || 'completed'])
        }
      }
    }
    const updated = query('SELECT * FROM babies WHERE id = ?', [id])
    res.json({ success: true, data: updated[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const existing = query('SELECT * FROM babies WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (existing.length === 0) {
      res.status(404).json({ success: false, error: '宝宝档案不存在' })
      return
    }
    run('DELETE FROM growth_records WHERE baby_id = ?', [id])
    run('DELETE FROM vaccine_records WHERE baby_id = ?', [id])
    run('DELETE FROM babies WHERE id = ?', [id])
    res.json({ success: true, data: null })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/growth', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const records = query('SELECT * FROM growth_records WHERE baby_id = ? ORDER BY record_date DESC', [id])
    res.json({ success: true, data: records })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/:id/growth', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { height, weight, record_date } = req.body
    if (!height || !weight || !record_date) {
      res.status(400).json({ success: false, error: '身高、体重和记录日期不能为空' })
      return
    }
    const baby = query('SELECT * FROM babies WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (baby.length === 0) {
      res.status(404).json({ success: false, error: '宝宝档案不存在' })
      return
    }
    run('INSERT INTO growth_records (baby_id, height, weight, record_date) VALUES (?, ?, ?, ?)', [id, height, weight, record_date])
    const records = query('SELECT * FROM growth_records WHERE baby_id = ? ORDER BY id DESC LIMIT 1', [id])
    res.json({ success: true, data: records[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/vaccines', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const records = query('SELECT * FROM vaccine_records WHERE baby_id = ? ORDER BY created_at DESC', [id])
    res.json({ success: true, data: records })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.post('/:id/vaccines', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { vaccine_name, vaccinated_date, hospital, status } = req.body
    if (!vaccine_name) {
      res.status(400).json({ success: false, error: '疫苗名称不能为空' })
      return
    }
    const baby = query('SELECT * FROM babies WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (baby.length === 0) {
      res.status(404).json({ success: false, error: '宝宝档案不存在' })
      return
    }
    run('INSERT INTO vaccine_records (baby_id, vaccine_name, vaccinated_date, hospital, status) VALUES (?, ?, ?, ?, ?)', [id, vaccine_name, vaccinated_date || null, hospital || null, status || 'pending'])
    const records = query('SELECT * FROM vaccine_records WHERE baby_id = ? ORDER BY id DESC LIMIT 1', [id])
    res.json({ success: true, data: records[0] })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/vaccine-plan', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const baby = query('SELECT * FROM babies WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (baby.length === 0) {
      res.status(404).json({ success: false, error: '宝宝档案不存在' })
      return
    }
    const doneVaccines = query('SELECT vaccine_name FROM vaccine_records WHERE baby_id = ? AND status = ?', [id, 'done'])
    const doneNames = doneVaccines.map((v: any) => v.vaccine_name)
    const plan = [
      { vaccine_name: '乙肝疫苗(第1剂)', month: 0, status: doneNames.includes('乙肝疫苗(第1剂)') ? 'done' : 'pending' },
      { vaccine_name: '卡介苗', month: 0, status: doneNames.includes('卡介苗') ? 'done' : 'pending' },
      { vaccine_name: '乙肝疫苗(第2剂)', month: 1, status: doneNames.includes('乙肝疫苗(第2剂)') ? 'done' : 'pending' },
      { vaccine_name: '脊灰疫苗(第1剂)', month: 2, status: doneNames.includes('脊灰疫苗(第1剂)') ? 'done' : 'pending' },
      { vaccine_name: '百白破疫苗(第1剂)', month: 3, status: doneNames.includes('百白破疫苗(第1剂)') ? 'done' : 'pending' },
      { vaccine_name: '脊灰疫苗(第2剂)', month: 3, status: doneNames.includes('脊灰疫苗(第2剂)') ? 'done' : 'pending' },
      { vaccine_name: '百白破疫苗(第2剂)', month: 4, status: doneNames.includes('百白破疫苗(第2剂)') ? 'done' : 'pending' },
      { vaccine_name: '乙肝疫苗(第3剂)', month: 6, status: doneNames.includes('乙肝疫苗(第3剂)') ? 'done' : 'pending' },
      { vaccine_name: 'A群流脑疫苗(第1剂)', month: 6, status: doneNames.includes('A群流脑疫苗(第1剂)') ? 'done' : 'pending' },
      { vaccine_name: '麻疹疫苗', month: 8, status: doneNames.includes('麻疹疫苗') ? 'done' : 'pending' },
      { vaccine_name: '乙脑疫苗(第1剂)', month: 8, status: doneNames.includes('乙脑疫苗(第1剂)') ? 'done' : 'pending' },
      { vaccine_name: '麻腮风疫苗', month: 18, status: doneNames.includes('麻腮风疫苗') ? 'done' : 'pending' },
      { vaccine_name: '甲肝疫苗', month: 18, status: doneNames.includes('甲肝疫苗') ? 'done' : 'pending' },
    ]
    res.json({ success: true, data: plan })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/:id/checkup-plan', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const baby = query('SELECT * FROM babies WHERE id = ? AND user_id = ?', [id, req.user!.id])
    if (baby.length === 0) {
      res.status(404).json({ success: false, error: '宝宝档案不存在' })
      return
    }
    const plan = [
      { age: '出生', items: ['体格检查', '新生儿听力筛查', '新生儿疾病筛查'] },
      { age: '1个月', items: ['体格检查', '生长发育评估'] },
      { age: '3个月', items: ['体格检查', '生长发育评估', '视力筛查'] },
      { age: '6个月', items: ['体格检查', '血常规', '听力筛查', '口腔检查'] },
      { age: '9个月', items: ['体格检查', '生长发育评估', '视力筛查'] },
      { age: '12个月', items: ['体格检查', '血常规', '听力筛查'] },
      { age: '18个月', items: ['体格检查', '生长发育评估', '视力筛查', '口腔检查'] },
      { age: '24个月', items: ['体格检查', '血常规', '听力筛查'] },
      { age: '36个月', items: ['体格检查', '视力筛查', '口腔检查'] },
    ]
    res.json({ success: true, data: plan })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
