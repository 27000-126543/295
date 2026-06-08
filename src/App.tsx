import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/AdminLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import BabyList from "@/pages/baby/BabyList";
import BabyDetail from "@/pages/baby/BabyDetail";
import Shop from "@/pages/shop/Shop";
import ProductDetail from "@/pages/shop/ProductDetail";
import Cart from "@/pages/shop/Cart";
import OrderList from "@/pages/shop/OrderList";
import OrderDetail from "@/pages/shop/OrderDetail";
import Education from "@/pages/education/Education";
import CourseDetail from "@/pages/education/CourseDetail";
import CourseTickets from "@/pages/education/CourseTickets";
import GrowthTrack from "@/pages/education/GrowthTrack";
import Community from "@/pages/community/Community";
import PostDetail from "@/pages/community/PostDetail";
import PublishPost from "@/pages/community/PublishPost";
import Insurance from "@/pages/insurance/Insurance";
import InsuranceProductDetail from "@/pages/insurance/InsuranceProductDetail";
import ClaimApply from "@/pages/insurance/ClaimApply";
import ClaimList from "@/pages/insurance/ClaimList";
import Member from "@/pages/member/Member";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPrediction from "@/pages/admin/AdminPrediction";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/baby" element={<BabyList />} />
          <Route path="/baby/:id" element={<BabyDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/product/:id" element={<ProductDetail />} />
          <Route path="/shop/cart" element={<Cart />} />
          <Route path="/shop/orders" element={<OrderList />} />
          <Route path="/shop/order/:id" element={<OrderDetail />} />
          <Route path="/education" element={<Education />} />
          <Route path="/education/course/:id" element={<CourseDetail />} />
          <Route path="/education/tickets" element={<CourseTickets />} />
          <Route path="/education/growth" element={<GrowthTrack />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="/community/publish" element={<PublishPost />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/insurance/product/:id" element={<InsuranceProductDetail />} />
          <Route path="/insurance/claim" element={<ClaimApply />} />
          <Route path="/insurance/claims" element={<ClaimList />} />
          <Route path="/member" element={<Member />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/prediction" element={<AdminPrediction />} />
        </Route>
      </Routes>
    </Router>
  );
}
