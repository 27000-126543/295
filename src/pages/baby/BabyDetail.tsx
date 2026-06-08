import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Baby as BabyIcon } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "@/components/PageHeader";
import { useBabyStore } from "@/store/babyStore";
import GrowthTab from "./GrowthTab";
import VaccineTab from "./VaccineTab";
import CheckupTab from "./CheckupTab";

const tabs = [
  { key: "growth", label: "成长记录" },
  { key: "vaccine", label: "疫苗记录" },
  { key: "checkup", label: "体检计划" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function getMonthAge(birthDate: string): number {
  return dayjs().diff(dayjs(birthDate), "month");
}

export default function BabyDetail() {
  const { id } = useParams<{ id: string }>();
  const babyId = Number(id);
  const { currentBaby, babies, fetchGrowth, fetchVaccines, fetchVaccinePlan, fetchCheckupPlan, selectBaby } =
    useBabyStore();
  const [activeTab, setActiveTab] = useState<TabKey>("growth");

  useEffect(() => {
    if (!currentBaby || currentBaby.id !== babyId) {
      const baby = babies.find((b) => b.id === babyId);
      if (baby) selectBaby(baby);
    }
  }, [babyId, currentBaby, babies, selectBaby]);

  useEffect(() => {
    if (!babyId) return;
    fetchGrowth(babyId);
    fetchVaccines(babyId);
    fetchVaccinePlan(babyId);
    fetchCheckupPlan(babyId);
  }, [babyId, fetchGrowth, fetchVaccines, fetchVaccinePlan, fetchCheckupPlan]);

  if (!currentBaby) {
    return (
      <div>
        <PageHeader title="宝宝详情" />
        <div className="flex flex-col items-center py-20 text-charcoal-light">
          <p className="text-sm">未找到宝宝信息</p>
        </div>
      </div>
    );
  }

  const monthAge = getMonthAge(currentBaby.birth_date);
  const isMale = currentBaby.gender === "male";

  return (
    <div>
      <PageHeader title={currentBaby.name} />

      <div className="px-4 pb-6 pt-3">
        <div
          className="mb-5 rounded-2xl p-5 card-shadow"
          style={{
            background: isMale
              ? "linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)"
              : "linear-gradient(135deg, #fd79a8 0%, #e17055 100%)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30">
              {currentBaby.avatar ? (
                <img
                  src={currentBaby.avatar}
                  alt={currentBaby.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <BabyIcon className="h-8 w-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentBaby.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-white/80">{monthAge}个月</span>
                <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-medium text-white">
                  {isMale ? "男孩" : "女孩"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/60">
                {dayjs(currentBaby.birth_date).format("YYYY年MM月DD日")}出生
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex rounded-2xl bg-white p-1 card-shadow">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-coral text-white shadow-sm"
                  : "text-charcoal-light hover:text-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "growth" && <GrowthTab babyId={babyId} />}
        {activeTab === "vaccine" && <VaccineTab />}
        {activeTab === "checkup" && <CheckupTab />}
      </div>
    </div>
  );
}
