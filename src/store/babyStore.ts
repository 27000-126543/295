import { create } from "zustand";
import type { Baby, GrowthRecord, VaccineRecord, VaccinePlan, CheckupPlan } from "@/types";
import { babyApi } from "@/utils/api";

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  vaccinePlan: { recommended: VaccinePlan[]; upcoming: VaccinePlan[] } | null;
  checkupPlan: CheckupPlan[];
  loading: boolean;
  fetchBabies: () => Promise<void>;
  selectBaby: (baby: Baby) => void;
  createBaby: (data: { name: string; gender: "male" | "female"; birthDate: string; avatar?: string; growth?: { height: number; weight: number; record_date: string }[]; vaccines?: { vaccine_name: string; vaccinated_date?: string; hospital?: string; status?: string }[] }) => Promise<void>;
  fetchGrowth: (babyId: number) => Promise<void>;
  addGrowth: (babyId: number, data: { height: number; weight: number; date: string }) => Promise<void>;
  fetchVaccines: (babyId: number) => Promise<void>;
  addVaccine: (babyId: number, data: { vaccineName: string; date: string; hospital?: string }) => Promise<void>;
  fetchVaccinePlan: (babyId: number) => Promise<void>;
  fetchCheckupPlan: (babyId: number) => Promise<void>;
}

export const useBabyStore = create<BabyState>((set) => ({
  babies: [],
  currentBaby: null,
  growthRecords: [],
  vaccineRecords: [],
  vaccinePlan: null,
  checkupPlan: [],
  loading: false,

  fetchBabies: async () => {
    set({ loading: true });
    try {
      const babies = await babyApi.list();
      set({ babies, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  selectBaby: (baby) => set({ currentBaby: baby }),

  createBaby: async (data) => {
    set({ loading: true });
    try {
      const baby = await babyApi.create(data);
      set((s) => ({ babies: [...s.babies, baby], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  fetchGrowth: async (babyId) => {
    try {
      const growthRecords = await babyApi.growth.list(babyId);
      set({ growthRecords });
    } catch (_e) {
      void _e;
    }
  },

  addGrowth: async (babyId, data) => {
    try {
      const record = await babyApi.growth.create(babyId, data);
      set((s) => ({ growthRecords: [...s.growthRecords, record] }));
    } catch (_e) {
      void _e;
    }
  },

  fetchVaccines: async (babyId) => {
    try {
      const vaccineRecords = await babyApi.vaccine.list(babyId);
      set({ vaccineRecords });
    } catch (_e) {
      void _e;
    }
  },

  addVaccine: async (babyId, data) => {
    try {
      const record = await babyApi.vaccine.create(babyId, data);
      set((s) => ({ vaccineRecords: [...s.vaccineRecords, record] }));
    } catch (_e) {
      void _e;
    }
  },

  fetchVaccinePlan: async (babyId) => {
    try {
      const vaccinePlan = await babyApi.vaccine.plan(babyId);
      set({ vaccinePlan });
    } catch (_e) {
      void _e;
    }
  },

  fetchCheckupPlan: async (babyId) => {
    try {
      const checkupPlan = await babyApi.checkup.plan(babyId);
      set({ checkupPlan });
    } catch (_e) {
      void _e;
    }
  },
}));
