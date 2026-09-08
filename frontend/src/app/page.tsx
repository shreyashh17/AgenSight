"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  ArrowRight, 
  SlidersHorizontal, 
  Cpu, 
  Search, 
  ShieldCheck,
  Zap,
  Activity,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AgentProgressHeader } from "@/components/agent-feed/AgentProgressHeader";
import { AgentFeed } from "@/components/agent-feed/AgentFeed";
import { ReportViewer } from "@/components/report/ReportViewer";
import { ApiService } from "@/lib/api";
import { AgentName, AgentStreamEvent, ReportItem, SourceItem } from "@/lib/types";

function ResearchStudioContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams ? searchParams.get("topic") || "" : "";

  // Research Form State
  const [topic, setTopic] = useState(initialTopic);
  const [model, setModel] = useState("gpt-4o-mini");
  const [tone, setTone] = useState("analytical");
  const [length, setLength] = useState("detailed");
  const [mockMode, setMockMode] = useState(true); // Default enabled for instant zero-key demo
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Execution & Streaming State
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentName | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isImproving, setIsImproving] = useState(false);

  // Live Agent Feed State
  const [feedState, setFeedState] = useState({
    currentAgent: null as AgentName | null,
    searchStatus: "idle" as "idle" | "running" | "completed" | "error",
    readerStatus: "idle" as "idle" | "running" | "completed" | "error",
    writerStatus: "idle" as "idle" | "running" | "completed" | "error",
    criticStatus: "idle" as "idle" | "running" | "completed" | "error",
    searchThoughts: [] as string[],
    readerThoughts: [] as string[],
    writerThoughts: [] as string[],
    criticThoughts: [] as string[],
    searchSteps: [] as string[],
    readerSteps: [] as string[],
    writerSteps: [] as string[],
    criticSteps: [] as string[],
    sources: [] as SourceItem[],
    writerReportStream: "",
    criticScore: undefined as number | undefined,
    criticStrengths: [] as string[],
    criticImprovements: [] as string[],
    criticVerdict: undefined as string | undefined,
    tokens: { search: 0, reader: 0, writer: 0, critic: 0 },
  });

  // Final Report State
  const [finalReport, setFinalReport] = useState<ReportItem | null>(null);
  const [finalSources, setFinalSources] = useState<SourceItem[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stopStreamRef.current) stopStreamRef.current();
    };
  }, []);

  const samplePrompts = [
    "Next-Gen Retrieval-Augmented Generation (Self-RAG vs GraphRAG)",
    "Autonomous AI Multi-Agent Architectures in 2026",
    "Server-Sent Events vs WebSockets for Real-Time LLM Streaming",
    "Rust vs Go for High-Scale Distributed Microservices",
  ];

  const handleStartResearch = async (researchTopic?: string) => {
    const targetTopic = researchTopic || topic;
    if (!targetTopic.trim() || isRunning) return;

    // Reset states
    setIsRunning(true);
    setIsCompleted(false);
    setFinalReport(null);
    setFinalSources([]);
    setCurrentAgent("search");
    setDuration(0);

    setFeedState({
      currentAgent: "search",
      searchStatus: "running",
      readerStatus: "idle",
      writerStatus: "idle",
      criticStatus: "idle",
      searchThoughts: [],
      readerThoughts: [],
      writerThoughts: [],
      criticThoughts: [],
      searchSteps: [],
      readerSteps: [],
      writerSteps: [],
      criticSteps: [],
      sources: [],
      writerReportStream: "",
      criticScore: undefined,
      criticStrengths: [],
      criticImprovements: [],
      criticVerdict: undefined,
      tokens: { search: 0, reader: 0, writer: 0, critic: 0 },
    });

    // Start timer
    const startTime = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDuration((Date.now() - startTime) / 1000);
    }, 100);

    const stopStream = await ApiService.streamResearch(
      {
        topic: targetTopic,
        model,
        tone,
        length,
        mock_mode: mockMode,
      },
      (event: AgentStreamEvent) => {
        handleIncomingEvent(event, targetTopic);
      },
      (err) => {
        console.error("Research stream error:", err);
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      },
      () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    );

    stopStreamRef.current = stopStream;
  };

  const handleIncomingEvent = (event: AgentStreamEvent, currentTopic: string) => {
    if (event.session_id && !sessionId) {
      setSessionId(event.session_id);
    }

    setFeedState((prev) => {
      const next = { ...prev };
      const agent = event.agent;

      if (agent === "search") {
        next.searchStatus = "running";
        next.currentAgent = "search";
        setCurrentAgent("search");
        if (event.event_type === "thought") {
          next.searchThoughts = [...next.searchThoughts, event.message];
        } else if (event.event_type === "step") {
          next.searchSteps = [...next.searchSteps, event.message];
        } else if (event.event_type === "source_discovered" && event.data) {
          next.sources = [...next.sources, event.data as SourceItem];
        } else if (event.event_type === "complete") {
          next.searchStatus = "completed";
          if (event.data?.sources) next.sources = event.data.sources;
        }
      } else if (agent === "reader") {
        next.searchStatus = "completed";
        next.readerStatus = "running";
        next.currentAgent = "reader";
        setCurrentAgent("reader");
        if (event.event_type === "thought") {
          next.readerThoughts = [...next.readerThoughts, event.message];
        } else if (event.event_type === "step" || event.event_type === "scrape_progress") {
          next.readerSteps = [...next.readerSteps, event.message];
        } else if (event.event_type === "complete") {
          next.readerStatus = "completed";
          if (event.data?.scraped_sources) next.sources = event.data.scraped_sources;
        }
      } else if (agent === "writer") {
        next.readerStatus = "completed";
        next.writerStatus = "running";
        next.currentAgent = "writer";
        setCurrentAgent("writer");
        if (event.event_type === "thought") {
          next.writerThoughts = [...next.writerThoughts, event.message];
        } else if (event.event_type === "report_chunk" && event.data?.chunk) {
          next.writerReportStream = (next.writerReportStream || "") + event.data.chunk;
        } else if (event.event_type === "complete") {
          next.writerStatus = "completed";
          if (event.tokens) next.tokens.writer = event.tokens;
        }
      } else if (agent === "critic") {
        next.writerStatus = "completed";
        next.criticStatus = "running";
        next.currentAgent = "critic";
        setCurrentAgent("critic");
        if (event.event_type === "thought") {
          next.criticThoughts = [...next.criticThoughts, event.message];
        } else if (event.event_type === "critic_evaluation" && event.data) {
          next.criticScore = event.data.score;
          next.criticStrengths = event.data.strengths || [];
          next.criticImprovements = event.data.improvements || [];
          next.criticVerdict = event.data.verdict;
        } else if (event.event_type === "complete") {
          next.criticStatus = "completed";
          if (event.tokens) next.tokens.critic = event.tokens;
        }
      } else if (agent === "orchestrator" && event.event_type === "complete") {
        next.criticStatus = "completed";
        setIsCompleted(true);
        setIsRunning(false);

        // Build report
        const reportData: ReportItem = {
          id: sessionId || "temp-report-id",
          session_id: sessionId || "temp-session-id",
          public_id: "public-" + Math.random().toString(36).substring(2, 9),
          title: event.data?.title || `${currentTopic}: Analysis & Report`,
          content: event.data?.report_content || next.writerReportStream,
          score: event.data?.score || next.criticScore || 9.0,
          strengths: event.data?.strengths || next.criticStrengths,
          improvements: event.data?.improvements || next.criticImprovements,
          verdict: event.data?.verdict || next.criticVerdict,
          tags: ["#intelligence", `#${tone}`],
          is_favorite: false,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sources: next.sources,
        };

        setFinalReport(reportData);
        setFinalSources(next.sources);
        setTotalTokens(event.tokens || 3800);
        setEstimatedCost(event.data?.estimated_cost || 0.0035);

        // Confetti on high quality score
        if ((reportData.score || 0) >= 8.5) {
          try {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.8 },
              colors: ["#6C35F7", "#C0C0C0", "#FFFFFF"],
            });
          } catch {}
        }
      }

      return next;
    });
  };

  const handleImproveReport = async () => {
    if (!sessionId || isImproving) return;
    setIsImproving(true);

    const stopStream = await ApiService.streamImprovement(
      {
        session_id: sessionId,
        model,
        mock_mode: mockMode,
      },
      (event: AgentStreamEvent) => {
        handleIncomingEvent(event, topic);
      },
      (err) => {
        console.error("Improvement error:", err);
        setIsImproving(false);
      },
      () => {
        setIsImproving(false);
      }
    );

    stopStreamRef.current = stopStream;
  };

  const handleSaveReport = async (newTitle: string, newContent: string) => {
    if (!finalReport) return;
    try {
      if (sessionId) {
        await ApiService.updateReport(finalReport.id, {
          title: newTitle,
          content: newContent,
        });
      }
      setFinalReport({
        ...finalReport,
        title: newTitle,
        content: newContent,
        version: finalReport.version + 1,
      });
    } catch (e) {
      console.error("Failed to save report:", e);
    }
  };

  const handleToggleFavorite = async (isFav: boolean) => {
    if (!finalReport) return;
    try {
      if (sessionId) {
        await ApiService.updateReport(finalReport.id, { is_favorite: isFav });
      }
      setFinalReport({ ...finalReport, is_favorite: isFav });
    } catch (e) {
      console.error("Failed to favorite:", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Editorial Hero Header */}
      <div className="max-w-3xl pt-2 pb-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#6C35F7]/12 border border-[#6C35F7]/30 text-[11px] font-mono-code text-[#A78BFA] mb-3"
        >
          <Compass className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>Autonomous Multi-Agent Intelligence Swarm</span>
        </motion.div>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          Precision Research & <span className="text-[#6C35F7]">Executive Synthesis</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#C0C0C0] font-normal leading-relaxed max-w-2xl">
          Coordinate specialized autonomous agents (Search, Reader, Writer, Critic) to discover, scrape, verify, and critique deep intelligence reports in real time.
        </p>
      </div>

      {/* Main Research Input Card */}
      <motion.div 
        layout
        className="surface-card p-4 sm:p-6 transition-all shadow-xl hover:border-white/20"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartResearch();
          }}
          className="space-y-3.5"
        >
          <div className="relative flex items-center group">
            <Search className="absolute left-3.5 w-4 h-4 text-[#8E92A0] group-focus-within:text-[#6C35F7] transition-colors" />
            <input
              type="text"
              placeholder="Enter a subject, technical query, or intelligence vector..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isRunning}
              className="w-full pl-10 pr-32 py-3.5 agent-input text-xs sm:text-sm text-white placeholder-[#8E92A0] focus:outline-none focus:ring-2 focus:ring-[#6C35F7]/40 focus:border-[#6C35F7] transition-all"
            />
            <div className="absolute right-1.5">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isRunning}
                disabled={!topic.trim() || isRunning}
                className="gap-1.5 text-xs py-2 px-3.5"
              >
                <span>{isRunning ? "Synthesizing" : "Synthesize"}</span>
                {!isRunning && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Quick Prompt Suggestions */}
          {!isRunning && !finalReport && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-1.5 pt-0.5"
            >
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mr-1">Trending:</span>
              {samplePrompts.map((p, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => {
                    setTopic(p);
                    handleStartResearch(p);
                  }}
                  className="text-[11px] font-mono-code px-2.5 py-1 rounded-md bg-[#141426] hover:bg-[#6C35F7]/15 hover:text-white border border-[rgba(217,217,217,0.1)] hover:border-[#6C35F7]/40 text-[#C0C0C0] transition-colors cursor-pointer truncate max-w-xs shadow-xs"
                >
                  {p}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Controls & Advanced Config Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(217,217,217,0.08)] text-xs text-[#8E92A0]">
            <div className="flex flex-wrap items-center gap-4">
              {/* Model Choice */}
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#6C35F7]" />
                <span className="text-[#8E92A0]">Model:</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={isRunning}
                  className="bg-transparent text-[#D9D9D9] border-b border-[rgba(217,217,217,0.2)] focus:border-[#6C35F7] focus:outline-none pb-0.5 cursor-pointer text-xs"
                >
                  <option value="gpt-4o-mini" className="bg-[#1A1C22]">gpt-4o-mini (Fast & Efficient)</option>
                  <option value="gpt-4o" className="bg-[#1A1C22]">gpt-4o (Deep Reasoning)</option>
                </select>
              </div>

              {/* Demo Mode Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mockMode}
                  onChange={(e) => setMockMode(e.target.checked)}
                  disabled={isRunning}
                  className="rounded border-[rgba(217,217,217,0.2)] text-[#6C35F7] focus:ring-[#6C35F7]/30"
                />
                <span className="text-[#C0C0C0] font-medium text-xs">Demo Simulator</span>
                <Badge variant={mockMode ? "purple" : "neutral"} size="sm">
                  {mockMode ? "Zero-Key Ready" : "Live API"}
                </Badge>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-[#8E92A0] hover:text-white transition-colors cursor-pointer text-xs"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#6C35F7]" />
              <span>{showAdvanced ? "Hide Controls" : "Tone & Depth Parameters"}</span>
            </button>
          </div>

          {/* Advanced Config Panel */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 mt-2 rounded bg-[#141426] border border-[rgba(217,217,217,0.08)] overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mb-1">
                    Report Tone & Voice
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={isRunning}
                    className="w-full agent-input px-3 py-1.5 text-xs text-white"
                  >
                    <option value="analytical" className="bg-[#1A1C22]">Analytical & Objective</option>
                    <option value="formal" className="bg-[#1A1C22]">Academic & Formal</option>
                    <option value="executive" className="bg-[#1A1C22]">Executive Briefing</option>
                    <option value="casual" className="bg-[#1A1C22]">Relatable & Clear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mb-1">
                    Depth & Scope
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    disabled={isRunning}
                    className="w-full agent-input px-3 py-1.5 text-xs text-white"
                  >
                    <option value="brief" className="bg-[#1A1C22]">Executive Brief (~500 words)</option>
                    <option value="detailed" className="bg-[#1A1C22]">Standard Research (~1,200 words)</option>
                    <option value="exhaustive" className="bg-[#1A1C22]">Comprehensive Whitepaper (~2,000 words)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Real-Time Agent Stream Section */}
      <AnimatePresence>
        {(isRunning || isCompleted) && (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <AgentProgressHeader
              currentAgent={currentAgent}
              isCompleted={isCompleted}
              durationSeconds={duration}
            />

            <AgentFeed state={feedState} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Final Report Viewer when completed */}
      <AnimatePresence>
        {finalReport && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <ReportViewer
              report={finalReport}
              sources={finalSources}
              model={model}
              totalTokens={totalTokens}
              estimatedCost={estimatedCost}
              durationSeconds={duration}
              onSaveReport={handleSaveReport}
              onToggleFavorite={handleToggleFavorite}
              onImprove={handleImproveReport}
              isImproving={isImproving}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResearchStudioPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-mono-code text-[#8E92A0] text-xs">Loading AgentSight Studio...</div>}>
      <ResearchStudioContent />
    </Suspense>
  );
}
