import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useInsuranceStore } from "@/store/insuranceStore";
import type { Claim } from "@/types";

const STATUS_MAP: Record<Claim["status"], { label: string; color: string }> = {
  initial_review: { label: "初审中", color: "bg-orange-100 text-orange-600" },
  escalated: { label: "复核中", color: "bg-purple-100 text-purple-600" },
  approved: { label: "已通过", color: "bg-green-100 text-green-600" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-600" },
  paid: { label: "已赔付", color: "bg-blue-100 text-blue-600" },
};

export default function ClaimList() {
  const { claims, fetchClaims } = useInsuranceStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return (
    <div>
      <PageHeader title="我的理赔" />

      <div className="px-4 pt-3 pb-24">
        {claims.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="h-12 w-12 text-charcoal-light/30 mx-auto mb-3" />
            <p className="text-sm text-charcoal-light">暂无理赔记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => {
              const status = STATUS_MAP[claim.status];
              return (
                <div
                  key={claim.id}
                  onClick={() => navigate(`/insurance/claims`)}
                  className="rounded-2xl bg-white p-4 card-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-charcoal-light">
                      保单号：{claim.policy_id}
                    </span>
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-charcoal">
                        ¥{claim.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-charcoal-light mt-1">
                        {claim.policy?.product?.name || "保险理赔"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-charcoal-light">申请时间</p>
                      <p className="text-xs text-charcoal mt-0.5">{claim.created_at}</p>
                    </div>
                  </div>
                  {claim.review_note && (
                    <div className="mt-2 rounded-xl bg-cream p-2">
                      <p className="text-xs text-charcoal-light">{claim.review_note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
