import { useEffect, useState } from "react";
import { ShoppingCart, BookOpen, Users, Baby, TrendingUp, CalendarDays, Package, DollarSign, Ticket, Clock, Activity, MapPin, Warehouse, AlertTriangle, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { adminApi } from "@/utils/api";
import type { DashboardData, PredictionData } from "@/types";

const OVERVIEW_CARDS: { key: keyof DashboardData["overview"]; label: string; icon: typeof ShoppingCart; format: (v: number) => string }[] = [
  { key: "totalOrders", label: "订单量", icon: ShoppingCart, format: (v) => v.toLocaleString() },
  { key: "courseConsumptionRate", label: "课程消耗率", icon: BookOpen, format: (v) => `${v}%` },
  { key: "communityActivity", label: "社区活跃度", icon: Activity, format: (v) => `${v} 日活` },
  { key: "insuranceClaimAvgDays", label: "理赔时效", icon: Clock, format: (v) => `${v} 天` },
  { key: "memberGrowth", label: "会员增长", icon: Users, format: (v) => `+${v}` },
  { key: "totalRevenue", label: "总营收", icon: DollarSign, format: (v) => `¥${v.toLocaleString()}` },
  { key: "totalBabies", label: "宝宝总数", icon: Baby, format: (v) => v.toLocaleString() },
  { key: "totalPosts", label: "社区帖子", icon: Activity, format: (v) => v.toLocaleString() },
];

const PIE_COLORS = ["#FF6B6B", "#4ECDC4", "#FFB347", "#87CEEB", "#DDA0DD"];

const CITY_OPTIONS = ["上海", "广州", "深圳", "杭州", "武汉", "苏州", "北京", "成都", "南京", "重庆"];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadPrediction();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const data = await adminApi.dashboard(params);
      setDashboard(data);
    } catch { /* */ }
    setLoading(false);
  };

  const loadPrediction = async () => {
    try {
      const data = await adminApi.prediction();
      setPrediction(data);
    } catch { /* */ }
  };

  const handleFilter = () => { loadData(); loadPrediction(); };

  const handleDeliveryFailed = async (orderId: number) => {
    try {
      await adminApi.markDeliveryFailed(orderId);
      loadData();
      loadPrediction();
    } catch (e: any) {
      alert(e.message || '操作失败');
    }
  };

  const handleReviewAfterSale = async (id: number, action: "approve" | "reject") => {
    try {
      await adminApi.reviewAfterSale(id, { action });
      loadData();
    } catch (e: any) {
      alert(e.message || '操作失败');
    }
  };

  const statusLabel: Record<string, string> = {
    pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已签收',
    cancelled: '已取消', delivery_failed: '发货失败',
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-4 card-shadow">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-charcoal-light" />
          <span className="text-sm font-medium text-charcoal">数据筛选</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-charcoal-light">城市</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral"
            >
              <option value="">全部城市</option>
              {CITY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-charcoal-light">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-charcoal-light">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral"
            />
          </div>
          <button onClick={handleFilter} className="btn-gradient px-4 py-2 text-sm">
            筛选
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {OVERVIEW_CARDS.map((card) => {
              const value = dashboard.overview[card.key] ?? 0;
              return (
                <div key={card.key} className="rounded-2xl bg-white p-4 card-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <card.icon className="h-5 w-5 text-coral" />
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-charcoal">{card.format(value)}</p>
                  <p className="text-xs text-charcoal-light mt-1">{card.label}</p>
                </div>
              );
            })}
          </div>

          {dashboard.trendData && dashboard.trendData.length > 0 && (
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">订单趋势</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dashboard.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} name="订单量" />
                  <Line type="monotone" dataKey="revenue" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 4 }} name="营收" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">品类销售额</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dashboard.categorySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">课程预约量</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dashboard.courseBookings.map((b) => ({ name: b.name, value: b.total_booked }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {dashboard.courseBookings.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {dashboard.courseBookings.map((b, i) => (
                  <span key={b.name} className="flex items-center gap-1 text-xs text-charcoal-light">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {b.name} {b.total_booked}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {prediction && prediction.cityComparison && prediction.cityComparison.length > 0 && (
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-coral" />
                <h3 className="text-sm font-semibold text-charcoal">城市运营对比</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">城市</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">订单量</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">营收</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">客单价</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">平均配送时效</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">缺货次数</th>
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">发货仓</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.cityComparison.map((c) => (
                      <tr key={c.city} className="border-b border-gray-50">
                        <td className="py-2.5 text-charcoal">{c.city}</td>
                        <td className="py-2.5 text-right text-charcoal">{c.orderCount}</td>
                        <td className="py-2.5 text-right text-charcoal">¥{c.revenue.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-charcoal-light">¥{c.avgOrderValue}</td>
                        <td className="py-2.5 text-right text-charcoal-light">{c.avgDeliveryDays}天</td>
                        <td className="py-2.5 text-right text-charcoal-light">{c.stockoutCount}</td>
                        <td className="py-2.5 text-charcoal-light">{c.warehouses.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {prediction && prediction.warehouseLoad && prediction.warehouseLoad.length > 0 && (
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Warehouse className="h-5 w-5 text-mint" />
                <h3 className="text-sm font-semibold text-charcoal">仓库履约分析</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">仓库名</th>
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">所在城市</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">总库存</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">SKU数</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">订单量</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">负载率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.warehouseLoad.map((w) => (
                      <tr key={w.name} className="border-b border-gray-50">
                        <td className="py-2.5 text-charcoal">{w.name}</td>
                        <td className="py-2.5 text-charcoal-light">{w.city}</td>
                        <td className="py-2.5 text-right text-charcoal">{w.totalStock}</td>
                        <td className="py-2.5 text-right text-charcoal-light">{w.productCount}</td>
                        <td className="py-2.5 text-right text-charcoal">{w.orderCount}</td>
                        <td className="py-2.5 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${w.loadRate > 0.8 ? 'bg-red-100 text-red-600' : w.loadRate > 0.5 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                            {(w.loadRate * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dashboard.afterSales && (
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="h-5 w-5 text-coral" />
                <h3 className="text-sm font-semibold text-charcoal">售后分析</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="rounded-xl bg-coral/5 p-3">
                  <p className="text-xs text-charcoal-light">售后单数</p>
                  <p className="text-xl font-bold text-charcoal mt-1">{dashboard.afterSales.totalAS}</p>
                </div>
                <div className="rounded-xl bg-coral/5 p-3">
                  <p className="text-xs text-charcoal-light">退款金额</p>
                  <p className="text-xl font-bold text-charcoal mt-1">¥{dashboard.afterSales.totalRefund.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-coral/5 p-3">
                  <p className="text-xs text-charcoal-light">退货入库</p>
                  <p className="text-xl font-bold text-charcoal mt-1">{dashboard.afterSales.totalReturnQty}件</p>
                </div>
                <div className="rounded-xl bg-coral/5 p-3">
                  <p className="text-xs text-charcoal-light">售后率</p>
                  <p className="text-xl font-bold text-charcoal mt-1">{dashboard.afterSales.afterSalesRate}%</p>
                </div>
              </div>
              {dashboard.afterSales.list.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-2 text-left text-xs font-medium text-charcoal-light">订单号</th>
                        <th className="py-2 text-left text-xs font-medium text-charcoal-light">用户</th>
                        <th className="py-2 text-left text-xs font-medium text-charcoal-light">商品</th>
                        <th className="py-2 text-left text-xs font-medium text-charcoal-light">类型</th>
                        <th className="py-2 text-right text-xs font-medium text-charcoal-light">数量</th>
                        <th className="py-2 text-right text-xs font-medium text-charcoal-light">退款金额</th>
                        <th className="py-2 text-right text-xs font-medium text-charcoal-light">状态</th>
                        <th className="py-2 text-left text-xs font-medium text-charcoal-light">城市</th>
                        <th className="py-2 text-right text-xs font-medium text-charcoal-light">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.afterSales.list.map((as) => (
                        <tr key={as.id} className="border-b border-gray-50">
                          <td className="py-2.5 text-charcoal">#{as.order_id}</td>
                          <td className="py-2.5 text-charcoal-light">{as.user_name || '-'}</td>
                          <td className="py-2.5 text-charcoal-light">{as.product_name || '-'}</td>
                          <td className="py-2.5 text-charcoal-light">
                            {as.type === 'refund' ? '退款' : as.type === 'return_refund' ? '退货退款' : '换货'}
                          </td>
                          <td className="py-2.5 text-right text-charcoal">{as.quantity}</td>
                          <td className="py-2.5 text-right text-charcoal">¥{as.refund_amount.toLocaleString()}</td>
                          <td className="py-2.5 text-right">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              as.status === 'approved' ? 'bg-green-100 text-green-600' :
                              as.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {as.status === 'approved' ? '已通过' : as.status === 'rejected' ? '已驳回' : '待处理'}
                            </span>
                          </td>
                          <td className="py-2.5 text-charcoal-light">{as.city || '-'}</td>
                          <td className="py-2.5 text-right">
                            {as.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleReviewAfterSale(as.id, 'approve')}
                                  className="rounded-lg bg-green-50 px-2 py-1 text-xs text-green-600 hover:bg-green-100 transition-colors"
                                >
                                  通过
                                </button>
                                <button
                                  onClick={() => handleReviewAfterSale(as.id, 'reject')}
                                  className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 transition-colors"
                                >
                                  驳回
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {dashboard.recentOrders.length > 0 && (
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">近期订单</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">订单号</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">金额</th>
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">发货仓</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">状态</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-gray-50">
                        <td className="py-2.5 text-charcoal">#{order.id}</td>
                        <td className="py-2.5 text-right text-charcoal">¥{order.total_amount.toLocaleString()}</td>
                        <td className="py-2.5 text-charcoal-light">{order.warehouse || '-'}</td>
                        <td className="py-2.5 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === 'delivery_failed' ? 'bg-red-100 text-red-600' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {statusLabel[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          {(order.status === 'pending' || order.status === 'paid' || order.status === 'shipped') && (
                            <button
                              onClick={() => handleDeliveryFailed(order.id)}
                              className="flex items-center gap-1 ml-auto rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              发货失败
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {prediction && prediction.recommendedStock.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-charcoal">推荐备货（仓库维度）</h3>
              </div>
              <div className="space-y-2">
                {prediction.recommendedStock.slice(0, 5).map((item) => (
                  <div key={item.name} className="rounded-xl bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-light">{item.name}</span>
                      <span className="font-bold text-coral text-sm">建议 {item.recommended} 件</span>
                    </div>
                    {item.warehouseStock && item.warehouseStock.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {item.warehouseStock.map((ws) => (
                          <span key={ws.name} className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-charcoal-light">
                            {ws.name}({ws.city}): {ws.stock}件
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center text-charcoal-light text-sm">暂无数据</div>
      )}
    </div>
  );
}
