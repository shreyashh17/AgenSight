"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Logo } from "@/components/ui/Logo";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Check if current route is a public auth or share route
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicRoute = isAuthPage || pathname.startsWith("/share/");

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [user, isLoading, isPublicRoute, router]);

  // Loading Splash Screen while validating session
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#141433]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <Logo size="lg" />
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-[#6C35F7] animate-ping" />
            <span className="text-xs font-mono-code text-[#D9D9D9]/70">
              Initializing Intelligence Swarm...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standalone Layout for Login & Register and Public Share Pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#141433]">
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  // If user is not authenticated and trying to view a protected route, show loading redirect
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#141433]">
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <p className="text-xs font-mono-code text-[#D9D9D9]/70">
            Redirecting to Authentication Gateway...
          </p>
        </div>
      </div>
    );
  }

  // Authenticated Full Dashboard Layout
  return (
    <div className="min-h-screen flex bg-[#141433] text-[#FFFFFF] selection:bg-[#6C35F7]/30 selection:text-white w-full">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#141433]">
        <Header
          onOpenCommandPalette={() => setCmdOpen(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
      />
    </div>
  );
}
