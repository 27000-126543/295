import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Baby as BabyIcon } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "@/components/PageHeader";
import { useBabyStore } from "@/store/babyStore";
import type { Baby } from "@/types";

function getMonthAge(birthDate: string): number {
  return dayjs().diff(dayjs(birthDate), "month");
}

function BabyCard({ baby, onClick }: { baby: Baby; onClick: () => void }) {
  const monthAge = getMonthAge(baby.birth_date);
  const isMale = baby.gender === "male";

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl p-5 text-left card-shadow-hover transition-all active:scale-[0.98]"
      style={{
        background: isMale
          ? "linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)"
          : "linear-gradient(135deg, #fd79a8 0%, #e17055 100%)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30">
          {baby.avatar ? (
            <img src={baby.avatar} alt={baby.name} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <BabyIcon className="h-7 w-7 text-white" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{baby.name}</h3>
          <p className="mt-0.5 text-sm text-white/80">{monthAge}个月</p>
        </div>
        <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white">
          {isMale ? "👦 男孩" : "👧 女孩"}
        </span>
      </div>
    </button>
  );
}

function AddBabyModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; gender: "male" | "female"; birthDate: string }) => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDate, setBirthDate] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim() || !birthDate) return;
    onSubmit({ name: name.trim(), gender, birthDate });
    setName("");
    setGender("male");
    setBirthDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal">添加宝宝</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-charcoal-light" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">宝宝姓名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入宝宝姓名"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-coral"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">性别</label>
            <div className="flex gap-3">
              <button
                onClick={() => setGender("male")}
                className={`flex-1 rounded-2xl border-2 py-3 text-sm font-medium transition-all ${
                  gender === "male"
                    ? "border-[#74b9ff] bg-[#74b9ff]/10 text-[#74b9ff]"
                    : "border-gray-200 text-charcoal-light"
                }`}
              >
                👦 男孩
              </button>
              <button
                onClick={() => setGender("female")}
                className={`flex-1 rounded-2xl border-2 py-3 text-sm font-medium transition-all ${
                  gender === "female"
                    ? "border-[#fd79a8] bg-[#fd79a8]/10 text-[#fd79a8]"
                    : "border-gray-200 text-charcoal-light"
                }`}
              >
                👧 女孩
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">出生日期</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={dayjs().format("YYYY-MM-DD")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-coral"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !birthDate}
          className="btn-gradient mt-6 w-full disabled:opacity-40 disabled:transform-none"
        >
          确认添加
        </button>
      </div>
    </div>
  );
}

export default function BabyList() {
  const navigate = useNavigate();
  const { babies, loading, fetchBabies, createBaby, fetchVaccines } = useBabyStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchBabies();
  }, [fetchBabies]);

  const handleAddBaby = async (data: { name: string; gender: "male" | "female"; birthDate: string }) => {
    await createBaby(data);
  };

  const handleCardClick = (baby: Baby) => {
    useBabyStore.getState().selectBaby(baby);
    fetchVaccines(baby.id);
    navigate(`/baby/${baby.id}`);
  };

  return (
    <div>
      <PageHeader
        title="宝宝档案"
        showBack={false}
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-8 items-center gap-1 rounded-full bg-coral px-3 text-xs font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            添加宝宝
          </button>
        }
      />

      <div className="px-4 pb-6 pt-3">
        {loading && babies.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          </div>
        ) : babies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-charcoal-light">
            <BabyIcon className="mb-3 h-12 w-12 text-coral/40" />
            <p className="text-sm">暂无宝宝档案</p>
            <p className="mt-1 text-xs">点击上方按钮添加宝宝</p>
          </div>
        ) : (
          <div className="space-y-4">
            {babies.map((baby) => (
              <BabyCard key={baby.id} baby={baby} onClick={() => handleCardClick(baby)} />
            ))}
          </div>
        )}
      </div>

      <AddBabyModal open={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddBaby} />
    </div>
  );
}
