"use client";

import React, { useState } from "react";
import { Star, Clock, Cpu, DollarSign, Shield } from "lucide-react";
import { ReportEditor } from "./ReportEditor";
import { CriticFeedbackCard } from "./CriticFeedbackCard";
import { SourcesList } from "./SourcesList";
import { ExportDropdown } from "./ExportDropdown";
import { Badge } from "@/components/ui/Badge";
import { ReportItem, SourceItem } from "@/lib/types";
import { formatCost, formatDate } from "@/lib/utils";

interface ReportViewerProps {
  report: ReportItem;
  sources: SourceItem[];
  model?: string;
  totalTokens?: number;
  estimatedCost?: number;
  durationSeconds?: number;
  onSaveReport: (title: string, content: string) => Promise<void>;
  onToggleFavorite?: (isFav: boolean) => Promise<void>;
  onImprove: () => void;
  isImproving?: boolean;
}

export function ReportViewer({
  report,
  sources,
  model = "gpt-4o-mini",
  totalTokens = 0,
  estimatedCost = 0,
  durationSeconds = 0,
  onSaveReport,
  onToggleFavorite,
  onImprove,
  isImproving = false,
}: ReportViewerProps) {
  const [isFav, setIsFav] = useState(report.is_favorite);

  const handleFavoriteClick = async () => {
    const next = !isFav;
    setIsFav(next);
    if (onToggleFavorite) {
      await onToggleFavorite(next);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Metadata */}
      <div className="surface-card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="purple" size="sm">
              <Cpu className="w-3 h-3" />
              {model}
            </Badge>
            {durationSeconds > 0 && (
              <Badge variant="neutral" size="sm">
                <Clock className="w-3 h-3" />
                {durationSeconds.toFixed(1)}s
              </Badge>
            )}
            {totalTokens > 0 && (
              <Badge variant="silver" size="sm">
                {totalTokens} tokens
              </Badge>
            )}
            {estimatedCost > 0 && (
              <Badge variant="neutral" size="sm">
                <DollarSign className="w-3 h-3 text-[#A78BFA]" />
                {formatCost(estimatedCost)}
              </Badge>
            )}
          </div>

          <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-tight">
            {report.title}
          </h1>
          <p className="text-xs text-[#8E92A0] font-mono-code mt-1">
            Synthesized on {formatDate(report.created_at)} · Edition v{report.version}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded border transition-colors cursor-pointer ${
              isFav 
                ? "bg-[#6C35F7]/15 border-[#6C35F7]/40 text-[#A78BFA]" 
                : "bg-[#141426] border-[rgba(217,217,217,0.12)] text-[#8E92A0] hover:text-white"
            }`}
            title={isFav ? "Saved to Library" : "Bookmark to Library"}
          >
            <Star className={`w-4 h-4 ${isFav ? "fill-[#6C35F7] text-[#6C35F7]" : ""}`} />
          </button>

          <ExportDropdown
            reportId={report.id}
            publicId={report.public_id}
            content={report.content}
          />
        </div>
      </div>

      {/* Main Editable Report Body */}
      <ReportEditor
        initialTitle={report.title}
        initialContent={report.content}
        onSave={onSaveReport}
      />

      {/* Critic Evaluation & 1-Click Improvement */}
      <CriticFeedbackCard
        score={report.score}
        strengths={report.strengths}
        improvements={report.improvements}
        verdict={report.verdict}
        onImprove={onImprove}
        isImproving={isImproving}
      />

      {/* Discovered Knowledge Sources */}
      <SourcesList sources={sources} />
    </div>
  );
}
