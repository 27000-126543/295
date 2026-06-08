import { Router, type Response } from 'express'
import { query } from '../db.js'
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

function buildWhere(base: string, city?: string, startDate?: string, endDate?: string, alias?: string): { sql: string; params: any[] } {
  const prefix = alias ? `${alias}.` : ''
  let sql = base
  const params: any[] = []
  if (city) {
    sql += ` AND ${prefix}city = ?`
    params.push(city)
  }
  if (startDate && endDate) {
    sql += ` AND ${prefix}created_at >= ? AND ${prefix}created_at <= ?`
    params.push(startDate, endDate)
  }
  return { sql, params }
}

router.get('/dashboard', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city, startDate, endDate } = req.query as { city?: string; startDate?: string; endDate?: string }

    const orderWhere = buildWhere('WHERE 1=1', city, startDate, endDate)
    const revenueWhere = buildWhere("WHERE status != 'pending'", city, startDate, endDate)

    const totalOrders = query(`SELECT COUNT(*) as count FROM orders ${orderWhere.sql}`, orderWhere.params)[0].count
    const totalRevenue = query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders ${revenueWhere.sql}`, revenueWhere.params)[0].total

    let babyCount = 0
    if (city) {
      const bp: any[] = [city]
      let babySql = 'SELECT COUNT(*) as count FROM babies WHERE user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?'
      if (startDate && endDate) { babySql += ' AND created_at >= ? AND created_at <= ?'; bp.push(startDate, endDate) }
      babySql += ')'
      babyCount = query(babySql, bp)[0].count
    } else {
      babyCount = query('SELECT COUNT(*) as count FROM babies')[0].count
    }

    let postCount = 0
    if (city) {
      const pp: any[] = [city]
      let postSql = 'SELECT COUNT(*) as count FROM posts WHERE user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?'
      if (startDate && endDate) { postSql += ' AND created_at >= ? AND created_at <= ?'; pp.push(startDate, endDate) }
      postSql += ')'
      postCount = query(postSql, pp)[0].count
    } else {
      postCount = query('SELECT COUNT(*) as count FROM posts')[0].count
    }

    let courseConsumptionRate = 0
    if (city) {
      const cityUserSql = 'SELECT DISTINCT user_id FROM orders WHERE city = ?'
      const cityUsers = query(cityUserSql, [city])
      const cityUserIds = cityUsers.map((u: any) => u.user_id)
      if (cityUserIds.length > 0) {
        const totalTickets = query(`SELECT COUNT(*) as count FROM course_tickets WHERE user_id IN (${cityUserIds.map(() => '?').join(',')})`, cityUserIds)[0].count
        const usedTickets = query(`SELECT COUNT(*) as count FROM course_tickets WHERE status = 'used' AND user_id IN (${cityUserIds.map(() => '?').join(',')})`, cityUserIds)[0].count
        courseConsumptionRate = totalTickets > 0 ? Math.round(usedTickets / totalTickets * 100) : 0
      }
    } else {
      const totalTickets = query('SELECT COUNT(*) as count FROM course_tickets')[0].count
      const usedTickets = query("SELECT COUNT(*) as count FROM course_tickets WHERE status = 'used'")[0].count
      courseConsumptionRate = totalTickets > 0 ? Math.round(usedTickets / totalTickets * 100) : 0
    }

    let communityActivity = 0
    if (city) {
      const caParams: any[] = [city]
      let caSql = "SELECT COUNT(*) as count FROM posts WHERE user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?"
      if (startDate && endDate) { caSql += ' AND created_at >= ? AND created_at <= ?'; caParams.push(startDate, endDate) }
      caSql += ")"
      if (startDate && endDate) { caSql += ' AND created_at >= ? AND created_at <= ?'; caParams.push(startDate, endDate) }
      communityActivity = query(caSql, caParams)[0].count
    } else {
      if (startDate && endDate) {
        communityActivity = query("SELECT COUNT(*) as count FROM posts WHERE created_at >= ? AND created_at <= ?", [startDate, endDate])[0].count
      } else {
        communityActivity = query("SELECT COUNT(*) as count FROM posts WHERE date(created_at) = date('now')")[0].count
      }
    }

    let insuranceClaimAvgDays = 0
    if (city) {
      const claimParams: any[] = [city]
      let claimSql = "SELECT AVG(CAST(julianday(c.reviewed_at) - julianday(c.created_at) AS REAL)) as avg_days FROM claims c WHERE c.reviewed_at IS NOT NULL AND c.user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?"
      if (startDate && endDate) { claimSql += ' AND created_at >= ? AND created_at <= ?'; claimParams.push(startDate, endDate) }
      claimSql += ")"
      if (startDate && endDate) { claimSql += ' AND c.created_at >= ? AND c.created_at <= ?'; claimParams.push(startDate, endDate) }
      const result = query(claimSql, claimParams)
      insuranceClaimAvgDays = result[0].avg_days ? Math.round(result[0].avg_days * 10) / 10 : 0
    } else {
      if (startDate && endDate) {
        const result = query("SELECT AVG(CAST(julianday(reviewed_at) - julianday(created_at) AS REAL)) as avg_days FROM claims WHERE reviewed_at IS NOT NULL AND created_at >= ? AND created_at <= ?", [startDate, endDate])
        insuranceClaimAvgDays = result[0].avg_days ? Math.round(result[0].avg_days * 10) / 10 : 0
      } else {
        const result = query("SELECT AVG(CAST(julianday(reviewed_at) - julianday(created_at) AS REAL)) as avg_days FROM claims WHERE reviewed_at IS NOT NULL")
        insuranceClaimAvgDays = result[0].avg_days ? Math.round(result[0].avg_days * 10) / 10 : 0
      }
    }

    let memberGrowth = 0
    if (city) {
      const mgParams: any[] = [city]
      let mgSql = "SELECT COUNT(*) as count FROM users WHERE role = 'user' AND id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?"
      if (startDate && endDate) { mgSql += ' AND created_at >= ? AND created_at <= ?'; mgParams.push(startDate, endDate) }
      mgSql += ")"
      if (startDate && endDate) { mgSql += ' AND users.created_at >= ? AND users.created_at <= ?'; mgParams.push(startDate, endDate) }
      else { mgSql += " AND users.created_at >= datetime('now', '-30 days')" }
      memberGrowth = query(mgSql, mgParams)[0].count
    } else {
      if (startDate && endDate) {
        memberGrowth = query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND created_at >= ? AND created_at <= ?", [startDate, endDate])[0].count
      } else {
        memberGrowth = query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND created_at >= datetime('now', '-30 days')")[0].count
      }
    }

    const catWhere = buildWhere('WHERE 1=1', city, startDate, endDate, 'o')
    const categorySales = query(`SELECT p.category, SUM(oi.quantity * oi.price) as revenue, SUM(oi.quantity) as quantity FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id ${catWhere.sql} GROUP BY p.category ORDER BY revenue DESC`, catWhere.params)

    let courseBookingsWhere = ''
    const cbParams: any[] = []
    if (city) {
      courseBookingsWhere = ' WHERE c.id IN (SELECT ct.course_id FROM course_tickets ct WHERE ct.user_id IN (SELECT DISTINCT user_id FROM orders WHERE city = ?))'
      cbParams.push(city)
    }
    const courseBookings = query(`SELECT c.name, c.category, SUM(s.booked) as total_booked FROM courses c JOIN schedules s ON c.id = s.course_id ${courseBookingsWhere} GROUP BY c.id ORDER BY total_booked DESC LIMIT 5`, cbParams)

    const recentWhere = buildWhere('WHERE 1=1', city, startDate, endDate, 'o')
    const recentOrders = query(`SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ${recentWhere.sql} ORDER BY o.created_at DESC LIMIT 5`, recentWhere.params)

    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
    const trendParams: any[] = []
    let trendWhere = 'WHERE 1=1'
    if (city) { trendWhere += ' AND city = ?'; trendParams.push(city) }
    const trendData = months.map(m => {
      const tp = [...trendParams, `${m}%`]
      const ord = query(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM orders ${trendWhere} AND created_at LIKE ?`, tp)
      return { month: m, revenue: ord[0].total, orders: ord[0].count }
    })

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
        trendData,
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

    const whInventory = query('SELECT wi.product_id, wi.warehouse_id, wi.stock, w.name as warehouse_name, w.city as warehouse_city FROM warehouse_inventory wi JOIN warehouses w ON wi.warehouse_id = w.id')
    const productMap: Record<number, any> = {}
    const products = query('SELECT id, name, category, stock, sales FROM products')
    for (const p of products) { productMap[p.id] = p }
    const stockByProduct: Record<number, { totalStock: number; warehouses: { name: string; city: string; stock: number }[] }> = {}
    for (const inv of whInventory) {
      if (!stockByProduct[inv.product_id]) {
        stockByProduct[inv.product_id] = { totalStock: 0, warehouses: [] }
      }
      stockByProduct[inv.product_id].totalStock += inv.stock
      stockByProduct[inv.product_id].warehouses.push({ name: inv.warehouse_name, city: inv.warehouse_city, stock: inv.stock })
    }
    const recommendedStock = Object.entries(stockByProduct)
      .map(([pid, info]) => {
        const p = productMap[Number(pid)]
        if (!p) return null
        const stockStatus = info.totalStock < p.sales * 0.3 ? '紧急补货' : info.totalStock < p.sales * 0.6 ? '建议补货' : '库存充足'
        return {
          name: p.name,
          category: p.category,
          stock: info.totalStock,
          sales: p.sales,
          stock_status: stockStatus,
          recommended: Math.round(p.sales * 1.2),
          warehouseStock: info.warehouses,
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.sales - a.sales)

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

    const cityComparison = query("SELECT city, COUNT(*) as orderCount, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE city IS NOT NULL AND city != '' GROUP BY city ORDER BY revenue DESC")
    const stockoutStats = query('SELECT w.city, COUNT(*) as stockoutCount FROM stockout_logs sl JOIN warehouses w ON sl.warehouse_id = w.id GROUP BY w.city')
    const stockoutMap: Record<string, number> = {}
    for (const s of stockoutStats) { stockoutMap[s.city] = s.stockoutCount }

    const warehouseLoad = query('SELECT w.name, w.city, COALESCE(SUM(wi.stock), 0) as totalStock, COUNT(wi.product_id) as productCount FROM warehouses w LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id GROUP BY w.id')
    const warehouseLoadWithOrders = warehouseLoad.map((wl: any) => {
      const orderCount = query("SELECT COUNT(*) as count FROM orders WHERE warehouse = ?", [wl.name])[0].count
      return {
        name: wl.name,
        city: wl.city,
        totalStock: wl.totalStock,
        productCount: wl.productCount,
        orderCount,
        loadRate: wl.totalStock > 0 ? Math.round(orderCount / (wl.totalStock / 10) * 100) / 100 : 0,
      }
    })

    const cityComparisonWithDetails = cityComparison.map((cc: any) => {
      const avgDeliveryDays = (() => {
        const result = query("SELECT AVG(CAST(julianday(lr.created_at) - julianday(o.created_at) AS REAL)) as avg_days FROM logistics_records lr JOIN orders o ON lr.order_id = o.id WHERE o.city = ? AND lr.status = 'delivered'", [cc.city])
        return result[0].avg_days ? Math.round(result[0].avg_days * 10) / 10 : 0
      })()
      const whNames = query("SELECT DISTINCT warehouse FROM orders WHERE city = ? AND warehouse IS NOT NULL", [cc.city]).map((w: any) => w.warehouse)
      return {
        city: cc.city,
        orderCount: cc.orderCount,
        revenue: cc.revenue,
        avgOrderValue: cc.orderCount > 0 ? Math.round(cc.revenue / cc.orderCount * 100) / 100 : 0,
        avgDeliveryDays,
        stockoutCount: stockoutMap[cc.city] || 0,
        warehouses: whNames,
      }
    })

    res.json({
      success: true,
      data: {
        revenuePredictions: predictions,
        ageDistribution,
        recommendedStock,
        coursePredictions,
        holidayImpact,
        cityComparison: cityComparisonWithDetails,
        warehouseLoad: warehouseLoadWithOrders,
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
    const newUsers = query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['user'])[0].count
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

    const cityComparison = query("SELECT city, COUNT(*) as orderCount, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE city IS NOT NULL AND city != '' GROUP BY city ORDER BY revenue DESC")
    const stockoutStats = query('SELECT w.city, COUNT(*) as stockoutCount FROM stockout_logs sl JOIN warehouses w ON sl.warehouse_id = w.id GROUP BY w.city')
    const stockoutMap: Record<string, number> = {}
    for (const s of stockoutStats) { stockoutMap[s.city] = s.stockoutCount }

    const cityReport = cityComparison.map((cc: any) => {
      const avgDeliveryDays = (() => {
        const result = query("SELECT AVG(CAST(julianday(lr.created_at) - julianday(o.created_at) AS REAL)) as avg_days FROM logistics_records lr JOIN orders o ON lr.order_id = o.id WHERE o.city = ? AND lr.status = 'delivered'", [cc.city])
        return result[0].avg_days ? Math.round(result[0].avg_days * 10) / 10 : 0
      })()
      return {
        city: cc.city,
        orderCount: cc.orderCount,
        revenue: cc.revenue,
        avgDeliveryDays,
        stockoutCount: stockoutMap[cc.city] || 0,
      }
    })

    const warehouseLoad = query('SELECT w.name, w.city, COALESCE(SUM(wi.stock), 0) as totalStock, COUNT(wi.product_id) as productCount FROM warehouses w LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id GROUP BY w.id')
    const warehouseReport = warehouseLoad.map((wl: any) => {
      const orderCount = query("SELECT COUNT(*) as count FROM orders WHERE warehouse = ?", [wl.name])[0].count
      return {
        name: wl.name,
        city: wl.city,
        totalStock: wl.totalStock,
        productCount: wl.productCount,
        orderCount,
      }
    })

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
        cityReport,
        warehouseReport,
      }
    })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
