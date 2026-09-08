"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Edit3, 
  Eye, 
  Save, 
  Undo, 
  Bold, 
  Italic, 
  Heading2, 
  List, 
  Code, 
  Quote, 
  Table 
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReportEditorProps {
  initialContent: string;
  initialTitle: string;
  onSave: (newTitle: string, newContent: string) => Promise<void>;
  isSaving?: boolean;
}

export function ReportEditor({ initialContent, initialTitle, onSave, isSaving = false }: ReportEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);

  const handleSave = async () => {
    await onSave(title, content);
    setOriginalContent(content);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  const insertSnippet = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("report-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  return (
    <div className="surface-card p-5 md:p-8 mb-8">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[rgba(217,217,217,0.1)]">
        <div className="flex items-center gap-1.5 bg-[#141426] p-1 rounded-md border border-[rgba(217,217,217,0.1)]">
          <button
            onClick={() => setIsEditing(false)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              !isEditing 
                ? "bg-[#1A1C22] text-white border border-[rgba(217,217,217,0.15)] shadow-xs" 
                : "text-[#8E92A0] hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reading View</span>
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              isEditing 
                ? "bg-[#6C35F7] text-white shadow-xs" 
                : "text-[#8E92A0] hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Inline Editor</span>
          </button>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="gap-1.5 text-xs text-[#8E92A0]"
            >
              <Undo className="w-3.5 h-3.5" />
              <span>Discard</span>
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              className="gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Edits</span>
            </Button>
          </div>
        )}
      </div>

      {/* Editing Toolbar */}
      {isEditing && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 mb-4 rounded bg-[#141426] border border-[rgba(217,217,217,0.1)]">
          <button
            onClick={() => insertSnippet("**", "**")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippet("*", "*")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippet("## ")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippet("- ")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippet("> ")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Quote Block"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippet("```\n", "\n```")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippet("| Dimension | Analysis | Recommendation |\n| :--- | :--- | :--- |\n| Scope | Detailed evaluation | High Priority |\n")}
            className="p-1.5 rounded hover:bg-white/10 text-[#C0C0C0] hover:text-white"
            title="Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content Rendering */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] block mb-1">
              Intelligence Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full agent-input px-3.5 py-2 text-sm md:text-base font-bold text-white font-heading"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] block mb-1">
              Markdown Body Content
            </label>
            <textarea
              id="report-textarea"
              rows={22}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full agent-input p-4 font-mono-code text-xs md:text-sm text-[#D9D9D9] leading-relaxed resize-y"
            />
          </div>
        </div>
      ) : (
        <div className="prose-editorial max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
