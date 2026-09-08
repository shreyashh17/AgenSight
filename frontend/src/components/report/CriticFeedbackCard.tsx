"use client";

import React from "react";
import { ShieldCheck, Sparkles, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CriticFeedbackCardProps {
  score?: number;
  strengths?: string[];
  improvements?: string[];
  verdict?: string;
  onImprove: () => void;
  isImproving?: boolean;
}

export function CriticFeedbackCard({
  score,
  strengths = [],
  improvements = [],
  verdict,
  onImprove,
  isImproving = false,
}: CriticFeedbackCardProps) {
  if (score === undefined && !verdict) return null;

  const scoreNum = score || 0;
  const isExcellent = scoreNum >= 9.0;
  const isGood = scoreNum >= 8.0 && scoreNum < 9.0;

  return (
    <div className="surface-card p-5 md:p-6 mb-8 border-[rgba(217,217,217,0.15)] bg-[#1A1C22]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[rgba(217,217,217,0.1)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#6C35F7]/12 border border-[#6C35F7]/30 flex items-center justify-center text-[#A78BFA]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#C0C0C0]">
              Evaluation Standard
            </span>
            <h3 className="font-heading text-sm md:text-base font-bold text-white">
              Critic Agent Autonomous Review
            </h3>
          </div>
        </div>

        {/* Score Display */}
        {score !== undefined && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono-code uppercase text-[#8E92A0]">Rubric Score</div>
              <div className="text-xl font-extrabold font-mono-code text-white">
                <span className={isExcellent ? "text-emerald-400" : isGood ? "text-[#A78BFA]" : "text-amber-300"}>
                  {score.toFixed(1)}
                </span>
                <span className="text-[#8E92A0] text-sm font-normal"> / 10</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verdict quote */}
      {verdict && (
        <div className="mb-4 p-3 rounded bg-[#141426] border-l-2 border-[#6C35F7] text-xs text-[#D9D9D9] italic leading-relaxed">
          "{verdict}"
        </div>
      )}

      {/* Strengths & Improvements columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="p-3.5 rounded bg-[#141426] border border-[rgba(217,217,217,0.08)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 font-heading">
              <CheckCircle className="w-3.5 h-3.5" />
              Key Strengths ({strengths.length})
            </div>
            <ul className="space-y-1.5 text-xs text-[#C0C0C0]">
              {strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span className="leading-relaxed text-[11px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="p-3.5 rounded bg-[#141426] border border-[rgba(217,217,217,0.08)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 font-heading">
              <AlertTriangle className="w-3.5 h-3.5" />
              Improvement Targets ({improvements.length})
            </div>
            <ul className="space-y-1.5 text-xs text-[#C0C0C0]">
              {improvements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span className="leading-relaxed text-[11px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 1-Click "Improve Report with Critic" */}
      {improvements.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-md bg-[#6C35F7]/10 border border-[#6C35F7]/30">
          <div className="flex items-center gap-2 text-xs text-[#D9D9D9]">
            <Sparkles className="w-4 h-4 text-[#6C35F7] shrink-0" />
            <span>
              Pass Critic Agent suggestions into the synthesis chain for an automated revision pass.
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onImprove}
            isLoading={isImproving}
            className="w-full sm:w-auto shrink-0 gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Improve Report (1-Click)
          </Button>
        </div>
      )}
    </div>
  );
}
