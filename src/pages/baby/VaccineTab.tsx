import { CheckCircle, Clock, AlertTriangle, Syringe } from "lucide-react";
import dayjs from "dayjs";
import { useBabyStore } from "@/store/babyStore";
import type { VaccineRecord } from "@/types";

function StatusIcon({ status }: { status: VaccineRecord["status"] }) {
  switch (status) {
    case "completed":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      );
    case "pending":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
          <Clock className="h-5 w-5 text-orange-400" />
        </div>
      );
    case "overdue":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      );
  }
}

function StatusLabel({ status }: { status: VaccineRecord["status"] }) {
  const config = {
    completed: { text: "已接种", className: "bg-green-50 text-green-600" },
    pending: { text: "待接种", className: "bg-orange-50 text-orange-500" },
    overdue: { text: "已过期", className: "bg-red-50 text-red-500" },
  };
  const { text, className } = config[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${className}`}>{text}</span>;
}

export default function VaccineTab() {
  const { vaccineRecords, vaccinePlan } = useBabyStore();

  const sorted = [...vaccineRecords].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      {vaccinePlan && vaccinePlan.upcoming.length > 0 && (
        <div className="mb-5 rounded-2xl bg-orange-50 p-4 card-shadow">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-orange-600">
            <Syringe className="h-4 w-4" /> 近期待接种疫苗
          </h3>
          <div className="space-y-1.5">
            {vaccinePlan.upcoming.map((v) => (
              <div key={v.name} className="flex items-center justify-between text-xs">
                <span className="text-charcoal">{v.name}</span>
                <span className="text-orange-500">{v.monthAge}月龄</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-charcoal-light">
          <Syringe className="mb-3 h-10 w-10 text-coral/30" />
          <p className="text-sm">暂无疫苗记录</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {sorted.map((record) => (
              <div key={record.id} className="relative flex gap-3">
                <div className="absolute -left-6 top-3 z-10">
                  <StatusIcon status={record.status} />
                </div>

                <div className="flex-1 rounded-2xl bg-white p-4 card-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal">{record.vaccine_name}</h4>
                      <p className="mt-1 text-xs text-charcoal-light">
                        {record.status === "completed"
                          ? `接种日期：${dayjs(record.vaccinated_date).format("YYYY-MM-DD")}`
                          : record.status === "pending"
                            ? `推荐日期：${dayjs(record.created_at).format("YYYY-MM-DD")}`
                            : `应接种日期：${dayjs(record.created_at).format("YYYY-MM-DD")}`}
                      </p>
                      {record.hospital && (
                        <p className="mt-0.5 text-xs text-charcoal-light">{record.hospital}</p>
                      )}
                    </div>
                    <StatusLabel status={record.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
