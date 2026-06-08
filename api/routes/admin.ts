import { Router, type Response } from 'express'
import { query } from '../db.js'
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/dashboard', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, startDate, endDate } = req.query as { city?: string; startDate?: string; endDate?: string }

    let orderWhere = 'WHERE 1=1'
    const orderParams: any[] = []
    if (city) {
      orderWhere += ' AND city = ?'
      orderParams.push(city)
    }
    if (startDate && endDate) {
      orderWhere += ' AND created_at >= ? AND created_at <= ?'
      orderParams.push(startDate, endDate)
    }

    const totalOrders = query(`SELECT COUNT(*) as count FROM orders ${orderWhere}`, orderParams)[0].count

    let revenueWhere = "WHERE status != 'pending'"
    const revenueParams: any[] = []
    if (city) {
      revenueWhere += ' AND city = ?'
      revenueParams.push(city)
    }
    if (startDate && endDate) {
      revenueWhere += ' AND created_at >= ? AND created_at <= ?'
      revenueParams.push(startDate, endDate)
    }
    const totalRevenue = query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders ${revenueWhere}`, revenueParams)[0].total

    let babyCount = 0
    if (city) {
      const babyParams: any[] = [city]
      let babySql = 'SELECT COUNT(*) as count FROM babies WHERE user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?'
      if (startDate && endDate) {
        babySql += ' AND created_at >= ? AND created_at <= ?'
        babyParams.push(startDate, endDate)
      }
      babySql += ')'
      babyCount = query(babySql, babyParams)[0].count
    } else {
      babyCount = query('SELECT COUNT(*) as count FROM babies')[0].count
    }

    let postCount = 0
    if (city) {
      const postParams: any[] = [city]
      let postSql = 'SELECT COUNT(*) as count FROM posts WHERE user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?'
      if (startDate && endDate) {
        postSql += ' AND created_at >= ? AND created_at <= ?'
        postParams.push(startDate, endDate)
      }
      postSql += ')'
      postCount = query(postSql, postParams)[0].count
    } else {
      postCount = query('SELECT COUNT(*) as count FROM posts')[0].count
    }

    let catWhere = ''
    const catParams: any[] = []
    if (city || (startDate && endDate)) {
      catWhere = 'WHERE 1=1'
      if (city) {
        catWhere += ' AND o.city = ?'
        catParams.push(city)
      }
      if (startDate && endDate) {
        catWhere += ' AND o.created_at >= ? AND o.created_at <= ?'
        catParams.push(startDate, endDate)
      }
    }
    const categorySales = query(`SELECT p.category, SUM(oi.quantity * oi.price) as revenue, SUM(oi.quantity) as quantity FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id ${catWhere} GROUP BY p.category ORDER BY revenue DESC`, catParams)

    const courseBookings = query('SELECT c.name, c.category, SUM(s.booked) as total_booked FROM courses c JOIN schedules s ON c.id = s.course_id GROUP BY c.id ORDER BY total_booked DESC LIMIT 5')

    let recentWhere = 'WHERE 1=1'
    const recentParams: any[] = []
    if (city) {
      recentWhere += ' AND o.city = ?'
      recentParams.push(city)
    }
    if (startDate && endDate) {
      recentWhere += ' AND o.created_at >= ? AND o.created_at <= ?'
      recentParams.push(startDate, endDate)
    }
    const recentOrders = query(`SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ${recentWhere} ORDER BY o.created_at DESC LIMIT 5`, recentParams)

    const courseConsumptionRate = (() => {
      const totalTickets = query('SELECT COUNT(*) as count FROM course_tickets')[0].count
      const usedTickets = query("SELECT COUNT(*) as count FROM course_tickets WHERE status = 'used'")[0].count
      return totalTickets > 0 ? Math.round(usedTickets / totalTickets * 100) : 0
    })()

    const communityActivity = query("SELECT COUNT(*) as count FROM posts WHERE date(created_at) = date('now')")[0].count

    const insuranceClaimAvgDays = (() => {
      const result = query("SELECT AVG(CAST(julianday(reviewed_at) - julianday(created_at) AS REAL)) as avg_days FROM claims WHERE reviewed_at IS NOT NULL")
      return result[0].avg_days ? Math.round(result[0].avg_days * 10) / 10 : 0
    })()

    const memberGrowth = query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND created_at >= datetime('now', '-30 days')")[0].count

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          courseConsumptionRate,
          communityActivity,
          insuranceClaimAvgDays,
          memberGrowth,
          totalRevenue,
          totalBabies: babyCount,
          totalPosts: postCount,
        },
        recentOrders,
        categorySales,
        courseBookings,
      }
    })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/prediction', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categorySales = query('SELECT p.category, SUM(oi.quantity * oi.price) as revenue, SUM(oi.quantity) as quantity FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.category')
    const predictions = categorySales.map((cat: any) => ({
      category: cat.category,
      current_revenue: cat.revenue,
      predicted_revenue: Math.round(cat.revenue * (1 + 0.1 + Math.random() * 0.2)),
      growth_rate: Math.round((10 + Math.random() * 20) * 10) / 10,
      confidence: Math.round((70 + Math.random() * 25) * 10) / 10,
    }))
    const ageDistribution = query('SELECT CASE WHEN (strftime("%Y","now") - strftime("%Y",birth_date)) < 1 THEN "0-1岁" WHEN (strftime("%Y","now") - strftime("%Y",birth_date)) < 2 THEN "1-2岁" WHEN (strftime("%Y","now") - strftime("%Y",birth_date)) < 3 THEN "2-3岁" ELSE "3岁+" END as age_group, COUNT(*) as count FROM babies GROUP BY age_group')
    const recommendedStock = query('SELECT p.name, p.category, p.stock, p.sales, CASE WHEN p.stock < p.sales * 0.3 THEN "紧急补货" WHEN p.stock < p.sales * 0.6 THEN "建议补货" ELSE "库存充足" END as stock_status FROM products p ORDER BY p.sales DESC')
    const recommendedStockWithRec = recommendedStock.map((item: any) => ({
      ...item,
      recommended: Math.round(item.sales * 1.2),
    }))
    const courseBookings = query('SELECT c.name, c.category, SUM(s.booked) as total_booked FROM courses c JOIN schedules s ON c.id = s.course_id GROUP BY c.id ORDER BY total_booked DESC')
    const coursePredictions = courseBookings.map((c: any) => {
      const predicted = Math.round(c.total_booked * (1.1 + Math.random() * 0.3))
      return {
        name: c.name,
        category: c.category,
        currentBookings: c.total_booked,
        predictedBookings: predicted,
        suggestion: predicted > c.total_booked * 0.8 ? '增加排课' : '维持排课',
      }
    })
    const now = new Date()
    const currentMonth = now.getMonth()
    let nextQuarter: number
    if (currentMonth <= 2) nextQuarter = 2
    else if (currentMonth <= 5) nextQuarter = 3
    else if (currentMonth <= 8) nextQuarter = 4
    else nextQuarter = 1
    const holidayMap: Record<number, { name: string; impactType: string; description: string; affectedCategories: string[] }[]> = {
      1: [
        { name: '春节', impactType: 'inventory_up', description: '年货需求增加，奶粉辅食备货+30%', affectedCategories: ['奶粉', '辅食'] },
        { name: '元宵节', impactType: 'activity_up', description: '亲子活动需求上升，课程预约增加', affectedCategories: ['课程'] },
      ],
      2: [
        { name: '清明节', impactType: 'inventory_up', description: '出行用品需求增加', affectedCategories: ['出行用品'] },
        { name: '劳动节', impactType: 'activity_up', description: '促销活动期间订单增长', affectedCategories: ['奶粉', '辅食', '洗护'] },
        { name: '端午节', impactType: 'activity_up', description: '亲子活动需求上升，课程预约增加', affectedCategories: ['课程'] },
      ],
      3: [
        { name: '中秋节', impactType: 'inventory_up', description: '礼盒装需求增加', affectedCategories: ['奶粉', '辅食'] },
        { name: '国庆节', impactType: 'activity_up', description: '促销活动期间订单大幅增长', affectedCategories: ['奶粉', '辅食', '洗护', '玩具'] },
      ],
      4: [
        { name: '元旦', impactType: 'activity_up', description: '新年促销活动，订单增长', affectedCategories: ['奶粉', '辅食', '玩具'] },
        { name: '春节前', impactType: 'inventory_up', description: '年货备货需求增加，库存需提前补充', affectedCategories: ['奶粉', '辅食', '洗护'] },
      ],
    }
    const holidayImpact = holidayMap[nextQuarter] || []
    res.json({
      success: true,
      data: {
        revenuePredictions: predictions,
        ageDistribution,
        recommendedStock: recommendedStockWithRec,
        coursePredictions,
        holidayImpact,
      }
    })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

router.get('/monthly-report', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalRevenue = query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders')[0].total
    const totalOrders = query('SELECT COUNT(*) as count FROM orders')[0].count
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const newUsers = query('SELECT COUNT(*) as count FROM users WHERE role = ?' , ['user'])[0].count
    const categoryRevenueRaw = query('SELECT p.category, SUM(oi.quantity * oi.price) as revenue FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.category')
    const totalCatRevenue = categoryRevenueRaw.reduce((sum: number, c: any) => sum + c.revenue, 0)
    const categoryRevenue = categoryRevenueRaw.map((c: any) => ({
      ...c,
      percentage: totalCatRevenue > 0 ? Math.round(c.revenue / totalCatRevenue * 1000) / 10 : 0,
    }))
    const orderStatusDist = query('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
    const topProducts = query('SELECT p.name, p.category, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY oi.product_id ORDER BY total_sold DESC LIMIT 10')
    const courseStatsRaw = query('SELECT c.name, c.category, SUM(s.booked) as total_booked, SUM(s.capacity) as total_capacity FROM courses c JOIN schedules s ON c.id = s.course_id GROUP BY c.id')
    const courseStats = courseStatsRaw.map((c: any) => ({
      ...c,
      completionRate: c.total_capacity > 0 ? Math.round(c.total_booked / c.total_capacity * 100) : 0,
    }))
    const totalBooked = courseStatsRaw.reduce((sum: number, c: any) => sum + (c.total_booked || 0), 0)
    const totalCapacity = courseStatsRaw.reduce((sum: number, c: any) => sum + (c.total_capacity || 0), 0)
    const courseCompletionRate = totalCapacity > 0 ? Math.round(totalBooked / totalCapacity * 100) : 0
    const userSatisfaction = Math.round((85 + Math.random() * 10) * 10) / 10
    const totalPremium = query('SELECT COALESCE(SUM(premium), 0) as total FROM insurance_policies')[0].total
    const totalClaimPaid = query("SELECT COALESCE(SUM(amount), 0) as total FROM claims WHERE status = 'paid'")[0].total
    const insuranceClaimRate = totalPremium > 0 ? Math.round(totalClaimPaid / totalPremium * 10000) / 100 : 0
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
    const monthlyTrend = months.map(m => ({
      month: m,
      revenue: Math.round(30000 + Math.random() * 20000),
      orders: Math.round(80 + Math.random() * 60),
      users: Math.round(20 + Math.random() * 30),
    }))
    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          newUsers,
          courseCompletionRate,
          userSatisfaction,
          insuranceClaimRate,
        },
        categoryRevenue,
        orderStatusDist,
        topProducts,
        courseStats,
        monthlyTrend,
      }
    })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
