"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Eye,
  EyeOff,
  Check
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, demoLogin, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // Password strength helper
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please complete all registration fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsDemoSubmitting(true);
    try {
      await demoLogin();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to initialize demo session");
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Create Analyst Account
          </h1>
          <p className="text-sm text-[#D9D9D9]/70 mt-1 font-sans max-w-sm">
            Deploy autonomous agents for real-time intelligence gathering
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1A1C22]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top accent glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6C35F7] to-transparent opacity-75" />

          {/* If already logged in */}
          {user && (
            <div className="mb-6 p-4 rounded-xl bg-[#6C35F7]/10 border border-[#6C35F7]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#6C35F7] shrink-0" />
                <div className="text-xs text-[#D9D9D9]">
                  Logged in as <span className="text-white font-medium">{user.email}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push("/")}>
                Dashboard
              </Button>
            </div>
          )}

          {/* Fast Demo Access Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isDemoSubmitting || isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#141433] hover:bg-[#141433]/80 border border-white/10 hover:border-[#6C35F7]/40 text-[#D9D9D9] hover:text-white font-medium text-xs transition-all duration-200 group cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6C35F7]" />
              <span>Or bypass signup with <strong>1-Click Demo Analyst</strong></span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D9D9D9]/50 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] uppercase tracking-wider text-[#D9D9D9]/50 font-mono">
              or register new analyst
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D9D9D9]/70 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#D9D9D9]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Thorne"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141433]/80 border border-white/10 rounded-xl text-sm text-white placeholder-[#D9D9D9]/30 focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7] transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D9D9D9]/70 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D9D9D9]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex.thorne@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141433]/80 border border-white/10 rounded-xl text-sm text-white placeholder-[#D9D9D9]/30 focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7] transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D9D9D9]/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D9D9D9]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#141433]/80 border border-white/10 rounded-xl text-sm text-white placeholder-[#D9D9D9]/30 focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7] transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D9D9D9]/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D9D9D9]/70 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D9D9D9]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141433]/80 border border-white/10 rounded-xl text-sm text-white placeholder-[#D9D9D9]/30 focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7] transition-all font-sans"
                />
              </div>
            </div>

            {/* Live Password Rules Indicator */}
            {password.length > 0 && (
              <div className="p-3 bg-[#141433]/50 rounded-xl border border-white/5 space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'}`}>
                    {hasMinLength ? <Check className="w-2.5 h-2.5" /> : "•"}
                  </div>
                  <span className={hasMinLength ? 'text-emerald-300' : 'text-[#D9D9D9]/50'}>
                    At least 6 characters
                  </span>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passwordsMatch ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {passwordsMatch ? <Check className="w-2.5 h-2.5" /> : "•"}
                    </div>
                    <span className={passwordsMatch ? 'text-emerald-300' : 'text-rose-300'}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match yet'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-3 font-medium justify-center gap-2"
              disabled={isSubmitting || isDemoSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering workspace...</span>
                </div>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-[#D9D9D9]/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#6C35F7] hover:text-[#6C35F7]/80 font-medium hover:underline transition-colors ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#D9D9D9]/50 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>Zero-Knowledge Multi-Tenant Architecture · ISO 27001 Ready</span>
        </div>
      </div>
    </div>
  );
}
