"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  PenTool, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentName, SourceItem } from "@/lib/types";

interface AgentCardProps {
  agentName: AgentName;
  status: "idle" | "running" | "completed" | "error";
  title: string;
  roleDescription: string;
  thoughts: string[];
  steps: string[];
  sources?: SourceItem[];
  tokens?: number;
  reportStream?: string;
  criticScore?: number;
  criticStrengths?: string[];
  criticImprovements?: string[];
  criticVerdict?: string;
}

export function AgentCard({
  agentName,
  status,
  title,
  roleDescription,
  thoughts,
  steps,
  sources = [],
  tokens = 0,
  reportStream = "",
  criticScore,
  criticStrengths = [],
  criticImprovements = [],
  criticVerdict = ""
}: AgentCardProps) {
  const [showThoughts, setShowThoughts] = useState(true);

  const getIcon = () => {
    switch (agentName) {
      case "search": return Search;
      case "reader": return BookOpen;
      case "writer": return PenTool;
      case "critic": return ShieldCheck;
      default: return Sparkles;
    }
  };

  const Icon = getIcon();
  const isActive = status === "running";
  const isDone = status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "surface-card p-4 md:p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between",
        isActive && "border-[#6C35F7] shadow-lg shadow-[#6C35F7]/15 ring-1 ring-[#6C35F7]/40",
        isDone && "border-[rgba(217,217,217,0.18)] hover:border-[rgba(217,217,217,0.28)]",
        status === "idle" && "opacity-60 border-[rgba(217,217,217,0.06)]"
      )}
    >
      {/* Top subtle active shimmer line */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6C35F7] to-transparent animate-pulse" />
      )}

      <div>
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white transition-all",
                  isActive && "bg-[#6C35F7] text-white shadow-md shadow-[#6C35F7]/30",
                  isDone && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
                  status === "idle" && "bg-white/5 text-[#8E92A0]"
                )}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              {isActive && (
                <span className="absolute -inset-1 rounded-lg bg-[#6C35F7]/30 animate-ping -z-10" />
              )}
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-white flex items-center gap-2 font-heading">
                {title}
                {tokens > 0 && (
                  <span className="text-[10px] font-mono-code text-[#C0C0C0] bg-[#141426] px-1.5 py-0.5 rounded border border-[rgba(217,217,217,0.1)]">
                    {tokens} tok
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#8E92A0] line-clamp-1">{roleDescription}</p>
            </div>
          </div>

          {/* Status Pill */}
          <div className="shrink-0">
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono-code font-medium bg-[#6C35F7]/20 text-[#A78BFA] border border-[#6C35F7]/40 shadow-xs shadow-[#6C35F7]/20">
                <Loader2 className="w-3 h-3 animate-spin text-[#6C35F7]" />
                Thinking
              </span>
            )}
            {isDone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Done
              </span>
            )}
            {status === "idle" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-code text-[#8E92A0] bg-white/5">
                Queued
              </span>
            )}
          </div>
        </div>

        {/* Agent Thought Logs Accordion */}
        {thoughts.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              className="flex items-center justify-between w-full text-[11px] font-mono-code text-[#C0C0C0] hover:text-white py-1 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#6C35F7]" />
                <span>Internal Reasoning Chain ({thoughts.length})</span>
              </div>
              {showThoughts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
              {showThoughts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 p-2.5 rounded bg-[#10101C] border border-[rgba(217,217,217,0.08)] space-y-1 text-xs text-[#D9D9D9] font-mono-code overflow-hidden"
                >
                  {thoughts.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#6C35F7] select-none font-bold">›</span>
                      <span className="leading-relaxed text-[11px]">{t}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Step Events */}
        {steps.length > 0 && (
          <div className="space-y-1 mb-3">
            {steps.map((st, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-[#C0C0C0] flex items-center gap-2 font-mono-code text-[11px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">{st}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Source Citations in Search / Reader Agent */}
        {sources.length > 0 && (agentName === "search" || agentName === "reader") && (
          <div className="space-y-1.5 mt-2">
            <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0]">
              {agentName === "search" ? "Cataloged Sources:" : "Extracted Page DOMs:"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded bg-[#141426] hover:bg-[#181830] border border-[rgba(217,217,217,0.08)] hover:border-[rgba(217,217,217,0.2)] text-xs text-[#D9D9D9] transition-all hover:scale-[1.01] group"
                >
                  {src.favicon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src.favicon_url} alt="" className="w-3.5 h-3.5 rounded shrink-0 object-contain" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded bg-[#6C35F7]/20 text-[9px] flex items-center justify-center text-[#A78BFA]">
                      W
                    </span>
                  )}
                  <span className="truncate flex-1 font-mono-code text-[11px]">{src.title || src.domain}</span>
                  <ExternalLink className="w-3 h-3 text-[#8E92A0] group-hover:text-white shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Writer Agent Live Token Stream Preview */}
        {agentName === "writer" && reportStream && (
          <div className="mt-2.5 p-3 rounded bg-[#10101C] border border-[rgba(217,217,217,0.1)] max-h-36 overflow-y-auto text-xs font-mono-code text-[#D9D9D9]">
            <div className="text-[10px] uppercase text-[#A78BFA] font-semibold mb-1 flex items-center justify-between">
              <span>Streaming Draft Synthesis...</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-[11px] opacity-90">
              {reportStream.slice(-350)}
              <span className="inline-block w-1.5 h-3 bg-[#6C35F7] animate-pulse ml-0.5 align-middle" />
            </div>
          </div>
        )}

        {/* Critic Agent Structured Scorecard */}
        {agentName === "critic" && criticScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2.5 p-3 rounded-md bg-[#141426] border border-[rgba(217,217,217,0.12)] space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-heading">Rubric Score:</span>
              <span className="text-base font-extrabold font-mono-code text-white">
                <span className="text-[#A78BFA]">{criticScore}</span> / 10
              </span>
            </div>

            {criticVerdict && (
              <p className="text-xs text-[#D9D9D9] italic border-l-2 border-[#6C35F7] pl-2 text-[11px] leading-relaxed">
                &ldquo;{criticVerdict}&rdquo;
              </p>
            )}

            {criticStrengths.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-emerald-400 mb-0.5 uppercase tracking-wider">Strengths:</div>
                <ul className="text-[11px] text-[#C0C0C0] space-y-0.5 list-disc pl-3">
                  {criticStrengths.slice(0, 2).map((s, idx) => (
                    <li key={idx} className="line-clamp-1">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

