import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CircleDot,
  AlertTriangle,
  Warehouse,
  RotateCcw,
} from "lucide-react";
import { useShopStore } from "@/store/shopStore";
import PageHeader from "@/components/PageHeader";
import { afterSaleApi } from "@/utils/api";
import type { Order, LogisticsRecord, AfterSale } from "@/types";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "待付款", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-5 w-5" /> },
  paid: { label: "待发货", color: "bg-blue-100 text-blue-700", icon: <Package className="h-5 w-5" /> },
  shipped: { label: "运输中", color: "bg-mint/15 text-mint-dark", icon: <Truck className="h-5 w-5" /> },
  delivered: { label: "已完成", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-5 w-5" /> },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500", icon: <Package className="h-5 w-5" /> },
  delivery_failed: { label: "发货失败", color: "bg-red-100 text-red-600", icon: <AlertTriangle className="h-5 w-5" /> },
};

function LogisticsTimeline({ records }: { records: LogisticsRecord[] }) {
  if (records.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
      <p className="text-sm font-medium text-charcoal mb-3">物流追踪</p>
      <div className="relative">
        {records.map((record, idx) => {
          const isCurrent = idx === 0;
          const isLast = idx === records.length - 1;
          const d = new Date(record.created_at);
          const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

          return (
            <div key={record.id} className="relative flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isCurrent
                      ? "bg-coral text-white shadow-coral"
                      : "bg-cream-dark text-charcoal-light"
                  }`}
                >
                  {isCurrent ? (
                    <CircleDot className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-charcoal-light/40" />
                  )}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-gray-200 mt-1" />
                )}
              </div>
              <div className="flex-1 -mt-0.5">
                <p className={`text-sm ${isCurrent ? "font-semibold text-charcoal" : "text-charcoal-light"}`}>
                  {record.description}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-charcoal-light">{timeStr}</span>
                  {record.location && (
                    <span className="flex items-center gap-0.5 text-xs text-charcoal-light">
                      <MapPin className="h-3 w-3" />
                      {record.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentOrder, fetchOrder } = useShopStore();
  const [showAfterSale, setShowAfterSale] = useState(false);
  const [asForm, setAsForm] = useState({ type: "refund", reason: "", product_id: 0, quantity: 1 });

  useEffect(() => {
    if (id) fetchOrder(Number(id));
  }, [id, fetchOrder]);

  const handleSubmitAfterSale = async () => {
    if (!id || !asForm.product_id || !asForm.quantity) {
      alert("请选择商品和数量");
      return;
    }
    try {
      await afterSaleApi.create(Number(id), asForm);
      setShowAfterSale(false);
      fetchOrder(Number(id));
    } catch (e: any) {
      alert(e.message || "申请失败");
    }
  };

  if (!currentOrder) {
    return (
      <div>
        <PageHeader title="订单详情" />
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        </div>
      </div>
    );
  }

  const order = currentOrder;
  const statusCfg = STATUS_MAP[order.status] || STATUS_MAP.cancelled;
  const logistics = (order as Order & { logistics?: LogisticsRecord[] }).logistics || [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="pb-6">
      <PageHeader title="订单详情" />

      <div className="px-4 pt-2">
        <div className={`rounded-2xl p-4 card-shadow flex items-center gap-3 ${statusCfg.color}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/30">
            {statusCfg.icon}
          </div>
          <div>
            <p className="text-lg font-bold">{statusCfg.label}</p>
            <p className="text-xs opacity-80">订单号：{order.id}</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <div>
              <p className="text-sm font-medium text-charcoal">收货地址</p>
              <p className="mt-1 text-sm text-charcoal-light">{order.address}</p>
              {order.city && (
                <p className="text-xs text-charcoal-light">{order.city}</p>
              )}
            </div>
          </div>
          {order.warehouse && (
            <div className="mt-2 flex items-center gap-2 border-t border-gray-50 pt-2">
              <Warehouse className="h-4 w-4 text-mint" />
              <span className="text-xs text-charcoal-light">发货仓：{order.warehouse}</span>
            </div>
          )}
        </div>

        <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
          <p className="text-sm font-medium text-charcoal mb-3">商品清单</p>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-dark">
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">🍼</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <p className="line-clamp-1 text-sm font-medium text-charcoal">
                    {item.product?.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-coral">¥{item.price}</span>
                    <span className="text-xs text-charcoal-light">
                      {item.spec && `${item.spec} · `}×{item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <LogisticsTimeline records={logistics} />

        <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
          <p className="text-sm font-medium text-charcoal mb-3">订单金额</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-light">商品总额</span>
              <span className="text-sm text-charcoal">
                ¥{order.items?.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-light">运费</span>
              <span className="text-sm text-charcoal">¥0.00</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-50 pt-2">
              <span className="text-sm font-medium text-charcoal">实付金额</span>
              <span className="text-base font-bold text-coral">
                ¥{order.total_amount}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
            <span className="text-xs text-charcoal-light">
              下单时间：{formatDate(order.created_at)}
            </span>
            {order.payment_method && (
              <span className="text-xs text-charcoal-light">
                支付方式：{order.payment_method}
              </span>
            )}
          </div>
        </div>

        {(order.status === 'shipped' || order.status === 'delivered') && (
          <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="h-4 w-4 text-coral" />
              <p className="text-sm font-medium text-charcoal">售后申请</p>
            </div>
            {order.afterSales && order.afterSales.length > 0 && (
              <div className="mb-3 space-y-2">
                {order.afterSales.map((as: AfterSale) => (
                  <div key={as.id} className="rounded-xl bg-cream p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal">{as.product_name || `商品#${as.product_id}`} × {as.quantity}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        as.status === 'approved' ? 'bg-green-100 text-green-600' :
                        as.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {as.status === 'approved' ? '已通过' : as.status === 'rejected' ? '已驳回' : '待处理'}
                      </span>
                    </div>
                    <span className="text-charcoal-light">
                      {as.type === 'refund' ? '退款' : as.type === 'return_refund' ? '退货退款' : '换货'}
                      {as.refund_amount > 0 ? ` ¥${as.refund_amount}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!showAfterSale ? (
              <button
                onClick={() => setShowAfterSale(true)}
                className="w-full rounded-xl bg-coral/10 py-2.5 text-sm font-medium text-coral hover:bg-coral/20 transition-colors"
              >
                申请售后
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-charcoal-light">售后类型</label>
                  <select
                    value={asForm.type}
                    onChange={(e) => setAsForm({ ...asForm, type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral"
                  >
                    <option value="refund">仅退款</option>
                    <option value="return_refund">退货退款</option>
                    <option value="exchange">换货</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-charcoal-light">选择商品</label>
                  <select
                    value={asForm.product_id}
                    onChange={(e) => setAsForm({ ...asForm, product_id: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral"
                  >
                    <option value={0}>请选择</option>
                    {order.items?.map((item) => (
                      <option key={item.product_id} value={item.product_id}>
                        {item.product?.name || `商品#${item.product_id}`} (购买{item.quantity}件)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-charcoal-light">数量</label>
                  <input
                    type="number"
                    min={1}
                    value={asForm.quantity}
                    onChange={(e) => setAsForm({ ...asForm, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="text-xs text-charcoal-light">原因</label>
                  <textarea
                    value={asForm.reason}
                    onChange={(e) => setAsForm({ ...asForm, reason: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-coral resize-none"
                    placeholder="请描述售后原因"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAfterSale(false)}
                    className="flex-1 rounded-xl bg-gray-100 py-2 text-sm text-charcoal-light hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitAfterSale}
                    className="flex-1 rounded-xl bg-coral py-2 text-sm text-white hover:bg-coral-dark transition-colors"
                  >
                    提交
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
