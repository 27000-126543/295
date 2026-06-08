import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronRight, Heart, MessageCircle } from "lucide-react";
import {
  Baby,
  ShoppingBag,
  BookOpen,
  Users,
  Shield,
  Crown,
  Syringe,
  ShoppingCart,
  GraduationCap,
} from "lucide-react";

const banners = [
  { id: 1, title: "春季疫苗预约", subtitle: "守护宝宝健康", bg: "from-coral to-coral-light" },
  { id: 2, title: "早教课程5折", subtitle: "限时优惠中", bg: "from-mint to-mint-light" },
  { id: 3, title: "新手礼包", subtitle: "注册即享好礼", bg: "from-amber-400 to-orange-400" },
];

const quickEntries = [
  { icon: Baby, label: "宝宝档案", to: "/baby", color: "bg-pink-100 text-pink-500" },
  { icon: ShoppingBag, label: "母婴商城", to: "/shop", color: "bg-coral/10 text-coral" },
  { icon: BookOpen, label: "早教中心", to: "/education", color: "bg-mint/10 text-mint-dark" },
  { icon: Users, label: "育儿社区", to: "/community", color: "bg-blue-100 text-blue-500" },
  { icon: Shield, label: "母婴保险", to: "/insurance", color: "bg-purple-100 text-purple-500" },
  { icon: Crown, label: "会员中心", to: "/member", color: "bg-amber-100 text-amber-600" },
];

const recommendations = [
  { type: "vaccine", icon: Syringe, title: "百白破疫苗", desc: "3月龄宝宝应接种", color: "bg-orange-50 border-orange-200", iconColor: "text-orange-500", tag: "疫苗提醒", tagColor: "bg-orange-100 text-orange-600" },
  { type: "product", icon: ShoppingCart, title: "有机米粉", desc: "6月龄辅食推荐", color: "bg-pink-50 border-pink-200", iconColor: "text-pink-500", tag: "商品推荐", tagColor: "bg-pink-100 text-pink-600" },
  { type: "course", icon: GraduationCap, title: "感统训练课", desc: "8月龄宝宝适合", color: "bg-green-50 border-green-200", iconColor: "text-green-500", tag: "课程推荐", tagColor: "bg-green-100 text-green-600" },
];

const hotPosts = [
  { id: 1, author: "宝妈小丽", content: "今天带宝宝打了疫苗，宝贝很勇敢没有哭哦~", likes: 42, comments: 8 },
  { id: 2, author: "新手爸爸", content: "求推荐适合6个月宝宝的辅食食谱，谢谢大家！", likes: 28, comments: 15 },
  { id: 3, author: "豆豆妈", content: "早教课真的很有用，宝宝现在会自己翻书了", likes: 56, comments: 12 },
];

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 pb-6 pt-3">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 card-shadow">
        <Search className="h-4 w-4 text-charcoal-light" />
        <span className="flex-1 text-sm text-charcoal-light/60">搜索商品、课程、帖子...</span>
        <Bell className="h-5 w-5 text-charcoal-light" />
      </div>

      <div className="relative mb-5 overflow-hidden rounded-3xl" style={{ aspectRatio: "16/8" }}>
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 flex flex-col justify-center bg-gradient-to-r ${banner.bg} px-6 transition-opacity duration-500 ${
              idx === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <h2 className="text-xl font-bold text-white">{banner.title}</h2>
            <p className="mt-1 text-sm text-white/80">{banner.subtitle}</p>
          </div>
        ))}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentBanner ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {quickEntries.map((entry) => (
          <button
            key={entry.label}
            onClick={() => navigate(entry.to)}
            className="flex flex-col items-center gap-2 rounded-2xl py-3 transition-transform active:scale-95"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${entry.color}`}>
              <entry.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-charcoal">{entry.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-charcoal">智能推荐</h2>
          <button className="flex items-center text-xs text-charcoal-light">
            更多 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {recommendations.map((rec) => (
            <div
              key={rec.type}
              className={`flex min-w-[160px] flex-col gap-2 rounded-2xl border p-3 ${rec.color} card-shadow-hover`}
            >
              <span className={`inline-flex w-fit rounded-lg px-2 py-0.5 text-[10px] font-semibold ${rec.tagColor}`}>
                {rec.tag}
              </span>
              <div className="flex items-center gap-2">
                <rec.icon className={`h-5 w-5 ${rec.iconColor}`} />
                <span className="text-sm font-semibold text-charcoal">{rec.title}</span>
              </div>
              <p className="text-xs text-charcoal-light">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-charcoal">热门动态</h2>
          <button
            onClick={() => navigate("/community")}
            className="flex items-center text-xs text-charcoal-light"
          >
            更多 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-3">
          {hotPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-white p-4 card-shadow"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-coral/15 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-coral">{post.author[0]}</span>
                </div>
                <span className="text-sm font-medium text-charcoal">{post.author}</span>
              </div>
              <p className="mb-3 text-sm text-charcoal-light leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-4 text-charcoal-light">
                <span className="flex items-center gap-1 text-xs">
                  <Heart className="h-3.5 w-3.5" /> {post.likes}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" /> {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
