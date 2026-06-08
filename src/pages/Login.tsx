import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Baby, Phone, ShieldCheck, ArrowRight } from "lucide-react";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  const sendCode = () => {
    if (!phone || phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }
    setError("");
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || phone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }
    if (!code) {
      setError("请输入验证码");
      return;
    }
    try {
      if (isRegister) {
        if (!name.trim()) {
          setError("请输入昵称");
          return;
        }
        await register(phone, code, name.trim());
      } else {
        await login(phone, code);
      }
      navigate("/");
    } catch {
      setError(isRegister ? "注册失败，请重试" : "登录失败，请重试");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-coral/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-mint/10" />
        <div className="absolute top-1/3 left-1/4 h-32 w-32 rounded-full bg-coral/5" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-coral to-coral-light shadow-coral">
            <Baby className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">贝贝通</h1>
          <p className="mt-1 text-sm text-charcoal-light">用心陪伴，让宝宝健康成长</p>
        </div>

        <div className="rounded-3xl bg-white p-6 card-shadow">
          <div className="mb-6 flex rounded-2xl bg-cream p-1">
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                !isRegister ? "bg-white text-coral shadow-sm" : "text-charcoal-light"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                isRegister ? "bg-white text-coral shadow-sm" : "text-charcoal-light"
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入昵称"
                  className="w-full rounded-2xl border border-gray-100 bg-cream/50 px-4 py-3 text-sm text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:border-coral/30 focus:bg-white focus:ring-2 focus:ring-coral/10"
                />
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-light/50" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="请输入手机号"
                className="w-full rounded-2xl border border-gray-100 bg-cream/50 py-3 pl-10 pr-4 text-sm text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:border-coral/30 focus:bg-white focus:ring-2 focus:ring-coral/10"
              />
            </div>

            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-light/50" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="请输入验证码"
                className="w-full rounded-2xl border border-gray-100 bg-cream/50 py-3 pl-10 pr-24 text-sm text-charcoal placeholder-charcoal-light/50 outline-none transition-all focus:border-coral/30 focus:bg-white focus:ring-2 focus:ring-coral/10"
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={countdown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                style={{ color: countdown > 0 ? undefined : "var(--coral)" }}
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </button>
            </div>

            {error && (
              <p className="animate-fade-in text-xs text-coral">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>{isRegister ? "注册" : "登录"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal-light/60">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}
