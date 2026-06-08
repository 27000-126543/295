import { useEffect, useMemo } from "react";
import { BookOpen, CheckCircle, Flame } from "lucide-react";
import { useCourseStore } from "@/store/courseStore";
import PageHeader from "@/components/PageHeader";

export default function GrowthTrack() {
  const { growthTrack, fetchGrowthTrack, tickets } = useCourseStore();

  useEffect(() => {
    fetchGrowthTrack();
  }, [fetchGrowthTrack]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter((t) => t.status === "used").length;
    let streak = 0;
    const sortedUsedDates = tickets
      .filter((t) => t.status === "used" && t.schedule?.date)
      .map((t) => t.schedule!.date)
      .sort()
      .reverse();
    if (sortedUsedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);
      for (const dateStr of sortedUsedDates) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          streak++;
          checkDate = d;
        } else {
          break;
        }
      }
    }
    return { total, completed, streak };
  }, [tickets]);

  const sorted = useMemo(
    () => [...growthTrack].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [growthTrack]
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <PageHeader title="成长轨迹" />

      <div className="px-4 pb-4">
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-3 card-shadow text-center">
            <BookOpen className="mx-auto h-5 w-5 text-coral" />
            <p className="mt-1 text-lg font-bold text-charcoal">{stats.total}</p>
            <p className="text-[10px] text-charcoal-light">总课时</p>
          </div>
          <div className="rounded-2xl bg-white p-3 card-shadow text-center">
            <CheckCircle className="mx-auto h-5 w-5 text-mint-dark" />
            <p className="mt-1 text-lg font-bold text-charcoal">{stats.completed}</p>
            <p className="text-[10px] text-charcoal-light">已完成</p>
          </div>
          <div className="rounded-2xl bg-white p-3 card-shadow text-center">
            <Flame className="mx-auto h-5 w-5 text-orange-500" />
            <p className="mt-1 text-lg font-bold text-charcoal">{stats.streak}</p>
            <p className="text-[10px] text-charcoal-light">连续上课</p>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 card-shadow text-center">
            <p className="text-charcoal-light text-sm">暂无成长记录</p>
          </div>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-coral/20" />

            {sorted.map((item, idx) => {
              const ticket = tickets.find((t) => t.id === item.ticket_id);
              const courseName = ticket?.course?.name ?? "课程";
              return (
                <div key={item.id} className="relative mb-5 last:mb-0">
                  <div className="absolute -left-6 top-1.5 h-4 w-4 rounded-full border-2 border-coral bg-white" />
                  <div className="rounded-2xl bg-white p-4 card-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-charcoal">{courseName}</span>
                      <span className="text-[10px] text-charcoal-light">{formatDate(item.created_at)}</span>
                    </div>
                    {item.checkin_time && (
                      <p className="mt-1 text-xs text-charcoal-light">
                        签到时间：{formatTime(item.checkin_time)}
                      </p>
                    )}
                    {item.teacher_comment && (
                      <div className="mt-2 rounded-xl bg-cream p-3">
                        <p className="text-xs font-medium text-mint-dark mb-1">老师评语</p>
                        <p className="text-xs leading-relaxed text-charcoal-light">{item.teacher_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
