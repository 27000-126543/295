import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { useShopStore } from "@/store/shopStore";
import PageHeader from "@/components/PageHeader";

const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "奶粉", label: "奶粉" },
  { key: "尿布", label: "尿布" },
  { key: "玩具", label: "玩具" },
  { key: "辅食", label: "辅食" },
  { key: "洗护", label: "洗护" },
  { key: "服饰", label: "服饰" },
];

export default function Shop() {
  const navigate = useNavigate();
  const { products, loading, fetchProducts, cartCount } = useShopStore();
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const count = cartCount();

  useEffect(() => {
    fetchProducts({ category: activeCategory || undefined, keyword: keyword || undefined });
  }, [activeCategory, keyword, fetchProducts]);

  const handleSearch = () => {
    fetchProducts({ category: activeCategory || undefined, keyword: keyword || undefined });
  };

  const formatAge = (min?: number, max?: number) => {
    if (min == null) return null;
    if (max == null) return `${min}月+`;
    return `${min}-${max}月`;
  };

  return (
    <div>
      <PageHeader
        title="母婴商城"
        showBack={false}
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

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 card-shadow mb-3">
          <Search className="h-4 w-4 text-charcoal-light shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索商品..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-charcoal-light/60"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-coral text-white shadow-coral"
                  : "bg-white text-charcoal-light card-shadow"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && products.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 card-shadow text-center">
            <p className="text-charcoal-light text-sm">暂无商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const ageLabel = formatAge(product.age_min, product.age_max);
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/shop/product/${product.id}`)}
                  className="rounded-2xl bg-white card-shadow-hover overflow-hidden cursor-pointer"
                >
                  <div className="aspect-square bg-cream-dark overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        🍼
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium text-charcoal leading-tight">
                      {product.name}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-coral">
                        ¥{product.price}
                      </span>
                      {product.original_price && (
                        <span className="text-xs text-charcoal-light line-through">
                          ¥{product.original_price}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      {ageLabel && (
                        <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-medium text-mint-dark">
                          {ageLabel}
                        </span>
                      )}
                      <span className="text-[10px] text-charcoal-light">
                        已售{product.sales}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
