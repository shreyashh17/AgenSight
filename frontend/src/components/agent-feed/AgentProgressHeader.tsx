"use client";

import React from "react";
import { Search, BookOpen, PenTool, CheckCircle2, ShieldCheck, Loader2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentName } from "@/lib/types";

interface AgentProgressHeaderProps {
  currentAgent: AgentName | null;
  isCompleted: boolean;
  durationSeconds: number;
}

export function AgentProgressHeader({ currentAgent, isCompleted, durationSeconds }: AgentProgressHeaderProps) {
  const steps: { name: AgentName; num: string; label: string; sub: string; icon: any; order: number }[] = [
    { name: "search", num: "01", label: "Search Agent", sub: "Tavily Discovery", icon: Search, order: 1 },
    { name: "reader", num: "02", label: "Reader Agent", sub: "DOM Distillation", icon: BookOpen, order: 2 },
    { name: "writer", num: "03", label: "Writer Chain", sub: "Markdown Synthesis", icon: PenTool, order: 3 },
    { name: "critic", num: "04", label: "Critic Review", sub: "Rubric Validation", icon: ShieldCheck, order: 4 },
  ];

  const getAgentOrder = (agent: AgentName | null): number => {
    if (!agent) return 0;
    if (agent === "search") return 1;
    if (agent === "reader") return 2;
    if (agent === "writer") return 3;
    if (agent === "critic") return 4;
    if (agent === "orchestrator") return isCompleted ? 5 : 1;
    return 0;
  };

  const activeOrder = isCompleted ? 5 : getAgentOrder(currentAgent);

  return (
    <div className="surface-card p-4 md:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#6C35F7]" />
          <div>
            <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#C0C0C0]">
              Telemetry State
            </span>
            <h2 className="font-heading text-sm md:text-base font-bold text-white">
              {isCompleted ? "Autonomous Swarm Execution Concluded" : "Live Pipeline Step Progression"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141426] border border-[rgba(217,217,217,0.12)] text-xs font-mono-code text-[#C0C0C0]">
            <span className="text-[#8E92A0]">Latency:</span>
            <span className="text-white font-medium">{durationSeconds.toFixed(1)}s</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold font-mono-code",
            isCompleted 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-[#6C35F7]/15 text-[#A78BFA] border border-[#6C35F7]/30"
          )}>
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                VERIFIED
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#6C35F7]" />
                STREAMING
              </>
            )}
          </div>
        </div>
      </div>

      {/* Structured Stepper Progression Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = activeOrder > s.order;
          const isActive = activeOrder === s.order && !isCompleted;
          const isPending = activeOrder < s.order;

          return (
            <div
              key={s.name}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md border transition-all duration-150",
                isActive && "bg-[#6C35F7]/10 border-[#6C35F7] shadow-sm",
                isDone && "bg-emerald-500/[0.04] border-emerald-500/20 text-[#D9D9D9]",
                isPending && "bg-[#141426]/60 border-[rgba(217,217,217,0.06)] text-[#8E92A0]"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-mono-code font-bold",
                  isActive && "bg-[#6C35F7] text-white",
                  isDone && "bg-emerald-500/20 text-emerald-400",
                  isPending && "bg-white/5 text-[#8E92A0]"
                )}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate text-white">
                  {s.label}
                </div>
                <div className="text-[10px] font-mono-code text-[#8E92A0] truncate">
                  {isActive ? <span className="text-[#A78BFA] font-medium animate-pulse">Running</span> : s.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
