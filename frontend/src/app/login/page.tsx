"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsDemoSubmitting(true);
    try {
      await demoLogin();
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to initialize demo session");
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 relative">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6C35F7]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="mb-4"
          >
            <Logo size="lg" />
          </motion.div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-tight">
            Sign in to AgentSight
          </h1>
          <p className="text-sm text-[#D9D9D9]/70 mt-1 font-sans max-w-sm">
            Autonomous multi-agent research intelligence environment
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1A1C22]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top gradient glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6C35F7] to-transparent opacity-90" />

          {/* If already logged in */}
          {user && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-xl bg-[#6C35F7]/10 border border-[#6C35F7]/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#6C35F7] shrink-0" />
                <div className="text-xs text-[#D9D9D9]">
                  Logged in as <span className="text-white font-medium">{user.email}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push("/")}>
                Continue
              </Button>
            </motion.div>
          )}

          {/* 1-Click Instant Demo Login Banner */}
          <div className="mb-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={handleDemoLogin}
              disabled={isDemoSubmitting || isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6C35F7]/25 via-[#6C35F7]/35 to-[#6C35F7]/25 hover:from-[#6C35F7]/35 hover:via-[#6C35F7]/45 hover:to-[#6C35F7]/35 border border-[#6C35F7]/50 text-white font-medium text-sm transition-all duration-200 group shadow-lg shadow-[#6C35F7]/15 hover:shadow-[#6C35F7]/25 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-[#C0C0C0] group-hover:text-white group-hover:rotate-12 transition-transform duration-200" />
              <span>{isDemoSubmitting ? "Authenticating..." : "1-Click Demo Analyst Login"}</span>
              <ArrowRight className="w-4 h-4 text-[#D9D9D9]/70 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </motion.button>
            <p className="text-[11px] text-center text-[#D9D9D9]/50 mt-1.5 font-mono">
              Instant access preloaded with Lead Analyst privileges
            </p>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-[#D9D9D9]/50 font-mono">
              or sign in with email
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          {isSubmitting && <LoadingOverlay />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#D9D9D9]/70 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D9D9D9]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="analyst@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141433]/80 border border-white/10 rounded-xl text-sm text-white placeholder-[#D9D9D9]/30 focus:outline-none focus:border-[#6C35F7] focus:ring-2 focus:ring-[#6C35F7]/30 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#D9D9D9]/70">
                  Password
                </label>
                <span className="text-[11px] text-[#6C35F7] hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D9D9D9]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#141433]/80 border border-white/10 rounded-xl text-sm text-white placeholder-[#D9D9D9]/30 focus:outline-none focus:border-[#6C35F7] focus:ring-2 focus:ring-[#6C35F7]/30 transition-all font-sans"
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

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-2 font-medium justify-center gap-2"
              disabled={isSubmitting || isDemoSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-[#D9D9D9]/70">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[#6C35F7] hover:text-[#6C35F7]/80 font-medium hover:underline transition-colors ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#D9D9D9]/50 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>AES-256 Encrypted Session · ISO 27001 Ready</span>
        </div>
      </motion.div>
    </div>
  );
}

