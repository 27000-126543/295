import { Outlet } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";
import PageHeader from "./PageHeader";
import { MessageCircle } from "lucide-react";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-white/80 px-4 backdrop-blur-md">
        <h1 className="text-lg font-bold text-coral">贝贝通</h1>
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-charcoal-light" />
          <div className="h-8 w-8 rounded-full bg-coral/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-coral">贝</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}

export { PageHeader };
