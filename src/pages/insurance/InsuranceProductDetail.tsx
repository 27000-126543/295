import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, CheckCircle, User } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useInsuranceStore } from "@/store/insuranceStore";

export default function InsuranceProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProduct, loading, fetchProduct, purchase } = useInsuranceStore();
  const [insuredName, setInsuredName] = useState("");
  const [insuredId, setInsuredId] = useState("");
  const [selectedCoverage, setSelectedCoverage] = useState(0);

  useEffect(() => {
    if (id) fetchProduct(Number(id));
  }, [id, fetchProduct]);

  useEffect(() => {
    if (currentProduct) setSelectedCoverage(currentProduct.coverage_amount);
  }, [currentProduct]);

  if (loading || !currentProduct) {
    return (
      <div>
        <PageHeader title="保险详情" />
        <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>
      </div>
    );
  }

  const features = currentProduct.features ? currentProduct.features.split(",") : [];
  const premium = (currentProduct.premium * selectedCoverage) / currentProduct.coverage_amount;
  const isAccident = currentProduct.type === "accident";

  const handlePurchase = async () => {
    if (!insuredName.trim() || !insuredId.trim()) return;
    await purchase({
      product_id: currentProduct.id,
      insured_name: insuredName,
      insured_id: insuredId,
    });
    navigate("/insurance");
  };

  return (
    <div>
      <PageHeader title="保险详情" />

      <div className="px-4 pt-3 pb-24">
        <div className={`rounded-2xl overflow-hidden card-shadow bg-gradient-to-br ${isAccident ? "from-blue-400 to-blue-600" : "from-orange-400 to-orange-600"} p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-white/90" />
            <span className="text-xs text-white/80">{isAccident ? "意外险" : "重疾险"}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{currentProduct.name}</h2>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {currentProduct.coverage_amount > 10000
                ? `${currentProduct.coverage_amount / 10000}万`
                : currentProduct.coverage_amount}
            </span>
            <span className="text-sm text-white/80">保障金额</span>
          </div>
          {currentProduct.description && (
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {currentProduct.description}
            </p>
          )}
        </div>

        {features.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
            <h3 className="text-sm font-semibold text-charcoal mb-3">保障范围</h3>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-mint shrink-0" />
                  <span className="text-sm text-charcoal">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">保费计算</h3>
          <div className="flex items-center gap-2 mb-3">
            {[
              currentProduct.coverage_amount * 0.5,
              currentProduct.coverage_amount,
              currentProduct.coverage_amount * 2,
            ].map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedCoverage(amount)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                  selectedCoverage === amount
                    ? "bg-coral text-white"
                    : "bg-cream text-charcoal-light"
                }`}
              >
                {amount > 10000 ? `${amount / 10000}万` : amount}
              </button>
            ))}
          </div>
          <div className="text-center">
            <span className="text-charcoal-light text-sm">预估保费：</span>
            <span className="text-2xl font-bold text-coral">¥{Math.round(premium)}</span>
            <span className="text-xs text-charcoal-light">/年</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">被保人信息</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-charcoal-light shrink-0" />
              <input
                type="text"
                value={insuredName}
                onChange={(e) => setInsuredName(e.target.value)}
                placeholder="被保人姓名"
                className="flex-1 rounded-xl bg-cream px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-charcoal-light shrink-0" />
              <input
                type="text"
                value={insuredId}
                onChange={(e) => setInsuredId(e.target.value)}
                placeholder="身份证号"
                className="flex-1 rounded-xl bg-cream px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading || !insuredName.trim() || !insuredId.trim()}
          className="mt-6 w-full btn-gradient disabled:opacity-40"
        >
          立即投保 ¥{Math.round(premium)}/年
        </button>
      </div>
    </div>
  );
}
