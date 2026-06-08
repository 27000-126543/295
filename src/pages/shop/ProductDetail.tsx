import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Check, MapPin, Package } from "lucide-react";
import { shopApi } from "@/utils/api";
import { useShopStore } from "@/store/shopStore";
import type { Product } from "@/types";
import PageHeader from "@/components/PageHeader";

const SPEC_MAP: Record<string, string[]> = {
  奶粉: ["一段(0-6月)", "二段(6-12月)", "三段(12-36月)"],
  尿布: ["NB", "S", "M", "L", "XL"],
  服饰: ["66cm", "73cm", "80cm", "90cm", "100cm"],
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useShopStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSpecPanel, setShowSpecPanel] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    shopApi
      .product(Number(id))
      .then((p) => {
        setProduct(p);
        const specs = SPEC_MAP[p.category];
        if (specs) setSelectedSpec(specs[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const specs = product ? SPEC_MAP[product.category] || [] : [];
  const count = cartCount();

  const formatAge = (min?: number, max?: number) => {
    if (min == null) return null;
    if (max == null) return `${min}月+`;
    return `${min}-${max}月`;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity, selectedSpec || undefined);
    setShowSpecPanel(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product.id, quantity, selectedSpec || undefined);
    navigate("/shop/cart");
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="商品详情" />
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <PageHeader title="商品详情" />
        <div className="p-4 text-center text-charcoal-light">商品不存在</div>
      </div>
    );
  }

  const ageLabel = formatAge(product.age_min, product.age_max);

  return (
    <div className="pb-20">
      <PageHeader
        title="商品详情"
        right={
          <button onClick={() => navigate("/shop/cart")} className="relative p-1">
            <ShoppingCart className="h-5 w-5 text-charcoal-light" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        }
      />

      <div className="aspect-square bg-cream-dark overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🍼</div>
        )}
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 card-shadow">
          <h1 className="text-lg font-bold text-charcoal">{product.name}</h1>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-coral">¥{product.price}</span>
            {product.original_price && (
              <span className="text-sm text-charcoal-light line-through">
                ¥{product.original_price}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {ageLabel && (
              <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-medium text-mint-dark">
                {ageLabel}
              </span>
            )}
            <span className="text-xs text-charcoal-light">已售 {product.sales}</span>
            <span className="text-xs text-charcoal-light">库存 {product.totalWarehouseStock ?? product.stock}</span>
          </div>
        </div>

        {product.expectedWarehouse && (
          <div className="mt-3 rounded-2xl bg-mint/5 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-mint" />
              <span className="text-sm font-medium text-charcoal">预计发货仓</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-mint" />
              <span className="text-sm text-charcoal-light">{product.expectedWarehouse.name}（{product.expectedWarehouse.city}）</span>
              <span className="text-xs text-mint">库存 {product.expectedWarehouse.stock} 件</span>
            </div>
          </div>
        )}

        {product.warehouseStock && product.warehouseStock.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
            <p className="text-sm font-medium text-charcoal mb-2">各仓库存</p>
            <div className="space-y-1.5">
              {product.warehouseStock.map((ws) => (
                <div key={ws.warehouse_name} className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-light">{ws.warehouse_name}（{ws.warehouse_city}）</span>
                  <span className={`text-xs font-medium ${ws.stock > 20 ? 'text-green-500' : ws.stock > 5 ? 'text-amber-500' : 'text-red-500'}`}>{ws.stock} 件</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {specs.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
            <p className="text-sm font-medium text-charcoal mb-2">规格选择</p>
            <div className="flex flex-wrap gap-2">
              {specs.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  className={`relative rounded-xl px-4 py-2 text-sm transition-all ${
                    selectedSpec === spec
                      ? "bg-coral/10 text-coral font-medium ring-1 ring-coral"
                      : "bg-cream text-charcoal-light"
                  }`}
                >
                  {spec}
                  {selectedSpec === spec && (
                    <Check className="absolute -right-1 -top-1 h-3.5 w-3.5 text-white bg-coral rounded-full p-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
            <p className="text-sm font-medium text-charcoal mb-2">商品描述</p>
            <p className="text-sm text-charcoal-light leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-gray-100">
        <button
          onClick={() => navigate("/shop/cart")}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream"
        >
          <ShoppingCart className="h-5 w-5 text-charcoal-light" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
        <button
          onClick={handleAddToCart}
          className="h-11 flex-1 rounded-xl bg-coral font-semibold text-white transition-all active:scale-[0.97]"
        >
          加入购物车
        </button>
        <button
          onClick={handleBuyNow}
          className="h-11 flex-1 btn-gradient"
        >
          立即购买
        </button>
      </div>

      {showSpecPanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowSpecPanel(false)}>
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-charcoal">选择规格</p>
              <button onClick={() => setShowSpecPanel(false)} className="text-charcoal-light text-lg">×</button>
            </div>
            {specs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {specs.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpec(spec)}
                    className={`rounded-xl px-4 py-2 text-sm ${
                      selectedSpec === spec ? "bg-coral/10 text-coral ring-1 ring-coral" : "bg-cream text-charcoal-light"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-charcoal">数量</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button onClick={handleAddToCart} className="w-full btn-gradient">
              确认
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
