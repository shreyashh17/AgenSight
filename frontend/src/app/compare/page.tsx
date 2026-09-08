"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  GitCompare, 
  ArrowRight, 
  Loader2,
  Cpu,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApiService } from "@/lib/api";
import { AgentStreamEvent } from "@/lib/types";

export default function ComparePage() {
  const [topicA, setTopicA] = useState("Rust for High-Scale Backend Systems");
  const [topicB, setTopicB] = useState("Go for High-Scale Backend Systems");
  const [model, setModel] = useState("gpt-4o-mini");
  const [mockMode, setMockMode] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [activeBranch, setActiveBranch] = useState<"A" | "B" | null>(null);

  const [branchAStream, setBranchAStream] = useState("");
  const [branchBStream, setBranchBStream] = useState("");
  const [scoreA, setScoreA] = useState<number | undefined>(undefined);
  const [scoreB, setScoreB] = useState<number | undefined>(undefined);
  const [verdictA, setVerdictA] = useState<string | undefined>(undefined);
  const [verdictB, setVerdictB] = useState<string | undefined>(undefined);

  const handleStartComparison = async () => {
    if (!topicA.trim() || !topicB.trim() || isRunning) return;

    setIsRunning(true);
    setBranchAStream("");
    setBranchBStream("");
    setScoreA(undefined);
    setScoreB(undefined);
    setVerdictA(undefined);
    setVerdictB(undefined);
    setActiveBranch("A");

    await ApiService.streamComparison(
      {
        topic_a: topicA,
        topic_b: topicB,
        model,
        mock_mode: mockMode,
      },
      (event: AgentStreamEvent) => {
        const branch = event.branch;
        if (event.event_type === "branch_switch" && event.data?.branch) {
          setActiveBranch(event.data.branch);
        }

        if (branch === "A") {
          const chunk = event.data?.chunk;
          if (event.event_type === "report_chunk" && chunk) {
            setBranchAStream((prev) => prev + chunk);
          } else if (event.event_type === "critic_evaluation") {
            setScoreA(event.data?.score);
            setVerdictA(event.data?.verdict);
          }
        } else if (branch === "B") {
          const chunk = event.data?.chunk;
          if (event.event_type === "report_chunk" && chunk) {
            setBranchBStream((prev) => prev + chunk);
          } else if (event.event_type === "critic_evaluation") {
            setScoreB(event.data?.score);
            setVerdictB(event.data?.verdict);
          }
        }
      },
      (err) => {
        console.error("Comparison error:", err);
        setIsRunning(false);
      },
      () => {
        setIsRunning(false);
        setActiveBranch(null);
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="max-w-2xl pt-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#6C35F7]/12 border border-[#6C35F7]/30 text-[10px] font-mono-code text-[#A78BFA] mb-2">
          <GitCompare className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>Comparative Studio</span>
        </div>
        <h1 className="font-heading text-xl md:text-3xl font-extrabold text-white mb-1.5">
          Dual-Vector Comparative Research
        </h1>
        <p className="text-xs sm:text-sm text-[#C0C0C0]">
          Deploy autonomous agent pipelines across two independent subjects to evaluate architectural trade-offs, performance nuances, and empirical benchmarks side by side.
        </p>
      </div>

      {/* Dual Input Form */}
      <div className="surface-card p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Topic A */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono-code font-bold uppercase text-[#A78BFA]">
                Branch A: Primary Vector
              </label>
              {activeBranch === "A" && (
                <span className="text-[10px] font-mono-code text-[#A78BFA] animate-pulse flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Analyzing A...
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Rust for distributed backend services"
              value={topicA}
              onChange={(e) => setTopicA(e.target.value)}
              disabled={isRunning}
              className="w-full agent-input px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#8E92A0] focus:outline-none"
            />
          </div>

          {/* Topic B */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono-code font-bold uppercase text-[#38BDF8]">
                Branch B: Comparative Vector
              </label>
              {activeBranch === "B" && (
                <span className="text-[10px] font-mono-code text-[#38BDF8] animate-pulse flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Analyzing B...
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Go for distributed backend services"
              value={topicB}
              onChange={(e) => setTopicB(e.target.value)}
              disabled={isRunning}
              className="w-full agent-input px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#8E92A0] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(217,217,217,0.08)]">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#C0C0C0]">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              disabled={isRunning}
              className="rounded border-[rgba(217,217,217,0.2)] text-[#6C35F7] focus:ring-[#6C35F7]/30"
            />
            <span>Demo Simulator Mode (Instant Parallel Run)</span>
          </label>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStartComparison}
            isLoading={isRunning}
            disabled={!topicA.trim() || !topicB.trim() || isRunning}
            className="gap-2 text-xs"
          >
            <span>{isRunning ? "Running Comparative Swarm..." : "Execute Comparative Analysis"}</span>
            {!isRunning && <Sparkles className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Side by Side Comparative Results */}
      {(branchAStream || branchBStream || isRunning) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Branch A Column */}
          <div className="surface-card p-4 md:p-6 space-y-3 border-[rgba(217,217,217,0.15)]">
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(217,217,217,0.1)]">
              <div>
                <Badge variant="purple" size="sm">Topic A</Badge>
                <h3 className="font-heading text-sm md:text-base font-bold text-white mt-1">
                  {topicA}
                </h3>
              </div>

              {scoreA !== undefined && (
                <div className="text-right">
                  <div className="text-[10px] font-mono-code uppercase text-[#8E92A0]">Critic Score</div>
                  <div className="text-lg font-bold font-mono-code text-white">
                    <span className="text-[#A78BFA]">{scoreA.toFixed(1)}</span>/10
                  </div>
                </div>
              )}
            </div>

            {verdictA && (
              <div className="p-2.5 rounded bg-[#141426] border-l-2 border-[#6C35F7] text-xs text-[#D9D9D9] italic text-[11px]">
                "{verdictA}"
              </div>
            )}

            <div className="prose-editorial text-xs max-h-[500px] overflow-y-auto pr-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {branchAStream || (activeBranch === "A" ? "*Gathering and parsing intelligence on Branch A...*" : "")}
              </ReactMarkdown>
            </div>
          </div>

          {/* Branch B Column */}
          <div className="surface-card p-4 md:p-6 space-y-3 border-[rgba(217,217,217,0.15)]">
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(217,217,217,0.1)]">
              <div>
                <Badge variant="blue" size="sm">Topic B</Badge>
                <h3 className="font-heading text-sm md:text-base font-bold text-white mt-1">
                  {topicB}
                </h3>
              </div>

              {scoreB !== undefined && (
                <div className="text-right">
                  <div className="text-[10px] font-mono-code uppercase text-[#8E92A0]">Critic Score</div>
                  <div className="text-lg font-bold font-mono-code text-white">
                    <span className="text-[#38BDF8]">{scoreB.toFixed(1)}</span>/10
                  </div>
                </div>
              )}
            </div>

            {verdictB && (
              <div className="p-2.5 rounded bg-[#141426] border-l-2 border-[#38BDF8] text-xs text-[#D9D9D9] italic text-[11px]">
                "{verdictB}"
              </div>
            )}

            <div className="prose-editorial text-xs max-h-[500px] overflow-y-auto pr-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {branchBStream || (activeBranch === "B" ? "*Gathering and parsing intelligence on Branch B...*" : "*Queued for comparative synthesis...*")}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
