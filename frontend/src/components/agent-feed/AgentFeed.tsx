"use client";

import React from "react";
import { AgentCard } from "./AgentCard";
import { AgentName, SourceItem } from "@/lib/types";

interface AgentFeedState {
  currentAgent: AgentName | null;
  searchStatus: "idle" | "running" | "completed" | "error";
  readerStatus: "idle" | "running" | "completed" | "error";
  writerStatus: "idle" | "running" | "completed" | "error";
  criticStatus: "idle" | "running" | "completed" | "error";
  searchThoughts: string[];
  readerThoughts: string[];
  writerThoughts: string[];
  criticThoughts: string[];
  searchSteps: string[];
  readerSteps: string[];
  writerSteps: string[];
  criticSteps: string[];
  sources: SourceItem[];
  writerReportStream: string;
  criticScore?: number;
  criticStrengths?: string[];
  criticImprovements?: string[];
  criticVerdict?: string;
  tokens: {
    search: number;
    reader: number;
    writer: number;
    critic: number;
  };
}

interface AgentFeedProps {
  state: AgentFeedState;
}

export function AgentFeed({ state }: AgentFeedProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* 1. Search Agent Card */}
      <AgentCard
        agentName="search"
        status={state.searchStatus}
        title="Search Agent"
        roleDescription="Authoritative search vector query & domain cataloging"
        thoughts={state.searchThoughts}
        steps={state.searchSteps}
        sources={state.sources}
        tokens={state.tokens.search}
      />

      {/* 2. Reader Agent Card */}
      <AgentCard
        agentName="reader"
        status={state.readerStatus}
        title="Reader Agent"
        roleDescription="Deep DOM scraping, boilerplate stripping & distillation"
        thoughts={state.readerThoughts}
        steps={state.readerSteps}
        sources={state.sources.filter(s => s.is_scraped)}
        tokens={state.tokens.reader}
      />

      {/* 3. Writer Chain Card */}
      <AgentCard
        agentName="writer"
        status={state.writerStatus}
        title="Writer Chain"
        roleDescription="Structured synthesis into executive GitHub-flavored markdown"
        thoughts={state.writerThoughts}
        steps={state.writerSteps}
        reportStream={state.writerReportStream}
        tokens={state.tokens.writer}
      />

      {/* 4. Critic Agent Card */}
      <AgentCard
        agentName="critic"
        status={state.criticStatus}
        title="Critic Agent"
        roleDescription="Rubric validation, quality scoring & revision guidance"
        thoughts={state.criticThoughts}
        steps={state.criticSteps}
        criticScore={state.criticScore}
        criticStrengths={state.criticStrengths}
        criticImprovements={state.criticImprovements}
        criticVerdict={state.criticVerdict}
        tokens={state.tokens.critic}
      />
    </div>
  );
}
