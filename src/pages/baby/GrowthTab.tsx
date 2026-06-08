import { useState } from "react";
import { Plus, X, Ruler, Weight } from "lucide-react";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useBabyStore } from "@/store/babyStore";
import type { GrowthRecord } from "@/types";

function AddGrowthModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { height: number; weight: number; date: string }) => void;
}) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  if (!open) return null;

  const handleSubmit = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || !date) return;
    onSubmit({ height: h, weight: w, date });
    setHeight("");
    setWeight("");
    setDate(dayjs().format("YYYY-MM-DD"));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal">添加成长记录</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-charcoal-light" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-charcoal">
              <Ruler className="h-4 w-4 text-coral" /> 身高 (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="请输入身高"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-coral"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-charcoal">
              <Weight className="h-4 w-4 text-mint" /> 体重 (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="请输入体重"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-coral"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">记录日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={dayjs().format("YYYY-MM-DD")}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-coral"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!height || !weight}
          className="btn-gradient mt-6 w-full disabled:opacity-40 disabled:transform-none"
        >
          确认添加
        </button>
      </div>
    </div>
  );
}

export default function GrowthTab({ babyId }: { babyId: number }) {
  const { growthRecords, addGrowth } = useBabyStore();
  const [showModal, setShowModal] = useState(false);

  const handleAdd = async (data: { height: number; weight: number; date: string }) => {
    await addGrowth(babyId, data);
  };

  const sorted = [...growthRecords].sort(
    (a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
  );

  const chartData = sorted.map((r) => ({
    date: dayjs(r.record_date).format("MM/DD"),
    height: r.height,
    weight: r.weight,
  }));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-xs font-medium text-white"
        >
          <Plus className="h-3.5 w-3.5" /> 添加记录
        </button>
      </div>

      {chartData.length >= 2 ? (
        <div className="mb-6 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="mb-3 text-sm font-semibold text-charcoal">成长曲线</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#636E72" />
              <YAxis
                yAxisId="height"
                orientation="left"
                tick={{ fontSize: 11 }}
                stroke="#FF6B6B"
                unit="cm"
              />
              <YAxis
                yAxisId="weight"
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="#4ECDC4"
                unit="kg"
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="height"
                type="monotone"
                dataKey="height"
                stroke="#FF6B6B"
                strokeWidth={2}
                dot={{ r: 3, fill: "#FF6B6B" }}
                name="身高(cm)"
              />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                stroke="#4ECDC4"
                strokeWidth={2}
                dot={{ r: 3, fill: "#4ECDC4" }}
                name="体重(kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl bg-white p-6 card-shadow text-center">
          <p className="text-sm text-charcoal-light">至少需要2条记录才能绘制成长曲线</p>
        </div>
      )}

      <div className="space-y-3">
        {[...growthRecords]
          .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
          .map((record: GrowthRecord) => (
            <div key={record.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 card-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10">
                <Ruler className="h-5 w-5 text-coral" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-charcoal">身高 {record.height}cm</span>
                  <span className="font-medium text-mint-dark">体重 {record.weight}kg</span>
                </div>
                <p className="mt-0.5 text-xs text-charcoal-light">
                  {dayjs(record.record_date).format("YYYY年MM月DD日")}
                </p>
              </div>
            </div>
          ))}
      </div>

      <AddGrowthModal open={showModal} onClose={() => setShowModal(false)} onSubmit={handleAdd} />
    </div>
  );
}
