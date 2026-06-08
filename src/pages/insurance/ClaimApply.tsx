import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, ChevronDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useInsuranceStore } from "@/store/insuranceStore";

export default function ClaimApply() {
  const { policies, claims, fetchClaims, createClaim, loading } = useInsuranceStore();
  const navigate = useNavigate();
  const [policyId, setPolicyId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [showPolicyPicker, setShowPolicyPicker] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const activePolicies = policies.filter((p) => p.status === "active");

  const handleAddDocument = () => {
    if (documents.length >= 5) return;
    setDocuments((prev) => [...prev, `doc_${Date.now()}.pdf`]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!policyId || !amount || !description) return;
    await createClaim({
      policy_id: policyId,
      amount: Number(amount),
      description,
      documents,
    });
    navigate("/insurance/claims");
  };

  const selectedPolicy = policies.find((p) => p.id === policyId);

  return (
    <div>
      <PageHeader title="理赔申请" />

      <div className="px-4 pt-3 pb-24">
        <div className="rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">选择保单</h3>
          <button
            onClick={() => setShowPolicyPicker(!showPolicyPicker)}
            className="w-full flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm"
          >
            <span className={selectedPolicy ? "text-charcoal" : "text-charcoal-light/50"}>
              {selectedPolicy
                ? `${selectedPolicy.insured_name} - ${selectedPolicy.product?.name || "保单"}`
                : "请选择保单"}
            </span>
            <ChevronDown className={`h-4 w-4 text-charcoal-light transition-transform ${showPolicyPicker ? "rotate-180" : ""}`} />
          </button>
          {showPolicyPicker && (
            <div className="mt-2 space-y-1">
              {activePolicies.length > 0 ? (
                activePolicies.map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() => {
                      setPolicyId(policy.id);
                      setShowPolicyPicker(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                      policyId === policy.id
                        ? "bg-coral/10 text-coral"
                        : "hover:bg-cream text-charcoal"
                    }`}
                  >
                    <p className="font-medium">{policy.insured_name}</p>
                    <p className="text-xs text-charcoal-light mt-0.5">
                      {policy.product?.name} · ¥{policy.premium}/年
                    </p>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-charcoal-light">暂无可理赔保单</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">理赔金额</h3>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-light text-sm">¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入理赔金额"
              className="w-full rounded-xl bg-cream pl-8 pr-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">就诊资料</h3>
          <div className="grid grid-cols-3 gap-2">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl bg-cream-dark flex flex-col items-center justify-center"
              >
                <FileText className="h-6 w-6 text-charcoal-light" />
                <span className="mt-1 text-[10px] text-charcoal-light">资料{idx + 1}</span>
                <button
                  onClick={() => handleRemoveDocument(idx)}
                  className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/30 text-white text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {documents.length < 5 && (
              <button
                onClick={handleAddDocument}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-coral/40 transition-colors"
              >
                <Upload className="h-5 w-5 text-charcoal-light" />
                <span className="text-[10px] text-charcoal-light">上传</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">理赔描述</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请描述理赔原因和经过..."
            rows={4}
            className="w-full rounded-xl bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !policyId || !amount || !description}
          className="mt-6 w-full btn-gradient disabled:opacity-40"
        >
          提交理赔申请
        </button>
      </div>
    </div>
  );
}
