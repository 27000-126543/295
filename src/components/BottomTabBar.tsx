import { NavLink } from "react-router-dom";
import { Home, ShoppingBag, Users, UserCircle } from "lucide-react";
import { useShopStore } from "@/store/shopStore";

const tabs = [
  { to: "/", label: "首页", icon: Home, end: true },
  { to: "/shop", label: "商城", icon: ShoppingBag, badge: true },
  { to: "/community", label: "社区", icon: Users },
  { to: "/member", label: "我的", icon: UserCircle },
];

export default function BottomTabBar() {
  const cartCount = useShopStore((s) => s.cartCount);
  const count = cartCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-coral" : "text-charcoal-light"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <tab.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  {tab.badge && count > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? "font-semibold" : ""}`}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
