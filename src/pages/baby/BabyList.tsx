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
  onSubmit: (data: {
    name: string;
    gender: "male" | "female";
    birthDate: string;
    growth?: { height: number; weight: number; record_date: string }[];
    vaccines?: { vaccine_name: string; vaccinated_date?: string; hospital?: string; status?: string }[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDate, setBirthDate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [recordDate, setRecordDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [vaccineList, setVaccineList] = useState<{ name: string; date: string; hospital: string }[]>([]);

  if (!open) return null;

  const handleAddVaccine = () => {
    setVaccineList([...vaccineList, { name: "", date: dayjs().format("YYYY-MM-DD"), hospital: "" }]);
  };

  const handleRemoveVaccine = (idx: number) => {
    setVaccineList(vaccineList.filter((_, i) => i !== idx));
  };

  const handleVaccineChange = (idx: number, field: "name" | "date" | "hospital", value: string) => {
    const updated = [...vaccineList];
    updated[idx] = { ...updated[idx], [field]: value };
    setVaccineList(updated);
  };

  const handleSubmit = () => {
    if (!name.trim() || !birthDate) return;
    const data: any = { name: name.trim(), gender, birthDate };
    if (height && weight && recordDate) {
      data.growth = [{ height: parseFloat(height), weight: parseFloat(weight), record_date: recordDate }];
    }
    const validVaccines = vaccineList.filter((v) => v.name.trim());
    if (validVaccines.length > 0) {
      data.vaccines = validVaccines.map((v) => ({
        vaccine_name: v.name.trim(),
        vaccinated_date: v.date || undefined,
        hospital: v.hospital || undefined,
        status: v.date ? "completed" : "pending",
      }));
    }
    onSubmit(data);
    setName("");
    setGender("male");
    setBirthDate("");
    setHeight("");
    setWeight("");
    setRecordDate(dayjs().format("YYYY-MM-DD"));
    setVaccineList([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 max-h-[85vh] overflow-y-auto"
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

          <div className="rounded-2xl bg-cream p-4">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">成长记录（选填）</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-charcoal-light">身高(cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="65"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-charcoal-light">体重(kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="7.0"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-charcoal-light">记录日期</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  max={dayjs().format("YYYY-MM-DD")}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-coral"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-charcoal">疫苗记录（选填）</h3>
              <button
                onClick={handleAddVaccine}
                className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white"
              >
                <Plus className="h-3 w-3" /> 添加
              </button>
            </div>
            {vaccineList.length === 0 ? (
              <p className="text-xs text-charcoal-light">暂无疫苗记录，点击添加</p>
            ) : (
              <div className="space-y-3">
                {vaccineList.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        value={v.name}
                        onChange={(e) => handleVaccineChange(idx, "name", e.target.value)}
                        placeholder="疫苗名称"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-coral"
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={v.date}
                          onChange={(e) => handleVaccineChange(idx, "date", e.target.value)}
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-coral"
                        />
                        <input
                          value={v.hospital}
                          onChange={(e) => handleVaccineChange(idx, "hospital", e.target.value)}
                          placeholder="接种医院"
                          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-coral"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveVaccine(idx)}
                      className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

  const handleAddBaby = async (data: any) => {
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
