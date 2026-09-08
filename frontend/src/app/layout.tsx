"use client";

import React from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>AgentSight · Autonomous Multi-Agent AI Intelligence Platform</title>
        <meta 
          name="description" 
          content="AgentSight is an enterprise-grade autonomous AI multi-agent research and intelligence platform with real-time SSE telemetry, deep DOM parsing, and automated critic validation." 
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-[#141433] text-[#FFFFFF] selection:bg-[#6C35F7]/30 selection:text-white">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
