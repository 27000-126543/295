import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useShopStore } from "@/store/shopStore";
import PageHeader from "@/components/PageHeader";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, fetchCart, updateCartItem, removeCartItem, cartTotal, createOrder } = useShopStore();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const ids = new Set(cart.map((item) => item.id));
    setSelectedIds(ids);
  }, [cart]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === cart.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.map((item) => item.id)));
    }
  };

  const allSelected = cart.length > 0 && selectedIds.size === cart.length;

  const selectedItems = cart.filter((item) => selectedIds.has(item.id));
  const total = selectedItems.reduce(
    (sum, item) => sum + (item.product_price || item.product?.price || 0) * item.quantity,
    0
  );

  const handleQuantity = async (id: number, qty: number) => {
    if (qty < 1) return;
    await updateCartItem(id, qty);
  };

  const handleRemove = async (id: number) => {
    await removeCartItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) return;
    setLoading(true);
    try {
      await createOrder({
        addressId: 0,
        items: selectedItems,
        paymentMethod: "wechat",
      });
      navigate("/shop/orders");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <PageHeader title="购物车" />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cream-dark">
            <ShoppingCart className="h-10 w-10 text-charcoal-light/40" />
          </div>
          <p className="text-sm text-charcoal-light">购物车是空的</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 rounded-xl bg-coral px-6 py-2 text-sm font-medium text-white"
          >
            去逛逛
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <PageHeader title="购物车" />

      <div className="px-4 pt-2 space-y-3">
        {cart.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl bg-white p-3 card-shadow"
            >
              <button
                onClick={() => toggleSelect(item.id)}
                className={`mt-4 h-5 w-5 shrink-0 rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-coral bg-coral"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isSelected && (
                  <svg viewBox="0 0 20 20" className="h-full w-full text-white">
                    <path
                      fill="currentColor"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                )}
              </button>

              <div
                className="h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-cream-dark"
                onClick={() => navigate(`/shop/product/${item.product_id}`)}
              >
                {item.product_image || item.product?.image ? (
                  <img
                    src={item.product_image || item.product?.image}
                    alt={item.product_name || item.product?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🍼</div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="line-clamp-1 text-sm font-medium text-charcoal">
                    {item.product_name || item.product?.name}
                  </p>
                  {item.spec && (
                    <p className="mt-0.5 text-xs text-charcoal-light">{item.spec}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-coral">
                    ¥{item.product_price || item.product?.price}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-cream"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-cream"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-1 flex h-6 w-6 items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-charcoal-light" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={toggleAll} className="flex items-center gap-2">
            <div
              className={`h-5 w-5 rounded-full border-2 transition-all ${
                allSelected ? "border-coral bg-coral" : "border-gray-300 bg-white"
              }`}
            >
              {allSelected && (
                <svg viewBox="0 0 20 20" className="h-full w-full text-white">
                  <path
                    fill="currentColor"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-charcoal">全选</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-charcoal">
              合计：<span className="font-bold text-coral">¥{total.toFixed(2)}</span>
            </span>
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0 || loading}
              className="rounded-xl bg-coral px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.97]"
            >
              去结算({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
