import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, FileText, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useInsuranceStore } from "@/store/insuranceStore";

export default function Insurance() {
  const { products, claims, loading, fetchProducts, fetchClaims } = useInsuranceStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchClaims();
  }, [fetchProducts, fetchClaims]);

  const getGradient = (type: string) => {
    if (type === "accident") return "from-blue-400 to-blue-600";
    return "from-orange-400 to-orange-600";
  };

  return (
    <div>
      <PageHeader title="母婴保险" showBack={false} />

      <div className="px-4 pt-3 pb-24">
        <div className="space-y-3">
          {loading && products.length === 0 ? (
            <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-charcoal-light text-sm">暂无保险产品</div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/insurance/product/${product.id}`)}
                className="cursor-pointer rounded-2xl overflow-hidden card-shadow-hover"
              >
                <div className={`bg-gradient-to-br ${getGradient(product.type)} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-white/90" />
                    <span className="text-xs text-white/80 font-medium">
                      {product.type === "accident" ? "意外险" : "重疾险"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {product.coverage_amount > 10000
                        ? `${product.coverage_amount / 10000}万`
                        : product.coverage_amount}
                    </span>
                    <span className="text-sm text-white/80">保障金额</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-white/70">保费</span>
                      <span className="ml-1 text-lg font-semibold text-white">
                        ¥{product.premium}
                      </span>
                      <span className="text-xs text-white/70">/年起</span>
                    </div>
                    <button className="rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors">
                      立即投保
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {claims.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => navigate("/insurance/claims")}
              className="w-full flex items-center justify-between rounded-2xl bg-white p-4 card-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-mint/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">我的理赔</p>
                  <p className="text-xs text-charcoal-light">
                    {claims.length} 条理赔记录
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-charcoal-light" />
            </button>
          </div>
        )}

        <button
          onClick={() => navigate("/insurance/claim")}
          className="mt-3 w-full rounded-2xl bg-white p-4 card-shadow flex items-center justify-center gap-2 text-coral text-sm font-medium"
        >
          <FileText className="h-4 w-4" />
          申请理赔
        </button>
      </div>
    </div>
  );
}
