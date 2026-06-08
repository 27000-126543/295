import { create } from "zustand";
import type { Course, CourseTicket, GrowthTrackItem } from "@/types";
import { courseApi } from "@/utils/api";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  tickets: CourseTicket[];
  growthTrack: GrowthTrackItem[];
  loading: boolean;
  fetchCourses: (params?: { category?: string; teacherId?: number }) => Promise<void>;
  fetchCourse: (id: number) => Promise<void>;
  bookCourse: (courseId: number, scheduleId: number, date: string) => Promise<void>;
  fetchTickets: () => Promise<void>;
  checkin: (ticketId: number, code: string) => Promise<boolean>;
  fetchGrowthTrack: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  currentCourse: null,
  tickets: [],
  growthTrack: [],
  loading: false,

  fetchCourses: async (params) => {
    set({ loading: true });
    try {
      const res = await courseApi.list(params);
      set({ courses: res.list || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCourse: async (id) => {
    set({ loading: true });
    try {
      const currentCourse = await courseApi.detail(id);
      set({ currentCourse, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  bookCourse: async (courseId, scheduleId, date) => {
    set({ loading: true });
    try {
      const ticket = await courseApi.book(courseId, { schedule_id: scheduleId });
      set((s) => ({ tickets: [ticket, ...s.tickets], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  fetchTickets: async () => {
    try {
      const tickets = await courseApi.tickets();
      set({ tickets });
    } catch (_e) {
      void _e;
    }
  },

  checkin: async (ticketId, code) => {
    try {
      const res = await courseApi.checkin(ticketId, code);
      if (res.success) {
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === ticketId ? { ...t, status: "used" as const } : t)),
        }));
      }
      return res.success;
    } catch {
      return false;
    }
  },

  fetchGrowthTrack: async () => {
    try {
      const { tickets } = get();
      const uniqueCourseIds = [...new Set(tickets.map((t) => t.course_id))];
      if (uniqueCourseIds.length === 0) {
        set({ growthTrack: [] });
        return;
      }
      const results = await Promise.all(uniqueCourseIds.map((id) => courseApi.growthTrack(id)));
      set({ growthTrack: results.flat() });
    } catch (_e) {
      void _e;
    }
  },
}));
