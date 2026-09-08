"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Compass, 
  BookOpen, 
  GitCompare, 
  BarChart3, 
  Settings, 
  ArrowRight,
  X,
  Layers
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic?: (topic: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectTopic }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : void 0;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: "Research Studio", icon: Compass, href: "/" },
    { label: "Knowledge Library & Archive", icon: BookOpen, href: "/library" },
    { label: "Comparative Research Studio", icon: GitCompare, href: "/compare" },
    { label: "Telemetry & Usage Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Settings & API Keys", icon: Settings, href: "/settings" },
  ];

  const suggestedTopics = [
    "Next-Gen Retrieval-Augmented Generation (Self-RAG vs GraphRAG)",
    "Multi-Agent Swarm Architectures & Consensus Topologies 2026",
    "Server-Sent Events vs WebSockets for High-Concurrency Agent Streaming",
    "Rust vs Go for High-Scale Distributed Microservices",
    "Llama 3 vs Mistral Large Enterprise Benchmarks"
  ];

  const filteredNav = quickNav.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
  const filteredTopics = suggestedTopics.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  const handleNav = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleTopicClick = (topic: string) => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    } else {
      router.push(`/?topic=${encodeURIComponent(topic)}`);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#1A1C22] border border-[rgba(217,217,217,0.2)] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[rgba(217,217,217,0.1)] gap-3">
          <Search className="w-4 h-4 text-[#6C35F7] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a research topic or navigation command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                handleTopicClick(query.trim());
              }
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#8E92A0] focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#8E92A0] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Direct Submit Option */}
          {query.trim() && (
            <div 
              onClick={() => handleTopicClick(query.trim())}
              className="flex items-center justify-between p-3 rounded-md bg-[#6C35F7]/15 border border-[#6C35F7]/40 hover:bg-[#6C35F7]/25 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-xs md:text-sm font-medium text-white">
                  Execute intelligence research on: <span className="text-[#A78BFA] font-semibold">"{query}"</span>
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A78BFA]" />
            </div>
          )}

          {/* Navigation Section */}
          <div>
            <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] px-2 mb-1.5">
              Platform Views
            </div>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.href}
                    onClick={() => handleNav(item.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-xs md:text-sm text-[#D9D9D9] hover:text-white hover:bg-white/[0.05] cursor-pointer transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#8E92A0]" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Research Prompts */}
          <div>
            <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] px-2 mb-1.5">
              Verified Research Vectors
            </div>
            <div className="space-y-1">
              {filteredTopics.map((t) => (
                <div
                  key={t}
                  onClick={() => handleTopicClick(t)}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-[#C0C0C0] hover:text-white hover:bg-[#6C35F7]/10 cursor-pointer transition-colors group"
                >
                  <span className="truncate">{t}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#6C35F7] transition-opacity shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#141426] border-t border-[rgba(217,217,217,0.08)] text-[11px] text-[#8E92A0] font-mono-code">
          <span>Press ↵ to run</span>
          <span>ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
