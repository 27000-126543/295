import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Ticket, TrendingUp } from "lucide-react";
import { useCourseStore } from "@/store/courseStore";
import PageHeader from "@/components/PageHeader";

const CATEGORIES = [
  { key: "", label: "全部" },
  { key: "感统训练", label: "感统训练" },
  { key: "音乐启蒙", label: "音乐启蒙" },
  { key: "美术创意", label: "美术创意" },
  { key: "运动发展", label: "运动发展" },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
      <span className="ml-1 text-xs text-charcoal-light">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Education() {
  const navigate = useNavigate();
  const { courses, loading, fetchCourses, tickets, fetchTickets, growthTrack, fetchGrowthTrack } = useCourseStore();
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetchCourses({ category: activeCategory || undefined });
  }, [activeCategory, fetchCourses]);

  useEffect(() => {
    fetchTickets();
    fetchGrowthTrack();
  }, [fetchTickets, fetchGrowthTrack]);

  return (
    <div>
      <PageHeader
        title="早教中心"
        showBack={false}
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/education/tickets")} className="relative p-1">
              <Ticket className="h-5 w-5 text-charcoal-light" />
              {tickets.filter((t) => t.status === "active").length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                  {tickets.filter((t) => t.status === "active").length}
                </span>
              )}
            </button>
            <button onClick={() => navigate("/education/growth")} className="p-1">
              <TrendingUp className="h-5 w-5 text-charcoal-light" />
            </button>
          </div>
        }
      />

      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-coral text-white shadow-coral"
                  : "bg-white text-charcoal-light card-shadow"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && courses.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 card-shadow text-center">
            <p className="text-charcoal-light text-sm">暂无课程</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/education/course/${course.id}`)}
                className="overflow-hidden rounded-2xl bg-white card-shadow-hover cursor-pointer"
              >
                <div className="relative aspect-[16/9] bg-cream-dark overflow-hidden">
                  {course.cover_image ? (
                    <img
                      src={course.cover_image}
                      alt={course.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint/20 to-coral/20">
                      <span className="text-4xl">🎨</span>
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-mint/90 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {course.category}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-semibold text-charcoal">{course.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        {course.teacher && (
                          <span className="text-xs text-charcoal-light">{course.teacher.name}</span>
                        )}
                        <RatingStars rating={course.rating} />
                      </div>
                    </div>
                    <span className="shrink-0 text-base font-bold text-coral">¥{course.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
