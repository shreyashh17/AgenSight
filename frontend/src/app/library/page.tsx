"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Star, 
  Trash2, 
  ExternalLink, 
  Cpu, 
  Filter,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApiService } from "@/lib/api";
import { SessionSummary } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function LibraryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.fetchSessions({
        q: searchQuery || undefined,
        tag: selectedTag || undefined,
        favorite_only: favoriteOnly || undefined,
      });
      setSessions(data);
    } catch (err) {
      console.error("Failed to load library sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [searchQuery, selectedTag, favoriteOnly]);

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this research session?")) return;

    try {
      await ApiService.deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const allTags = Array.from(
    new Set(sessions.flatMap((s) => s.tags || []))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code text-[#C0C0C0] uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#6C35F7]" />
            <span>Archive Index</span>
          </div>
          <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white">
            Knowledge Library & Synthesized Reports
          </h1>
        </div>

        <Link href="/">
          <Button size="sm" variant="primary" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Research</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E92A0]" />
            <input
              type="text"
              placeholder="Search intelligence archives or report titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs agent-input text-white placeholder-[#8E92A0] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border transition-colors cursor-pointer shrink-0 w-full sm:w-auto justify-center ${
              favoriteOnly
                ? "bg-[#6C35F7]/15 border-[#6C35F7]/40 text-[#A78BFA]"
                : "bg-[#141426] border-[rgba(217,217,217,0.12)] text-[#8E92A0] hover:text-white"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoriteOnly ? "fill-[#6C35F7] text-[#6C35F7]" : ""}`} />
            <span>Saved Only</span>
          </button>
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[rgba(217,217,217,0.08)] text-xs">
            <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#6C35F7]" /> Tag Filter:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-code transition-colors cursor-pointer ${
                selectedTag === null
                  ? "bg-[#6C35F7]/20 text-[#A78BFA] border border-[#6C35F7]/30 font-semibold"
                  : "bg-[#141426] text-[#8E92A0] hover:text-white"
              }`}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-code transition-colors cursor-pointer ${
                  selectedTag === t
                    ? "bg-[#6C35F7]/20 text-[#A78BFA] border border-[#6C35F7]/30 font-semibold"
                    : "bg-[#141426] text-[#8E92A0] hover:text-white border border-[rgba(217,217,217,0.06)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Session Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-[#8E92A0] font-mono-code text-xs animate-pulse">
          Querying AgentSight intelligence archive...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center surface-card p-8 space-y-3">
          <BookOpen className="w-8 h-8 text-[#8E92A0] mx-auto" />
          <h3 className="text-sm font-bold text-white font-heading">No archived intelligence records found</h3>
          <p className="text-xs text-[#8E92A0] max-w-sm mx-auto">
            {searchQuery || selectedTag || favoriteOnly
              ? "Try resetting filters or searching for alternative vectors."
              : "Launch your first research inquiry from the studio to build your library."}
          </p>
          <Link href="/">
            <Button size="sm" variant="primary" className="mt-1 text-xs">
              Execute Research
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="surface-card p-4 md:p-5 flex flex-col justify-between hover:border-[rgba(217,217,217,0.25)] transition-all duration-150 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="purple" size="sm">
                      <Cpu className="w-2.5 h-2.5" />
                      {session.model}
                    </Badge>
                    {session.report_score && (
                      <Badge variant="success" size="sm">
                        ★ {session.report_score.toFixed(1)}/10
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {session.is_favorite && (
                      <Star className="w-3.5 h-3.5 fill-[#6C35F7] text-[#6C35F7]" />
                    )}
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="p-1 text-[#8E92A0] hover:text-[#F87171] rounded transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#A78BFA] transition-colors line-clamp-2 mb-1.5 font-heading">
                  {session.report_title || session.topic}
                </h3>

                <p className="text-[11px] text-[#8E92A0] font-mono-code line-clamp-1 mb-3">
                  Vector: "{session.topic}"
                </p>

                {/* Tags */}
                {session.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {session.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-[#141426] text-[#8E92A0] border border-[rgba(217,217,217,0.06)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2.5 border-t border-[rgba(217,217,217,0.08)] flex items-center justify-between text-xs text-[#8E92A0]">
                <div className="flex items-center gap-2 font-mono-code text-[11px]">
                  <span>{formatDate(session.created_at)}</span>
                  <span>•</span>
                  <span>{session.total_tokens} tok</span>
                </div>

                <Link
                  href={`/?topic=${encodeURIComponent(session.topic)}`}
                  className="inline-flex items-center gap-1 text-[#A78BFA] hover:text-white font-medium text-xs transition-colors"
                >
                  <span>Re-open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
