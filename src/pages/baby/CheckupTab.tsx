import { ClipboardCheck, CheckCircle } from "lucide-react";
import { useBabyStore } from "@/store/babyStore";
import type { CheckupPlan } from "@/types";

export default function CheckupTab() {
  const { checkupPlan } = useBabyStore();

  const sorted = [...checkupPlan].sort((a, b) => a.monthAge - b.monthAge);

  return (
    <div>
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-charcoal-light">
          <ClipboardCheck className="mb-3 h-10 w-10 text-coral/30" />
          <p className="text-sm">暂无体检计划</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((plan: CheckupPlan) => {
            const isDone = plan.monthAge <= 0;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl bg-white p-4 card-shadow ${isDone ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-charcoal">{plan.name}</h4>
                      {isDone && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="mt-1 text-xs text-charcoal-light">
                      推荐时间：{plan.monthAge > 0 ? `${plan.monthAge}月龄` : "新生儿"}
                    </p>
                    {plan.items.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {plan.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-lg bg-cream-dark px-2 py-0.5 text-[10px] text-charcoal-light"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {plan.season && (
                      <p className="mt-1.5 text-xs text-mint-dark">适宜季节：{plan.season}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      isDone
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    {isDone ? "已检" : "待检"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
