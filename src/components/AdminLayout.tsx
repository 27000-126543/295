import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  BookOpen,
  Shield,
  Users,
  Settings,
} from "lucide-react";

const menuItems = [
  { to: "/admin", label: "管理看板", icon: LayoutDashboard, end: true },
  { to: "/admin/prediction", label: "智能预测", icon: TrendingUp },
  { to: "/admin", label: "商品管理", icon: Package },
  { to: "/admin", label: "课程管理", icon: BookOpen },
  { to: "/admin", label: "保险审核", icon: Shield },
  { to: "/admin", label: "用户管理", icon: Users },
  { to: "/admin", label: "系统设置", icon: Settings },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-14 items-center px-5">
          <h1 className="text-lg font-bold text-coral">贝贝通 · 管理后台</h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-coral/10 text-coral"
                    : "text-charcoal-light hover:bg-gray-100 hover:text-charcoal"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="text-base font-semibold text-charcoal">管理后台</h2>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-charcoal/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-charcoal">管</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
