import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Clock, MapPin } from "lucide-react";
import { useCourseStore } from "@/store/courseStore";
import PageHeader from "@/components/PageHeader";
import type { CourseTicket } from "@/types";

const STATUS_CONFIG: Record<CourseTicket["status"], { label: string; bg: string; text: string; border: string }> = {
  active: { label: "待上课", bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  used: { label: "已完成", bg: "bg-gray-50", text: "text-gray-400", border: "border-gray-200" },
  expired: { label: "已过期", bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
  cancelled: { label: "已取消", bg: "bg-gray-50", text: "text-charcoal-light", border: "border-gray-300" },
};

function TicketCard({ ticket }: { ticket: CourseTicket }) {
  const navigate = useNavigate();
  const statusCfg = STATUS_CONFIG[ticket.status];
  const courseName = ticket.course?.name ?? "未知课程";
  const date = ticket.schedule?.date ?? "";
  const startTime = ticket.schedule?.start_time ?? "";
  const endTime = ticket.schedule?.end_time ?? "";

  const formattedDate = date
    ? new Date(date).toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })
    : "";

  return (
    <div
      onClick={() => navigate(`/education/course/${ticket.course_id}`)}
      className="relative cursor-pointer overflow-hidden rounded-2xl bg-white card-shadow"
    >
      <div className={`relative border-b-2 border-dashed ${statusCfg.border}`}>
        <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-cream" />
        <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-cream" />
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-base font-bold text-charcoal">{courseName}</h3>
              <div className="mt-2 flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-charcoal-light">
                  <Clock className="h-3 w-3" />
                  {formattedDate} {startTime}-{endTime}
                </span>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-cream">
            {ticket.qr_code ? (
              <img src={ticket.qr_code} alt="qr" className="h-14 w-14" />
            ) : (
              <QrCode className="h-8 w-8 text-charcoal-light/40" />
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-charcoal-light">
            <MapPin className="h-3 w-3" />
            <span>点击查看签到详情</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseTickets() {
  const { tickets, fetchTickets } = useCourseStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const activeCount = tickets.filter((t) => t.status === "active").length;

  return (
    <div>
      <PageHeader title="我的课程票" />

      <div className="px-4 pb-4">
        {activeCount > 0 && (
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-mint to-mint-light p-4 card-shadow">
            <p className="text-sm font-medium text-white/80">待上课</p>
            <p className="mt-1 text-2xl font-bold text-white">{activeCount} 节</p>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 card-shadow text-center">
            <p className="text-charcoal-light text-sm">暂无课程票</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
