"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Key, 
  Cpu, 
  Save, 
  Check, 
  Shield 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ApiService } from "@/lib/api";
import { UserSettings } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form fields
  const [defaultModel, setDefaultModel] = useState("gpt-4o-mini");
  const [defaultTone, setDefaultTone] = useState("analytical");
  const [defaultLength, setDefaultLength] = useState("detailed");
  const [maxResults, setMaxResults] = useState(5);
  const [openaiKey, setOpenaiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await ApiService.fetchSettings();
        setSettings(res);
        setDefaultModel(res.default_model);
        setDefaultTone(res.default_tone);
        setDefaultLength(res.default_length);
        setMaxResults(res.max_search_results);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await ApiService.updateSettings({
        default_model: defaultModel,
        default_tone: defaultTone,
        default_length: defaultLength,
        max_search_results: maxResults,
        api_key_override: openaiKey || undefined,
        tavily_key_override: tavilyKey || undefined,
      });
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code text-[#C0C0C0] uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>Configuration</span>
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white">
          Agent & Model Preferences
        </h1>
        <p className="text-xs text-[#8E92A0] mt-0.5">
          Configure default LLM models, synthesis depth, search scraping limits, and custom API credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Model & Agent Defaults */}
        <div className="surface-card p-4 md:p-6 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
            <Cpu className="w-4 h-4 text-[#6C35F7]" />
            Default Synthesis Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mb-1">
                Default LLM Model
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full agent-input px-3 py-2 text-xs text-white"
              >
                <option value="gpt-4o-mini" className="bg-[#1A1C22]">gpt-4o-mini (Recommended - Fast & Economical)</option>
                <option value="gpt-4o" className="bg-[#1A1C22]">gpt-4o (Max Reasoning Capability)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mb-1">
                Default Voice & Tone
              </label>
              <select
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value)}
                className="w-full agent-input px-3 py-2 text-xs text-white"
              >
                <option value="analytical" className="bg-[#1A1C22]">Analytical & Objective</option>
                <option value="formal" className="bg-[#1A1C22]">Academic & Formal</option>
                <option value="executive" className="bg-[#1A1C22]">Executive Briefing</option>
                <option value="casual" className="bg-[#1A1C22]">Engaging & Clear</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mb-1">
                Default Scope & Depth
              </label>
              <select
                value={defaultLength}
                onChange={(e) => setDefaultLength(e.target.value)}
                className="w-full agent-input px-3 py-2 text-xs text-white"
              >
                <option value="brief" className="bg-[#1A1C22]">Executive Brief (~500 words)</option>
                <option value="detailed" className="bg-[#1A1C22]">Standard Research (~1,200 words)</option>
                <option value="exhaustive" className="bg-[#1A1C22]">Comprehensive Whitepaper (~2,000 words)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0] mb-1">
                Max Tavily Search Sources
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 5)}
                className="w-full agent-input px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="surface-card p-4 md:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
              <Key className="w-4 h-4 text-[#6C35F7]" />
              API Key Overrides (Optional)
            </h3>
            <Badge variant="silver" size="sm">
              <Shield className="w-3 h-3 text-[#C0C0C0]" />
              Encrypted Session
            </Badge>
          </div>

          <p className="text-xs text-[#8E92A0] leading-relaxed">
            By default, AgentSight uses configured environment variables or built-in Demo Simulator Mode. You can optionally supply your personal keys to override server defaults.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0]">
                  OpenAI API Key
                </label>
                {settings?.has_openai_key && (
                  <span className="text-[10px] font-mono-code text-emerald-400">
                    ● Key Active
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full agent-input px-3 py-2 text-xs font-mono-code text-white placeholder-[#8E92A0] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono-code uppercase tracking-wider text-[#8E92A0]">
                  Tavily Search API Key
                </label>
                {settings?.has_tavily_key && (
                  <span className="text-[10px] font-mono-code text-emerald-400">
                    ● Key Active
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="tvly-..."
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                className="w-full agent-input px-3 py-2 text-xs font-mono-code text-white placeholder-[#8E92A0] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-1">
          {savedSuccess && (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Settings updated successfully!
            </span>
          )}
          <div className="ml-auto">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              className="gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
