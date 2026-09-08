"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  BookOpen, 
  GitCompare, 
  BarChart3, 
  Settings, 
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  PenTool,
  LayoutDashboard,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Research Studio", href: "/", icon: Compass, badge: "Live" },
    { label: "Knowledge Library", href: "/library", icon: BookOpen },
    { label: "Comparative Studio", href: "/compare", icon: GitCompare, badge: "v2" },
    { label: "Telemetry & Usage", href: "/analytics", icon: BarChart3 },
    { label: "My Profile", href: "/profile", icon: UserCircle },
    { label: "System Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#1A1C22] border-r border-[rgba(217,217,217,0.1)] transition-all duration-200 ease-in-out lg:static shrink-0",
          collapsed ? "w-18" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[rgba(217,217,217,0.1)]">
          <Logo collapsed={collapsed} />

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded text-[#C0C0C0] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className={cn("px-2 mb-2 text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0]", collapsed && "text-center")}>
            {!collapsed ? "Navigation" : "•••"}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-xs md:text-sm transition-all duration-150 group relative select-none",
                  isActive
                    ? "bg-[#6C35F7]/12 text-white border-l-2 border-[#6C35F7] font-semibold"
                    : "text-[#C0C0C0] hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#6C35F7]" : "text-[#8E92A0] group-hover:text-white")} />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-[#6C35F7]/20 text-[#A78BFA] border border-[#6C35F7]/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1A1C22] text-xs text-white rounded shadow-lg border border-[rgba(217,217,217,0.15)] hidden group-hover:block whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Agent Swarm Telemetry Box */}
        {!collapsed && (
          <div className="p-3.5 m-3 rounded-lg bg-[#141426] border border-[rgba(217,217,217,0.1)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white font-heading">
                <Cpu className="w-3.5 h-3.5 text-[#6C35F7]" />
                <span>Agent Architecture</span>
              </div>
              <span className="text-[9px] font-mono-code text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono-code text-[#C0C0C0]">
              <div className="flex justify-between items-center">
                <span className="text-[#8E92A0] flex items-center gap-1"><Search className="w-3 h-3 text-[#6C35F7]" /> Search</span>
                <span>Tavily API</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E92A0] flex items-center gap-1"><BookOpen className="w-3 h-3 text-[#6C35F7]" /> Reader</span>
                <span>DOM Scraper</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E92A0] flex items-center gap-1"><PenTool className="w-3 h-3 text-[#6C35F7]" /> Writer</span>
                <span>gpt-4o-mini</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8E92A0] flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[#6C35F7]" /> Critic</span>
                <span>Rubric Evaluator</span>
              </div>
            </div>
          </div>
        )}

        {/* User Account Quick Link */}
        <div className="px-3 py-2 border-t border-[rgba(217,217,217,0.1)]">
          {user ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors group",
                collapsed && "justify-center p-1.5"
              )}
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-6 h-6 rounded-full ring-1 ring-[#6C35F7]/50 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#6C35F7]/20 border border-[#6C35F7]/50 flex items-center justify-center text-[11px] font-semibold text-[#A78BFA] shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate group-hover:text-[#A78BFA] transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#8E92A0] truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-xs text-[#C0C0C0] hover:text-white transition-colors",
                collapsed && "justify-center"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-[#8E92A0] shrink-0">
                ?
              </div>
              {!collapsed && <span>Sign In / Register</span>}
            </Link>
          )}
        </div>

        {/* Stream Protocol Footer */}
        <div className="p-3 border-t border-[rgba(217,217,217,0.1)] flex items-center justify-between text-xs text-[#8E92A0]">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6C35F7] animate-pulse" />
              <span className="font-mono-code text-[11px]">SSE Realtime Stream</span>
            </div>
          ) : (
            <div className="mx-auto w-2 h-2 rounded-full bg-[#6C35F7] animate-pulse" />
          )}
        </div>
      </aside>
    </>
  );
}
