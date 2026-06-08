import { useEffect, useState } from "react";
import { Download, Package, BookOpen, BarChart3, Calendar, TrendingUp, MapPin, Warehouse } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { adminApi } from "@/utils/api";
import type { PredictionData, ReportData } from "@/types";

const PIE_COLORS = ["#FF6B6B", "#4ECDC4", "#FFB347", "#87CEEB", "#DDA0DD"];

export default function AdminPrediction() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pred, rep] = await Promise.all([adminApi.prediction(), adminApi.report()]);
      setPrediction(pred);
      setReport(rep);
    } catch { /* */ }
    setLoading(false);
  };

  const handleExport = () => {
    if (!report) return;
    const csvRows = [
      ["品类", "营收", "占比"].join(","),
      ...report.categoryRevenue.map((r) => [r.category, r.revenue, `${r.percentage}%`].join(",")),
      "",
      ["指标", "数值"].join(","),
      ["总营收", report.summary.totalRevenue].join(","),
      ["总订单", report.summary.totalOrders].join(","),
      ["客单价", report.summary.avgOrderValue].join(","),
      ["课程完课率", `${report.summary.courseCompletionRate}%`].join(","),
      ["用户满意度", String(report.summary.userSatisfaction)].join(","),
      ["保险赔付率", `${report.summary.insuranceClaimRate}%`].join(","),
    ];
    if (report.cityReport && report.cityReport.length > 0) {
      csvRows.push("", ["城市运营对比"].join(","), ["城市", "订单量", "营收", "平均配送时效(天)", "缺货次数"].join(","));
      for (const c of report.cityReport) {
        csvRows.push([c.city, c.orderCount, c.revenue, c.avgDeliveryDays, c.stockoutCount].join(","));
      }
    }
    if (report.warehouseReport && report.warehouseReport.length > 0) {
      csvRows.push("", ["仓库履约分析"].join(","), ["仓库名", "城市", "总库存", "SKU数", "订单量"].join(","));
      for (const w of report.warehouseReport) {
        csvRows.push([w.name, w.city, w.totalStock, w.productCount, w.orderCount].join(","));
      }
    }
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "运营报表.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {prediction && (
        <>
          <div className="rounded-2xl bg-white p-5 card-shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-coral" />
              <h3 className="text-sm font-semibold text-charcoal">营收预测</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={prediction.revenuePredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="current_revenue" fill="#4ECDC4" name="当前营收" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted_revenue" fill="#FF6B6B" name="预测营收" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl bg-white p-5 card-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-coral" />
              <h3 className="text-sm font-semibold text-charcoal">推荐备货（仓库维度）</h3>
            </div>
            <div className="space-y-3">
              {prediction.recommendedStock.map((item, i) => (
                <div key={i} className="rounded-xl bg-cream p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-[10px] text-charcoal-light">{item.category} · 总库存{item.stock} · 销量{item.sales}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-coral">建议 {item.recommended} 件</p>
                      <p className={`text-[10px] ${item.stock_status === "紧急补货" ? "text-red-500" : item.stock_status === "建议补货" ? "text-amber-500" : "text-green-500"}`}>{item.stock_status}</p>
                    </div>
                  </div>
                  {item.warehouseStock && item.warehouseStock.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.warehouseStock.map((ws) => (
                        <span key={ws.name} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-charcoal-light">
                          {ws.name}({ws.city}): {ws.stock}件
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {prediction.coursePredictions.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-mint" />
                <h3 className="text-sm font-semibold text-charcoal">热门课程预测</h3>
              </div>
              <div className="space-y-3">
                {prediction.coursePredictions.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-cream p-3">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{c.name}</p>
                      <p className="text-[10px] text-charcoal-light">{c.category} · 当前预约 {c.currentBookings}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-charcoal">预测 {c.predictedBookings}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${c.suggestion === "增加排课" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>{c.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prediction.holidayImpact.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-charcoal">节假日影响</h3>
              </div>
              <div className="space-y-3">
                {prediction.holidayImpact.map((h, i) => (
                  <div key={i} className="rounded-xl bg-cream p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className={`h-4 w-4 ${h.impactType === "inventory_up" ? "text-coral" : "text-mint"}`} />
                      <p className="text-sm font-medium text-charcoal">{h.name}</p>
                    </div>
                    <p className="text-xs text-charcoal-light mb-2">{h.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {h.affectedCategories.map((cat) => (
                        <span key={cat} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-charcoal-light">{cat}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prediction.cityComparison && prediction.cityComparison.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
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
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">配送时效</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">缺货次数</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={prediction.cityComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="orderCount" fill="#4ECDC4" name="订单量" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stockoutCount" fill="#FF6B6B" name="缺货次数" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {prediction.warehouseLoad && prediction.warehouseLoad.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Warehouse className="h-5 w-5 text-mint" />
                <h3 className="text-sm font-semibold text-charcoal">仓库履约分析</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">仓库</th>
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">城市</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">总库存</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">SKU</th>
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

          {prediction.ageDistribution.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-mint" />
                <h3 className="text-sm font-semibold text-charcoal">宝宝年龄分布</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={prediction.ageDistribution.map((d) => ({ name: d.age_group, value: d.count }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" startAngle={90} endAngle={-270}>
                    {prediction.ageDistribution.map((_, index) => (<Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {prediction.ageDistribution.map((d, i) => (
                  <span key={d.age_group} className="flex items-center gap-1 text-xs text-charcoal-light">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.age_group} ({d.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {report && (
        <>
          <div className="rounded-2xl bg-white p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-charcoal">月度运营报表</h3>
              <button onClick={handleExport} className="flex items-center gap-1.5 rounded-xl bg-coral/10 px-3 py-1.5 text-xs font-medium text-coral hover:bg-coral/20 transition-colors">
                <Download className="h-3.5 w-3.5" />
                导出报表
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-cream p-3 text-center">
                <p className="text-lg font-bold text-coral">¥{report.summary.totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] text-charcoal-light">总营收</p>
              </div>
              <div className="rounded-xl bg-cream p-3 text-center">
                <p className="text-lg font-bold text-mint">{report.summary.totalOrders}</p>
                <p className="text-[10px] text-charcoal-light">总订单</p>
              </div>
              <div className="rounded-xl bg-cream p-3 text-center">
                <p className="text-lg font-bold text-blue-500">¥{report.summary.avgOrderValue}</p>
                <p className="text-[10px] text-charcoal-light">客单价</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-cream p-3 text-center">
                <p className="text-lg font-bold text-mint">{report.summary.courseCompletionRate}%</p>
                <p className="text-[10px] text-charcoal-light">课程完课率</p>
              </div>
              <div className="rounded-xl bg-cream p-3 text-center">
                <p className="text-lg font-bold text-amber-500">⭐{report.summary.userSatisfaction}</p>
                <p className="text-[10px] text-charcoal-light">用户满意度</p>
              </div>
              <div className="rounded-xl bg-cream p-3 text-center">
                <p className="text-lg font-bold text-blue-500">{report.summary.insuranceClaimRate}%</p>
                <p className="text-[10px] text-charcoal-light">保险赔付率</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 text-left text-xs font-medium text-charcoal-light">品类</th>
                    <th className="py-2 text-right text-xs font-medium text-charcoal-light">营收</th>
                    <th className="py-2 text-right text-xs font-medium text-charcoal-light">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categoryRevenue.map((item) => (
                    <tr key={item.category} className="border-b border-gray-50">
                      <td className="py-2.5 text-charcoal">{item.category}</td>
                      <td className="py-2.5 text-right text-charcoal">¥{item.revenue.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-charcoal-light">{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {report.cityReport && report.cityReport.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-coral" />
                <h3 className="text-sm font-semibold text-charcoal">城市对比</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">城市</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">订单量</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">营收</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">平均配送时效</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">缺货次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.cityReport.map((c) => (
                      <tr key={c.city} className="border-b border-gray-50">
                        <td className="py-2.5 text-charcoal">{c.city}</td>
                        <td className="py-2.5 text-right text-charcoal">{c.orderCount}</td>
                        <td className="py-2.5 text-right text-charcoal">¥{c.revenue.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-charcoal-light">{c.avgDeliveryDays}天</td>
                        <td className="py-2.5 text-right text-charcoal-light">{c.stockoutCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.warehouseReport && report.warehouseReport.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Warehouse className="h-5 w-5 text-mint" />
                <h3 className="text-sm font-semibold text-charcoal">仓库履约</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">仓库</th>
                      <th className="py-2 text-left text-xs font-medium text-charcoal-light">城市</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">库存</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">SKU</th>
                      <th className="py-2 text-right text-xs font-medium text-charcoal-light">订单量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.warehouseReport.map((w) => (
                      <tr key={w.name} className="border-b border-gray-50">
                        <td className="py-2.5 text-charcoal">{w.name}</td>
                        <td className="py-2.5 text-charcoal-light">{w.city}</td>
                        <td className="py-2.5 text-right text-charcoal">{w.totalStock}</td>
                        <td className="py-2.5 text-right text-charcoal-light">{w.productCount}</td>
                        <td className="py-2.5 text-right text-charcoal">{w.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.courseStats.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-mint" />
                <h3 className="text-sm font-semibold text-charcoal">课程统计</h3>
              </div>
              <div className="space-y-3">
                {report.courseStats.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-cream p-3">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{c.name}</p>
                      <p className="text-[10px] text-charcoal-light">{c.category} · 已预约{c.total_booked}/容量{c.total_capacity}</p>
                    </div>
                    <p className="text-sm font-bold text-mint">{c.completionRate}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.orderStatusDist.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">订单状态分布</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.orderStatusDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {report.topProducts.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">热销商品</h3>
              <div className="space-y-3">
                {report.topProducts.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-cream p-3">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-[10px] text-charcoal-light">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-coral">{item.total_sold} 件</p>
                      <p className="text-[10px] text-charcoal-light">¥{item.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.monthlyTrend.length > 0 && (
            <div className="rounded-2xl bg-white p-5 card-shadow">
              <h3 className="text-sm font-semibold text-charcoal mb-4">月度趋势</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={report.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {!prediction && !report && (
        <div className="py-20 text-center text-charcoal-light text-sm">暂无数据</div>
      )}
    </div>
  );
}
