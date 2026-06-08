import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Users, AlertCircle, ChevronRight } from "lucide-react";
import { useCourseStore } from "@/store/courseStore";
import PageHeader from "@/components/PageHeader";
import type { Schedule } from "@/types";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
      <span className="ml-1 text-sm text-charcoal-light">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCourse, loading, fetchCourse, bookCourse, tickets } = useCourseStore();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [conflictMsg, setConflictMsg] = useState("");

  useEffect(() => {
    if (id) fetchCourse(Number(id));
  }, [id, fetchCourse]);

  const schedules = currentCourse?.schedules ?? [];
  const teacher = currentCourse?.teacher;

  const dates = useMemo(() => {
    const dateSet = new Set(schedules.map((s) => s.date));
    return Array.from(dateSet).sort();
  }, [schedules]);

  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  const filteredSchedules = useMemo(
    () => schedules.filter((s) => s.date === selectedDate),
    [schedules, selectedDate]
  );

  const bookedSlots = useMemo(() => {
    return tickets
      .filter((t) => t.status === "active")
      .map((t) => ({ scheduleId: t.schedule_id, teacherId: t.schedule?.teacher_id }));
  }, [tickets]);

  const handleSelectSchedule = (schedule: Schedule) => {
    if (schedule.booked >= schedule.capacity) return;
    const conflict = bookedSlots.find(
      (b) =>
        b.teacherId === schedule.teacher_id &&
        b.scheduleId !== schedule.id
    );
    if (conflict) {
      setConflictMsg("该老师同时段已有预约，请选择其他时段");
      return;
    }
    setConflictMsg("");
    setSelectedSchedule(schedule.id);
  };

  const handleBook = async () => {
    if (!id || !selectedSchedule || !selectedDate) return;
    setBooking(true);
    try {
      await bookCourse(Number(id), selectedSchedule, selectedDate);
      navigate("/education/tickets");
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return {
      month: d.getMonth() + 1,
      day: d.getDate(),
      weekday: weekdays[d.getDay()],
    };
  };

  if (loading && !currentCourse) {
    return (
      <div>
        <PageHeader title="课程详情" />
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!currentCourse) return null;

  return (
    <div>
      <PageHeader title="课程详情" />

      <div className="pb-24">
        <div className="relative aspect-[16/9] bg-cream-dark overflow-hidden">
          {currentCourse.cover_image ? (
            <img src={currentCourse.cover_image} alt={currentCourse.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint/20 to-coral/20">
              <span className="text-5xl">🎨</span>
            </div>
          )}
        </div>

        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-white p-4 card-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-charcoal">{currentCourse.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-xs font-medium text-mint-dark">
                    {currentCourse.category}
                  </span>
                  {currentCourse.duration && (
                    <span className="flex items-center gap-1 text-xs text-charcoal-light">
                      <Clock className="h-3 w-3" /> {currentCourse.duration}分钟
                    </span>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-xl font-bold text-coral">¥{currentCourse.price}</span>
            </div>
            <div className="mt-3">
              <RatingStars rating={currentCourse.rating} />
            </div>
            {currentCourse.age_min != null && (
              <p className="mt-2 text-xs text-charcoal-light">
                适合 {currentCourse.age_min}{currentCourse.age_max ? `-${currentCourse.age_max}` : "+"} 月龄宝宝
              </p>
            )}
          </div>

          {teacher && (
            <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
              <h3 className="mb-3 text-sm font-semibold text-charcoal">授课老师</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-coral/10">
                  {teacher.avatar ? (
                    <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-coral">
                      {teacher.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal">{teacher.name}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-charcoal-light">{teacher.rating.toFixed(1)}</span>
                  </div>
                  {teacher.specialty && (
                    <p className="mt-1 text-xs text-charcoal-light">专长：{teacher.specialty}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentCourse.description && (
            <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
              <h3 className="mb-2 text-sm font-semibold text-charcoal">课程介绍</h3>
              <p className="text-sm leading-relaxed text-charcoal-light">{currentCourse.description}</p>
            </div>
          )}

          <div className="mt-3 rounded-2xl bg-white p-4 card-shadow">
            <h3 className="mb-3 text-sm font-semibold text-charcoal">选择排班</h3>

            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {dates.map((date) => {
                const d = formatDate(date);
                const isActive = selectedDate === date;
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSchedule(null); setConflictMsg(""); }}
                    className={`flex shrink-0 flex-col items-center rounded-2xl px-4 py-2 transition-all ${
                      isActive
                        ? "bg-coral text-white shadow-coral"
                        : "bg-cream text-charcoal-light"
                    }`}
                  >
                    <span className="text-xs">{d.month}月</span>
                    <span className="text-lg font-bold">{d.day}</span>
                    <span className="text-[10px]">周{d.weekday}</span>
                  </button>
                );
              })}
            </div>

            {conflictMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-coral/10 px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-coral" />
                <span className="text-xs text-coral">{conflictMsg}</span>
              </div>
            )}

            <div className="mt-3 space-y-2">
              {filteredSchedules.length === 0 ? (
                <p className="py-4 text-center text-xs text-charcoal-light">当日暂无排班</p>
              ) : (
                filteredSchedules.map((schedule) => {
                  const full = schedule.booked >= schedule.capacity;
                  const selected = selectedSchedule === schedule.id;
                  return (
                    <button
                      key={schedule.id}
                      onClick={() => handleSelectSchedule(schedule)}
                      disabled={full}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all ${
                        full
                          ? "bg-gray-100 cursor-not-allowed opacity-50"
                          : selected
                          ? "bg-coral/10 ring-2 ring-coral"
                          : "bg-cream hover:bg-cream-dark"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className={`h-4 w-4 ${full ? "text-gray-400" : selected ? "text-coral" : "text-charcoal-light"}`} />
                        <span className={`text-sm font-medium ${full ? "text-gray-400" : "text-charcoal"}`}>
                          {schedule.start_time}-{schedule.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-xs ${full ? "text-gray-400" : "text-charcoal-light"}`}>
                          <Users className="h-3 w-3" />
                          余{schedule.capacity - schedule.booked}
                        </span>
                        {full && (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                            已满
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal-light">合计</span>
            <span className="ml-2 text-xl font-bold text-coral">¥{currentCourse.price}</span>
          </div>
          <button
            onClick={handleBook}
            disabled={!selectedSchedule || booking}
            className={`rounded-2xl px-8 py-3 text-sm font-semibold text-white transition-all ${
              selectedSchedule && !booking
                ? "btn-gradient"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {booking ? "预约中..." : "立即预约"}
          </button>
        </div>
      </div>
    </div>
  );
}
