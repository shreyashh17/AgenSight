"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  FileText,
  Zap,
  Star,
  Clock,
  ArrowRight,
  Trash2,
  Search,
  TrendingUp,
  Plus,
  Sparkles,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApiService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { SessionSummary, AnalyticsOverview } from "@/lib/types";
import { formatDate, formatCost, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent");

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [sessionsData, analyticsData] = await Promise.all([
          ApiService.fetchSessions({ limit: 50 }),
          ApiService.fetchAnalytics().catch(() => null),
        ]);
        setSessions(sessionsData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this research session?")) return;
    try {
      await ApiService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = !searchQuery || s.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "recent" || (activeTab === "favorites" && s.is_favorite);
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "running": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "failed": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default: return "text-[#8E92A0] bg-white/5 border-white/10";
    }
  };

  const stats = [
    {
      label: "Total Sessions",
      value: analytics ? formatNumber(analytics.total_sessions) : "—",
      icon: Activity,
      color: "text-[#6C35F7]",
      bgColor: "bg-[#6C35F7]/10",
    },
    {
      label: "Reports Generated",
      value: analytics ? formatNumber(analytics.total_reports) : "—",
      icon: FileText,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Tokens Used",
      value: analytics ? formatNumber(analytics.total_tokens) : "—",
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Avg Score",
      value: analytics ? `${analytics.average_score.toFixed(1)}/10` : "—",
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#C0C0C0] mb-1">
            <LayoutDashboard className="w-3.5 h-3.5 text-[#6C35F7]" />
            <span>Command Center</span>
          </div>
          <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white">
            Welcome back, {user?.name || "Analyst"} 👋
          </h1>
          <p className="text-xs text-[#8E92A0] mt-0.5">
            Here&apos;s an overview of your research intelligence activity.
          </p>
        </div>
        <Link href="/">
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            New Research
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-[#1A1C22] border border-white/10 rounded-xl p-4 hover:border-[#6C35F7]/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-[#8E92A0]/40 group-hover:text-[#6C35F7]/60 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-white font-heading">{stat.value}</p>
              <p className="text-[11px] text-[#8E92A0] font-mono uppercase tracking-wider mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search History Section */}
      <div className="bg-[#1A1C22] border border-white/10 rounded-xl overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#141426] rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "recent"
                    ? "bg-[#6C35F7]/20 text-white border border-[#6C35F7]/40"
                    : "text-[#8E92A0] hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                Recent
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "favorites"
                    ? "bg-[#6C35F7]/20 text-white border border-[#6C35F7]/40"
                    : "text-[#8E92A0] hover:text-white"
                }`}
              >
                <Star className="w-3.5 h-3.5 inline mr-1.5" />
                Favorites
              </button>
            </div>
            <span className="text-[11px] text-[#8E92A0] font-mono">
              {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8E92A0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#141426] border border-white/10 rounded-lg text-xs text-white placeholder-[#8E92A0]/60 focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7]/30 transition-all"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="divide-y divide-white/[0.06]">
          <AnimatePresence mode="popLayout">
            {filteredSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 py-12 text-center"
              >
                <Cpu className="w-10 h-10 text-[#8E92A0]/30 mx-auto mb-3" />
                <p className="text-sm text-[#8E92A0]">
                  {activeTab === "favorites" ? "No favorite sessions yet." : "No research sessions found."}
                </p>
                <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#6C35F7] hover:underline">
                  Start your first research <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ) : (
              filteredSessions.slice(0, 20).map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="group"
                >
                  <Link
                    href={`/?topic=${encodeURIComponent(session.topic)}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Status indicator */}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      session.status === "completed" ? "bg-emerald-400" :
                      session.status === "running" ? "bg-blue-400 animate-pulse" :
                      session.status === "failed" ? "bg-rose-400" : "bg-[#8E92A0]"
                    }`} />

                    {/* Topic & metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-medium truncate">{session.topic}</p>
                        {session.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-[#8E92A0] font-mono">{formatDate(session.created_at)}</span>
                        {session.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {session.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#6C35F7]/10 text-[#A78BFA] border border-[#6C35F7]/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side stats */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[11px] font-mono text-[#8E92A0]">{session.model}</p>
                        <p className="text-[10px] text-[#8E92A0]/60">{formatNumber(session.total_tokens)} tokens</p>
                      </div>
                      {session.report_score !== null && session.report_score !== undefined && (
                        <div className={`text-center px-2 py-1 rounded-lg border ${
                          session.report_score >= 8 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                          session.report_score >= 6 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                          "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        }`}>
                          <p className="text-sm font-bold">{session.report_score.toFixed(1)}</p>
                          <p className="text-[9px] uppercase tracking-wider">Score</p>
                        </div>
                      )}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        className="p-1.5 rounded-md text-[#8E92A0] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8E92A0] group-hover:text-[#6C35F7] transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Show more */}
        {filteredSessions.length > 20 && (
          <div className="px-5 py-3 border-t border-white/10 text-center">
            <Link href="/library" className="text-xs text-[#6C35F7] hover:underline inline-flex items-center gap-1">
              View all {filteredSessions.length} sessions in Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
