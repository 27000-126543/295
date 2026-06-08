import { useEffect, useState } from "react";
import { ShoppingCart, BookOpen, Users, Baby, TrendingUp, CalendarDays, Package, DollarSign, Ticket } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminApi } from "@/utils/api";
import type { DashboardData, PredictionData } from "@/types";

const OVERVIEW_CARDS: { key: keyof DashboardData["overview"]; label: string; icon: typeof ShoppingCart; format: (v: number) => string }[] = [
  { key: "totalUsers", label: "用户总数", icon: Users, format: (v) => v.toLocaleString() },
  { key: "totalOrders", label: "订单总数", icon: ShoppingCart, format: (v) => v.toLocaleString() },
  { key: "totalRevenue", label: "总营收", icon: DollarSign, format: (v) => `¥${v.toLocaleString()}` },
  { key: "totalBabies", label: "宝宝总数", icon: Baby, format: (v) => v.toLocaleString() },
  { key: "totalCourses", label: "课程总数", icon: BookOpen, format: (v) => v.toLocaleString() },
  { key: "totalPosts", label: "社区帖子", icon: Users, format: (v) => v.toLocaleString() },
  { key: "totalTickets", label: "课程券", icon: Ticket, format: (v) => v.toLocaleString() },
];

const PIE_COLORS = ["#FF6B6B", "#4ECDC4", "#FFB347", "#87CEEB", "#DDA0DD"];

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

  const handleFilter = () => loadData();

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
              <option value="北京">北京</option>
              <option value="上海">上海</option>
              <option value="广州">广州</option>
              <option value="深圳">深圳</option>
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
              const value = dashboard.overview[card.key];
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">品类销售额</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dashboard.categorySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">课程预约量</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dashboard.courseBookings.map((b) => ({ name: b.courseName, value: b.bookings }))}
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
                  <span key={b.courseId} className="flex items-center gap-1 text-xs text-charcoal-light">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {b.courseName} {b.bookings}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {dashboard.recentOrders.length > 0 && (
            <div className="rounded-2xl bg-white p-4 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">近期订单</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">订单号</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">金额</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-gray-50">
                        <td className="py-2.5 text-charcoal">#{order.id}</td>
                        <td className="py-2.5 text-right text-charcoal">¥{order.total_amount.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-charcoal-light">{order.status}</td>
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
                <h3 className="text-sm font-semibold text-charcoal">推荐备货</h3>
              </div>
              <div className="space-y-2">
                {prediction.recommendedStock.map((item) => (
                  <p key={item.productId} className="text-sm text-charcoal-light">
                    • {item.productName}：建议备货 {item.recommended} 件
                  </p>
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
