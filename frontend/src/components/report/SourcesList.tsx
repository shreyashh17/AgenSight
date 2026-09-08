"use client";

import React from "react";
import { ExternalLink, Globe, CheckCircle2 } from "lucide-react";
import { SourceItem } from "@/lib/types";

interface SourcesListProps {
  sources: SourceItem[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="surface-card p-5 md:p-6 mb-8">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(217,217,217,0.1)]">
        <div>
          <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#C0C0C0]">
            Source Transparency
          </span>
          <h3 className="font-heading text-sm md:text-base font-bold text-white">
            Verified Citations & Scraped Context ({sources.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono-code text-[#C0C0C0] bg-[#141426] px-2 py-0.5 rounded border border-[rgba(217,217,217,0.1)]">
          Tavily + DOM Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-3 rounded-md bg-[#141426] hover:bg-[#181830] border border-[rgba(217,217,217,0.08)] hover:border-[#6C35F7]/40 transition-all duration-150"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  {source.favicon_url ? (
                    <img 
                      src={source.favicon_url} 
                      alt="" 
                      className="w-3.5 h-3.5 rounded shrink-0 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-[#6C35F7] shrink-0" />
                  )}
                  <span className="text-xs font-mono-code text-[#A78BFA] font-medium truncate">
                    {source.domain}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {source.is_scraped && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono-code text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Deep Scraped
                    </span>
                  )}
                  <ExternalLink className="w-3 h-3 text-[#8E92A0] group-hover:text-white transition-colors" />
                </div>
              </div>

              <h4 className="text-xs font-semibold text-white group-hover:text-white transition-colors line-clamp-1 mb-1">
                {source.title || source.url}
              </h4>

              {source.snippet && (
                <p className="text-[11px] text-[#8E92A0] line-clamp-2 leading-relaxed">
                  {source.snippet}
                </p>
              )}
            </div>

            <div className="mt-2 pt-1.5 border-t border-[rgba(217,217,217,0.06)] flex items-center justify-between text-[10px] font-mono-code text-[#8E92A0]">
              <span>Ref [{index + 1}]</span>
              {source.relevance_score && (
                <span>Fidelity: {Math.round(source.relevance_score * 100)}%</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
