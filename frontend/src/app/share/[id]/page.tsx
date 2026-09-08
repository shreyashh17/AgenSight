"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Globe, 
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApiService } from "@/lib/api";
import { ReportItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

export default function PublicSharePage() {
  const params = useParams();
  const publicId = params ? (params.id as string) : "";
  const [report, setReport] = useState<ReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublic() {
      try {
        const data = await ApiService.fetchPublicReport(publicId);
        setReport(data);
      } catch (err: any) {
        setError(err.message || "Public report not found");
      } finally {
        setIsLoading(false);
      }
    }
    if (publicId) {
      loadPublic();
    }
  }, [publicId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[#8E92A0] font-mono-code text-xs animate-pulse">
        Loading AgentSight verified intelligence report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-20 text-center surface-card p-8 max-w-lg mx-auto space-y-3">
        <h2 className="text-base font-bold text-white font-heading">Report Unavailable</h2>
        <p className="text-xs text-[#8E92A0]">{error || "This shared link might have expired or been removed."}</p>
        <Link href="/">
          <Button size="sm" variant="primary" className="mt-2 text-xs">
            Return to Studio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8E92A0] hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Launch AgentSight Studio</span>
        </Link>
        <Badge variant="purple" size="sm">
          <Globe className="w-3 h-3 text-[#A78BFA]" />
          Verified Intelligence Publication
        </Badge>
      </div>

      {/* Header Card */}
      <div className="surface-card p-6 md:p-8 space-y-3">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-[10px] font-mono-code uppercase text-[#8E92A0]">
            / Autonomous Synthesis
          </span>
        </div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {report.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#8E92A0] font-mono-code">
          <span>Published {formatDate(report.created_at)}</span>
          {report.score !== undefined && (
            <span className="text-emerald-400 font-bold">
              ★ Critic Score: {report.score.toFixed(1)}/10
            </span>
          )}
        </div>
      </div>

      {/* Critic Evaluation summary if present */}
      {report.verdict && (
        <div className="p-3.5 rounded bg-[#141426] border-l-2 border-[#6C35F7] text-xs text-[#D9D9D9] italic leading-relaxed">
          <span className="font-semibold text-[#A78BFA] block not-italic mb-0.5 font-mono-code uppercase text-[10px]">
            Critic Agent Verified Verdict:
          </span>
          "{report.verdict}"
        </div>
      )}

      {/* Markdown Content */}
      <div className="surface-card p-6 md:p-8">
        <div className="prose-editorial max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Sources Citations */}
      {report.sources && report.sources.length > 0 && (
        <div className="surface-card p-5 md:p-6">
          <h3 className="font-heading text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#6C35F7]" />
            Verified Citations ({report.sources.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {report.sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-[#141426] hover:bg-[#181830] border border-[rgba(217,217,217,0.08)] text-xs text-[#D9D9D9] transition-colors"
              >
                <div className="truncate mr-2">
                  <div className="font-medium text-white truncate text-xs">{s.title || s.domain}</div>
                  <div className="text-[10px] font-mono-code text-[#A78BFA]">{s.domain}</div>
                </div>
                <ExternalLink className="w-3 h-3 text-[#8E92A0] shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
