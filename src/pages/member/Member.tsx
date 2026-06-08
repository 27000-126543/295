import { useEffect, useState } from "react";
import { Crown, Star, Award, Gem, Ticket, Gift } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useMemberStore } from "@/store/memberStore";
import type { MemberProfile } from "@/types";

const LEVEL_CONFIG: Record<
  MemberProfile["level"],
  { name: string; icon: React.ElementType; gradient: string; nextLevel: string }
> = {
  normal: { name: "普通会员", icon: Star, gradient: "from-gray-300 to-gray-400", nextLevel: "银卡" },
  silver: { name: "银卡会员", icon: Award, gradient: "from-gray-400 to-gray-500", nextLevel: "金卡" },
  gold: { name: "金卡会员", icon: Crown, gradient: "from-yellow-400 to-yellow-600", nextLevel: "钻石" },
  diamond: { name: "钻石会员", icon: Gem, gradient: "from-blue-400 to-purple-500", nextLevel: "" },
};

const LEVEL_BENEFITS: Record<string, string[]> = {
  normal: ["基础客服", "生日优惠券", "积分兑换"],
  silver: ["专属客服", "9.5折优惠", "每月赠券", "优先发货"],
  gold: ["VIP客服", "9折优惠", "每月双倍赠券", "免费课程体验", "专属活动"],
  diamond: ["1对1客服", "8.5折优惠", "每月三倍赠券", "免费课程", "专属活动", "新品试用"],
};

const COUPON_TABS = [
  { key: "available", label: "可用" },
  { key: "used", label: "已用" },
  { key: "expired", label: "已过期" },
] as const;

type CouponTab = (typeof COUPON_TABS)[number]["key"];

export default function Member() {
  const { profile, coupons, upgradeProgress, loading, fetchProfile, fetchCoupons, fetchUpgradeProgress } =
    useMemberStore();
  const [couponTab, setCouponTab] = useState<CouponTab>("available");

  useEffect(() => {
    fetchProfile();
    fetchCoupons();
    fetchUpgradeProgress();
  }, [fetchProfile, fetchCoupons, fetchUpgradeProgress]);

  if (loading && !profile) {
    return (
      <div>
        <PageHeader title="会员中心" showBack={false} />
        <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>
      </div>
    );
  }

  const level = profile?.level || "normal";
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;
  const benefits = LEVEL_BENEFITS[level] || [];
  const filteredCoupons = coupons.filter((c) => c.status === couponTab);

  const spendingProgress = upgradeProgress?.spendingProgress ?? 0;
  const activityProgress = upgradeProgress?.activityProgress ?? 0;

  return (
    <div>
      <PageHeader title="会员中心" showBack={false} />

      <div className="px-4 pt-3 pb-24">
        <div className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-5 card-shadow relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{config.name}</h2>
              <p className="text-xs text-white/80">积分：{profile?.points || 0}</p>
            </div>
          </div>

          {config.nextLevel && (
            <div className="relative mt-4">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>距{config.nextLevel}</span>
                <span>{Math.round(Math.max(spendingProgress, activityProgress))}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/60 to-white"
                  style={{ width: `${Math.max(spendingProgress, activityProgress)}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-white/70">
                <span>消费额 {spendingProgress.toFixed(0)}%</span>
                <span>活跃度 {activityProgress.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">会员权益</h3>
          <div className="grid grid-cols-2 gap-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2"
              >
                <Gift className="h-4 w-4 text-coral shrink-0" />
                <span className="text-xs text-charcoal">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">我的优惠券</h3>
          <div className="flex gap-1 mb-3">
            {COUPON_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCouponTab(tab.key)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                  couponTab === tab.key
                    ? "bg-coral text-white"
                    : "bg-cream text-charcoal-light"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {filteredCoupons.length > 0 ? (
            <div className="space-y-2">
              {filteredCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-coral/30 p-3"
                >
                  <div className="flex flex-col items-center justify-center w-16">
                    <span className="text-lg font-bold text-coral">¥{coupon.value}</span>
                    <span className="text-[10px] text-charcoal-light">
                      满{coupon.min_spend}可用
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal">{coupon.type}</p>
                    <p className="text-[10px] text-charcoal-light mt-0.5">
                      {coupon.expires_at ? `有效期至 ${coupon.expires_at}` : "永久有效"}
                    </p>
                  </div>
                  <Ticket className="h-5 w-5 text-coral/30 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-charcoal-light">暂无优惠券</p>
          )}
        </div>
      </div>
    </div>
  );
}
