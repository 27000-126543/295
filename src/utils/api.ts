import type {
  User,
  Baby,
  GrowthRecord,
  VaccineRecord,
  VaccinePlan,
  CheckupPlan,
  Product,
  CartItem,
  Order,
  Course,
  CourseTicket,
  GrowthTrackItem,
  Post,
  Comment,
  InsuranceProduct,
  InsurancePolicy,
  Claim,
  MemberProfile,
  Coupon,
  DashboardData,
  PredictionData,
  ReportData,
} from "@/types";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "请求失败" }));
    throw new Error(error.message || error.error || `HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.success && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

export const authApi = {
  register: (data: { phone: string; password: string; name: string }) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { phone: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/api/auth/me"),
};

export const babyApi = {
  list: () => request<Baby[]>("/api/babies"),
  create: (data: { name: string; gender: "male" | "female"; birthDate: string; avatar?: string; growth?: { height: number; weight: number; record_date: string }[]; vaccines?: { vaccine_name: string; vaccinated_date?: string; hospital?: string; status?: string }[] }) =>
    request<Baby>("/api/babies", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Baby> & { growth?: { height: number; weight: number; record_date: string }[]; vaccines?: { vaccine_name: string; vaccinated_date?: string; hospital?: string; status?: string }[] }) =>
    request<Baby>(`/api/babies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/api/babies/${id}`, { method: "DELETE" }),
  growth: {
    list: (babyId: number) => request<GrowthRecord[]>(`/api/babies/${babyId}/growth`),
    create: (babyId: number, data: { height: number; weight: number; date: string }) =>
      request<GrowthRecord>(`/api/babies/${babyId}/growth`, { method: "POST", body: JSON.stringify(data) }),
  },
  vaccine: {
    list: (babyId: number) => request<VaccineRecord[]>(`/api/babies/${babyId}/vaccines`),
    create: (babyId: number, data: { vaccineName: string; date: string; hospital?: string }) =>
      request<VaccineRecord>(`/api/babies/${babyId}/vaccines`, { method: "POST", body: JSON.stringify(data) }),
    plan: (babyId: number) =>
      request<{ recommended: VaccinePlan[]; upcoming: VaccinePlan[] }>(`/api/babies/${babyId}/vaccine-plan`),
  },
  checkup: {
    plan: (babyId: number) => request<CheckupPlan[]>(`/api/babies/${babyId}/checkup-plan`),
  },
};

export const shopApi = {
  products: (params?: { category?: string; age?: number; keyword?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.age) query.set("age", String(params.age));
    if (params?.keyword) query.set("keyword", params.keyword);
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return request<{ list: Product[]; total: number; page: number }>(`/api/products${qs ? `?${qs}` : ""}`);
  },
  product: (id: number) => request<Product>(`/api/products/${id}`),
  cart: {
    list: () => request<CartItem[]>("/api/cart"),
    add: (data: { productId: number; quantity: number; spec?: string }) =>
      request<CartItem[]>("/api/cart", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { quantity: number }) =>
      request<CartItem>(`/api/cart/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) =>
      request<{ success: boolean }>(`/api/cart/${id}`, { method: "DELETE" }),
  },
  order: {
    create: (data: { addressId: number; items: CartItem[]; paymentMethod: string }) =>
      request<Order>("/api/orders", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<{ list: Order[]; total: number; page: number; pageSize: number }>("/api/orders"),
    detail: (id: number) => request<Order & { logistics: import("@/types").LogisticsRecord[] }>(`/api/orders/${id}`),
  },
};

export const courseApi = {
  list: (params?: { category?: string; teacherId?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.teacherId) query.set("teacherId", String(params.teacherId));
    const qs = query.toString();
    return request<{ list: Course[]; total: number; page: number }>(`/api/courses${qs ? `?${qs}` : ""}`);
  },
  detail: (id: number) =>
    request<Course & { teacher: import("@/types").Teacher; schedules: import("@/types").Schedule[] }>(`/api/courses/${id}`),
  book: (courseId: number, data: { schedule_id: number }) =>
    request<CourseTicket>(`/api/courses/${courseId}/book`, { method: "POST", body: JSON.stringify(data) }),
  tickets: () => request<CourseTicket[]>("/api/courses/tickets/mine"),
  checkin: (ticketId: number, code: string) =>
    request<{ success: boolean; message: string }>(`/api/tickets/${ticketId}/checkin`, {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  growthTrack: (courseId: number) => request<GrowthTrackItem[]>(`/api/courses/${courseId}/growth-track`),
};

export const communityApi = {
  posts: (params?: { tag?: string; sort?: "hot" | "new"; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.tag) query.set("tag", params.tag);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return request<{ list: Post[]; total: number }>(`/api/posts${qs ? `?${qs}` : ""}`);
  },
  post: (id: number) => request<Post & { comments: Comment[] }>(`/api/posts/${id}`),
  publish: (data: { content: string; images: string[]; tags: string[] }) =>
    request<Post>("/api/posts", { method: "POST", body: JSON.stringify(data) }),
  like: (postId: number) =>
    request<{ liked: boolean }>(`/api/posts/${postId}/like`, { method: "POST" }),
  comment: (postId: number, content: string) =>
    request<Comment>(`/api/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
};

export const insuranceApi = {
  products: () => request<InsuranceProduct[]>("/api/insurance/products"),
  product: (id: number) => request<InsuranceProduct>(`/api/insurance/products/${id}`),
  purchase: (data: { product_id: number; insured_name: string; insured_id: string }) =>
    request<InsurancePolicy>("/api/insurance/purchase", { method: "POST", body: JSON.stringify(data) }),
  claim: {
    create: (data: { policy_id: number; amount: number; description: string; documents: string[] }) =>
      request<Claim>("/api/insurance/claims", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<Claim[]>("/api/insurance/claims"),
  },
};

export const memberApi = {
  profile: () => request<MemberProfile>("/api/member/info"),
  coupons: () => request<Coupon[]>("/api/member/coupons"),
  upgradeProgress: () =>
    request<{ currentLevel: string; nextLevel: string; spendingProgress: number; activityProgress: number }>(
      "/api/member/upgrade-progress"
    ),
};

export const adminApi = {
  dashboard: (params?: { city?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.city) query.set("city", params.city);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    const qs = query.toString();
    return request<DashboardData>(`/api/admin/dashboard${qs ? `?${qs}` : ""}`);
  },
  prediction: () => request<PredictionData>("/api/admin/prediction"),
  report: (params?: { month?: string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", params.month);
    const qs = query.toString();
    return request<ReportData>(`/api/admin/monthly-report${qs ? `?${qs}` : ""}`);
  },
};
