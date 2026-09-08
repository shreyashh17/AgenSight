"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Coins, 
  Zap, 
  Clock, 
  Activity, 
  CheckCircle2,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ApiService } from "@/lib/api";
import { AnalyticsOverview } from "@/lib/types";
import { formatCost, formatDate, formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await ApiService.fetchAnalytics();
        setData(stats);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code text-[#C0C0C0] uppercase tracking-wider mb-1">
          <BarChart3 className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>System Observability</span>
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white">
          Telemetry & Compute Intelligence
        </h1>
        <p className="text-xs text-[#8E92A0] mt-0.5">
          Real-time tracking of token expenditure, estimated model API costs, agent latencies, and rubric benchmarks.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="py-20 text-center text-[#8E92A0] font-mono-code text-xs animate-pulse">
          Aggregating system telemetry data...
        </div>
      ) : (
        <>
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Sessions */}
            <div className="surface-card p-4">
              <div className="flex items-center justify-between text-[#8E92A0] mb-1">
                <span className="text-[10px] font-mono-code uppercase tracking-wider">Sessions Executed</span>
                <Activity className="w-4 h-4 text-[#6C35F7]" />
              </div>
              <div className="text-2xl font-bold font-mono-code text-white">
                {data.total_sessions}
              </div>
              <div className="text-[10px] font-mono-code text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{data.total_reports} Verified Reports</span>
              </div>
            </div>

            {/* Total Tokens */}
            <div className="surface-card p-4">
              <div className="flex items-center justify-between text-[#8E92A0] mb-1">
                <span className="text-[10px] font-mono-code uppercase tracking-wider">Total Tokens</span>
                <Zap className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div className="text-2xl font-bold font-mono-code text-white">
                {formatNumber(data.total_tokens)}
              </div>
              <div className="text-[10px] font-mono-code text-[#8E92A0] mt-1">
                Across 4-agent pipelines
              </div>
            </div>

            {/* Total Cost */}
            <div className="surface-card p-4">
              <div className="flex items-center justify-between text-[#8E92A0] mb-1">
                <span className="text-[10px] font-mono-code uppercase tracking-wider">Estimated Cost</span>
                <Coins className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono-code text-emerald-400">
                {formatCost(data.total_estimated_cost)}
              </div>
              <div className="text-[10px] font-mono-code text-[#8E92A0] mt-1">
                OpenAI + Tavily telemetry
              </div>
            </div>

            {/* Average Critic Score */}
            <div className="surface-card p-4">
              <div className="flex items-center justify-between text-[#8E92A0] mb-1">
                <span className="text-[10px] font-mono-code uppercase tracking-wider">Average Rubric</span>
                <Zap className="w-4 h-4 text-[#6C35F7]" />
              </div>
              <div className="text-2xl font-bold font-mono-code text-white">
                <span className="text-[#A78BFA]">{data.average_score.toFixed(1)}</span> <span className="text-xs font-normal text-[#8E92A0]">/ 10</span>
              </div>
              <div className="text-[10px] font-mono-code text-[#8E92A0] mt-1">
                Avg Latency: {data.average_duration_seconds}s
              </div>
            </div>
          </div>

          {/* Model Breakdown & Top Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Distribution */}
            <div className="surface-card p-4 md:p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 font-heading">
                <Zap className="w-3.5 h-3.5 text-[#6C35F7]" />
                Model Routing Distribution
              </h3>

              <div className="space-y-2.5">
                {Object.entries(data.sessions_by_model).map(([modelName, count]) => {
                  const pct = Math.round((count / (data.total_sessions || 1)) * 100);
                  return (
                    <div key={modelName} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono-code">
                        <span className="text-white">{modelName}</span>
                        <span className="text-[#A78BFA]">{count} runs ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#141426] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#6C35F7] h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Tags */}
            <div className="surface-card p-4 md:p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 font-heading">
                <Tag className="w-3.5 h-3.5 text-[#6C35F7]" />
                Frequent Intelligence Categories
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {data.top_tags.map((t) => (
                  <div
                    key={t.tag}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141426] border border-[rgba(217,217,217,0.1)] text-xs font-mono-code text-[#C0C0C0]"
                  >
                    <span>{t.tag}</span>
                    <span className="px-1 py-0.2 rounded bg-[#6C35F7]/20 text-[#A78BFA] text-[10px]">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="surface-card p-4 md:p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 font-heading">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Recent Agent Activity Stream
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[rgba(217,217,217,0.08)] text-[#8E92A0] font-mono-code text-[11px]">
                    <th className="py-2 px-3">Subject / Query</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Model</th>
                    <th className="py-2 px-3 text-right">Tokens</th>
                    <th className="py-2 px-3 text-right">Est. Cost</th>
                    <th className="py-2 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(217,217,217,0.06)]">
                  {data.recent_activity.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white max-w-xs truncate">
                        {item.topic}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="success" size="sm">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono-code text-[#C0C0C0] text-[11px]">
                        {item.model}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-code text-[#C0C0C0] text-[11px]">
                        {formatNumber(item.tokens)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-code text-emerald-400 text-[11px]">
                        {formatCost(item.cost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-code text-[#8E92A0] text-[11px]">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
