export interface User {
  id: number;
  phone: string;
  name: string;
  avatar?: string;
  role: "user" | "teacher" | "admin";
  created_at: string;
}

export interface Baby {
  id: number;
  user_id: number;
  name: string;
  gender: "male" | "female";
  birth_date: string;
  avatar?: string;
  created_at: string;
}

export interface GrowthRecord {
  id: number;
  baby_id: number;
  height: number;
  weight: number;
  record_date: string;
  created_at: string;
}

export interface VaccineRecord {
  id: number;
  baby_id: number;
  vaccine_name: string;
  vaccinated_date?: string;
  hospital?: string;
  status: "pending" | "completed" | "overdue";
  created_at: string;
}

export interface VaccinePlan {
  name: string;
  monthAge: number;
  description: string;
}

export interface CheckupPlan {
  id: number;
  name: string;
  monthAge: number;
  items: string[];
  season?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  image?: string;
  description?: string;
  age_min?: number;
  age_max?: number;
  stock: number;
  sales: number;
  warehouse_city?: string;
  created_at: string;
  warehouseStock?: { stock: number; warehouse_name: string; warehouse_city: string }[];
  totalWarehouseStock?: number;
  expectedWarehouse?: { name: string; city: string; stock: number } | null;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  product_price?: number;
  product?: Product;
  quantity: number;
  spec?: string;
  created_at: string;
}

export interface AfterSale {
  id: number;
  order_id: number;
  user_id: number;
  type: "refund" | "return_refund" | "exchange";
  reason: string;
  product_id: number;
  quantity: number;
  refund_amount: number;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  processed_at?: string;
  created_at: string;
  product_name?: string;
  city?: string;
  warehouse?: string;
  product_category?: string;
  user_name?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "delivery_failed";
  address: string;
  city?: string;
  warehouse?: string;
  payment_method?: string;
  created_at: string;
  items?: OrderItem[];
  logistics?: LogisticsRecord[];
  afterSales?: AfterSale[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  price: number;
  spec?: string;
}

export interface LogisticsRecord {
  id: number;
  order_id: number;
  status: string;
  description: string;
  location?: string;
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  avatar?: string;
  rating: number;
  specialty?: string;
  bio?: string;
}

export interface Course {
  id: number;
  name: string;
  category: string;
  teacher_id?: number;
  teacher?: Teacher;
  cover_image?: string;
  description?: string;
  price: number;
  duration?: number;
  age_min?: number;
  age_max?: number;
  rating: number;
  schedules?: Schedule[];
}

export interface Schedule {
  id: number;
  course_id: number;
  teacher_id: number;
  teacher?: Teacher;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked: number;
}

export interface CourseTicket {
  id: number;
  user_id: number;
  schedule_id: number;
  course_id: number;
  course?: Course;
  schedule?: Schedule;
  status: "active" | "used" | "expired" | "cancelled";
  qr_code?: string;
  created_at: string;
}

export interface GrowthTrackItem {
  id: number;
  ticket_id: number;
  baby_id: number;
  teacher_comment?: string;
  checkin_time?: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  user?: User;
  content: string;
  images?: string;
  tags?: string;
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
  created_at: string;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  user?: User;
  content: string;
  created_at: string;
}

export interface InsuranceProduct {
  id: number;
  name: string;
  type: "accident" | "critical_illness";
  coverage_amount: number;
  premium: number;
  age_min?: number;
  age_max?: number;
  description?: string;
  features?: string;
}

export interface InsurancePolicy {
  id: number;
  user_id: number;
  product_id: number;
  product?: InsuranceProduct;
  insured_name: string;
  insured_id: string;
  premium: number;
  status: "active" | "expired" | "cancelled";
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Claim {
  id: number;
  policy_id: number;
  user_id: number;
  policy?: InsurancePolicy;
  amount: number;
  documents?: string;
  description?: string;
  status: "initial_review" | "escalated" | "approved" | "rejected" | "paid";
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface MemberProfile {
  id: number;
  user_id: number;
  level: "normal" | "silver" | "gold" | "diamond";
  annual_spending: number;
  activity_score: number;
  points: number;
  updated_at: string;
}

export interface Coupon {
  id: number;
  user_id: number;
  type: string;
  value: number;
  min_spend: number;
  status: "available" | "used" | "expired";
  expires_at?: string;
  created_at: string;
}

export interface DashboardData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalBabies: number;
    totalCourses: number;
    totalPosts: number;
    totalTickets: number;
    courseConsumptionRate: number;
    communityActivity: number;
    insuranceClaimAvgDays: number;
    memberGrowth: number;
  };
  recentOrders: Order[];
  categorySales: { category: string; revenue: number; quantity: number }[];
  courseBookings: { name: string; category: string; total_booked: number }[];
  trendData: { month: string; revenue: number; orders: number }[];
  afterSales: {
    totalAS: number;
    totalRefund: number;
    totalReturnQty: number;
    afterSalesRate: number;
    list: AfterSale[];
  };
}

export interface PredictionData {
  revenuePredictions: { category: string; current_revenue: number; predicted_revenue: number; growth_rate: number; confidence: number }[];
  ageDistribution: { age_group: string; count: number }[];
  recommendedStock: { name: string; category: string; stock: number; sales: number; stock_status: string; recommended: number; warehouseStock: { name: string; city: string; stock: number }[] }[];
  coursePredictions: { name: string; category: string; currentBookings: number; predictedBookings: number; suggestion: string }[];
  holidayImpact: { name: string; impactType: string; description: string; affectedCategories: string[] }[];
  cityComparison: { city: string; orderCount: number; revenue: number; avgOrderValue: number; avgDeliveryDays: number; stockoutCount: number; warehouses: string[] }[];
  warehouseLoad: { name: string; city: string; totalStock: number; productCount: number; orderCount: number; loadRate: number }[];
}

export interface ReportData {
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number; newUsers: number; courseCompletionRate: number; userSatisfaction: number; insuranceClaimRate: number };
  categoryRevenue: { category: string; revenue: number; percentage: number }[];
  orderStatusDist: { status: string; count: number }[];
  topProducts: { name: string; category: string; total_sold: number; revenue: number }[];
  courseStats: { name: string; category: string; total_booked: number; total_capacity: number; completionRate: number }[];
  monthlyTrend: { month: string; revenue: number; orders: number; users: number }[];
  cityReport: { city: string; orderCount: number; revenue: number; avgDeliveryDays: number; stockoutCount: number }[];
  warehouseReport: { name: string; city: string; totalStock: number; productCount: number; orderCount: number }[];
  afterSalesReport: { city: string; warehouse: string; category: string; totalAS: number; totalRefund: number; totalReturnQty: number }[];
}

export interface WarehouseInventoryItem {
  id: number;
  warehouse_id: number;
  product_id: number;
  stock: number;
  warehouse_name: string;
  warehouse_city: string;
  product_name: string;
  category: string;
  sales: number;
  stockoutCount: number;
  safetyStock: number;
  needReplenish: boolean;
}

export interface StockTransfer {
  id: number;
  product_id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  quantity: number;
  status: string;
  operator_id: number;
  created_at: string;
  product_name?: string;
  from_warehouse_name?: string;
  to_warehouse_name?: string;
}
