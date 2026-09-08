"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Download, 
  FileText, 
  FileCode, 
  Share2, 
  Copy, 
  Check, 
  ChevronDown, 
  FileJson 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiService } from "@/lib/api";

interface ExportDropdownProps {
  reportId: string;
  publicId?: string;
  content: string;
}

export function ExportDropdown({ reportId, publicId, content }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyShareLink = async () => {
    if (!publicId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/share/${publicId}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPdf = () => {
    window.open(ApiService.getPdfExportUrl(reportId), "_blank");
    setIsOpen(false);
  };

  const handleDownloadMarkdown = () => {
    window.open(ApiService.getMarkdownExportUrl(reportId), "_blank");
    setIsOpen(false);
  };

  const handleDownloadJson = () => {
    window.open(ApiService.getJsonExportUrl(reportId), "_blank");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-xs"
      >
        <Download className="w-3.5 h-3.5 text-[#6C35F7]" />
        <span>Export & Share</span>
        <ChevronDown className="w-3 h-3 text-[#8E92A0]" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-md bg-[#1A1C22] border border-[rgba(217,217,217,0.18)] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[9px] font-mono-code uppercase tracking-wider text-[#8E92A0] border-b border-[rgba(217,217,217,0.08)]">
            Export Document
          </div>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-[#D9D9D9] hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#F87171]" />
            <span>Download PDF Intelligence</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-[#D9D9D9] hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Download Markdown (.md)</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-[#D9D9D9] hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Download JSON Dataset</span>
          </button>

          <div className="px-3 py-1 text-[9px] font-mono-code uppercase tracking-wider text-[#8E92A0] border-t border-b border-[rgba(217,217,217,0.08)] mt-1">
            Publish & Link
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-[#D9D9D9] hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Copy className="w-3.5 h-3.5 text-[#8E92A0]" />
              <span>Copy Raw Markdown</span>
            </div>
            {copiedText && <Check className="w-3 h-3 text-emerald-400" />}
          </button>

          {publicId && (
            <button
              onClick={handleCopyShareLink}
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-[#D9D9D9] hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-3.5 h-3.5 text-[#6C35F7]" />
                <span>Copy Shareable URL</span>
              </div>
              {copiedLink && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
