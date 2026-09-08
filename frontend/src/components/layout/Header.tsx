"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  Menu, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Settings as SettingsIcon, 
  ChevronDown,
  LogIn,
  LayoutDashboard,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenCommandPalette, onOpenMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-[#1A1C22]/90 backdrop-blur-md border-b border-[rgba(217,217,217,0.1)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-[#C0C0C0] hover:text-white rounded-md lg:hidden cursor-pointer"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex lg:hidden items-center">
          <Logo size="sm" />
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="purple" size="sm">
            <Shield className="w-3 h-3 text-[#A78BFA]" />
            Enterprise Swarm v2.0
          </Badge>
          <span className="text-xs text-[#8E92A0] font-mono-code">/</span>
          <span className="text-xs text-[#C0C0C0] font-medium">Autonomous Intelligence Engine</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Cmd+K Quick Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-[#C0C0C0] bg-[#141426] border border-[rgba(217,217,217,0.15)] rounded-md hover:border-[#6C35F7] hover:text-white transition-all cursor-pointer select-none"
        >
          <Search className="w-3.5 h-3.5 text-[#8E92A0]" />
          <span className="hidden sm:inline">Search intelligence or command...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono-code bg-[rgba(217,217,217,0.1)] rounded text-[#D9D9D9] border border-[rgba(217,217,217,0.15)]">
            ⌘K
          </kbd>
        </button>

        <Link href="/">
          <Button size="sm" variant="primary" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Research</span>
          </Button>
        </Link>

        {/* User Profile / Auth State */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full ring-1 ring-[#6C35F7]/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#6C35F7]/20 border border-[#6C35F7]/50 flex items-center justify-center text-xs font-semibold text-[#A78BFA]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:inline text-xs font-medium text-white max-w-[100px] truncate">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E92A0]" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1A1C22] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-white/10">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-[#8E92A0] truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#6C35F7]/15 text-[#A78BFA] border border-[#6C35F7]/25">
                    {user.role || "Analyst"}
                  </span>
                </div>

                <div className="py-1">
                  {/* Dashboard */}
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#C0C0C0] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#8E92A0]" />
                    <span>Dashboard</span>
                  </Link>
                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#C0C0C0] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <UserCircle className="w-3.5 h-3.5 text-[#8E92A0]" />
                    <span>My Profile</span>
                  </Link>
                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#C0C0C0] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-[#8E92A0]" />
                    <span>Workspace Settings</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-white/10">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-[#D9D9D9]">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

