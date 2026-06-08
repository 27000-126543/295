import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, CreditCard, AlertTriangle } from "lucide-react";
import { useShopStore } from "@/store/shopStore";
import type { Order } from "@/types";
import PageHeader from "@/components/PageHeader";

const TABS = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待付款" },
  { key: "paid", label: "待发货" },
  { key: "shipped", label: "待收货" },
  { key: "delivered", label: "已完成" },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "待付款", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-3.5 w-3.5" /> },
  paid: { label: "待发货", color: "bg-blue-100 text-blue-700", icon: <CreditCard className="h-3.5 w-3.5" /> },
  shipped: { label: "待收货", color: "bg-mint/15 text-mint-dark", icon: <Truck className="h-3.5 w-3.5" /> },
  delivered: { label: "已完成", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500", icon: <Package className="h-3.5 w-3.5" /> },
  delivery_failed: { label: "发货失败", color: "bg-red-100 text-red-600", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

export default function OrderList() {
  const navigate = useNavigate();
  const { orders, fetchOrders } = useShopStore();
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      <PageHeader title="我的订单" />

      <div className="flex border-b border-gray-100 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === tab.key ? "text-coral" : "text-charcoal-light"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-coral" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 card-shadow text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-charcoal-light/30" />
            <p className="text-sm text-charcoal-light">暂无订单</p>
          </div>
        ) : (
          filtered.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.cancelled;
            const itemPreview = order.items?.slice(0, 3) || [];
            const moreCount = (order.items?.length || 0) - 3;

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/shop/order/${order.id}`)}
                className="rounded-2xl bg-white p-4 card-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-charcoal-light">
                    订单号：{order.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}>
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {itemPreview.map((item, idx) => (
                    <div
                      key={idx}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-dark"
                    >
                      {item.product?.image ? (
                        <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">🍼</div>
                      )}
                    </div>
                  ))}
                  {moreCount > 0 && (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-cream text-xs text-charcoal-light">
                      +{moreCount}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-charcoal">
                      {order.items?.map((i) => i.product?.name).join("、")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                  <span className="text-xs text-charcoal-light">
                    {formatDate(order.created_at)}
                  </span>
                  <span className="text-sm">
                    共{order.items?.length || 0}件 合计：
                    <span className="font-bold text-coral">¥{order.total_amount}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
