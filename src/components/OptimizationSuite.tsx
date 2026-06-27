import React, { useState } from "react";
import { 
  Search, Cpu, Layers, Activity, CheckCircle, AlertCircle, ArrowRight, 
  Sparkles, Copy, Check, RefreshCw, FileText, Globe, Info, HelpCircle, CornerDownRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OptimizationResults {
  scores: {
    seo: number;
    geo: number;
    aeo: number;
  };
  motivatingRemark: string;
  seo: {
    titleSuggestions: string[];
    descriptionSuggestions: string[];
    recommendations: string[];
    optimizedCopy: string;
  };
  geo: {
    citationProbability: "High" | "Medium" | "Low" | string;
    recommendations: string[];
    optimizedCopy: string;
  };
  aeo: {
    schemaSuggestion: string;
    faqRecommendations: Array<{ q: string; a: string }>;
    optimizedCopy: string;
  };
}

export default function OptimizationSuite() {
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OptimizationResults | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"seo" | "geo" | "aeo">("seo");
  
  // Copy indicators
  const [copiedTitleIdx, setCopiedTitleIdx] = useState<number | null>(null);
  const [copiedDescIdx, setCopiedDescIdx] = useState<number | null>(null);
  const [copiedCopyText, setCopiedCopyText] = useState<"original" | "optimized" | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleOptimize = async () => {
    if (!text.trim()) {
      setError("Please paste or type some content text first to initiate optimization.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          keywords
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Optimization service failed.");
      }

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while analyzing content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (content: string, type: "original" | "optimized") => {
    navigator.clipboard.writeText(content);
    setCopiedCopyText(type);
    setTimeout(() => setCopiedCopyText(null), 2000);
  };

  const handleCopyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedTitleIdx(index);
    setTimeout(() => setCopiedTitleIdx(null), 2000);
  };

  const handleCopyDesc = (desc: string, index: number) => {
    navigator.clipboard.writeText(desc);
    setCopiedDescIdx(index);
    setTimeout(() => setCopiedDescIdx(null), 2000);
  };

  const handleCopySchema = (schema: string) => {
    navigator.clipboard.writeText(schema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20";
    if (score >= 60) return "text-amber-400 border-amber-500/20";
    return "text-rose-400 border-rose-500/20";
  };

  const getScoreProgressBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none" id="optimization-suite-stage">
      
      {/* Sleek Suite Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-blue-500" />
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono">LUMEN Interactive Suite</span>
        </div>
        <h2 className="text-2xl sm:text-3.5xl font-sans font-extrabold tracking-tight text-stone-100">
          Search, Generative &amp; Answer Engine Optimizer
        </h2>
        <p className="text-sm text-stone-400 max-w-2xl leading-relaxed">
          Align your message perfectly for human discovery (SEO), large language intelligence crawlers (GEO), and direct voice answer queries (AEO).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INPUT PANEL (LEFT Side on Desktop - span 5) */}
        <div className="lg:col-span-5 bg-[#09090b] border border-stone-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-900">
            <Sparkles size={14} className="text-blue-400" />
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">Analyze Your Strategy</h3>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Content Copy / Text Pitch</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Paste your homepage pitch, landing page copy, value statement, or blog content here to audit..."
                className="w-full bg-[#0d0d0d] border border-stone-850 hover:border-stone-800 focus:border-stone-700 rounded-lg p-3 text-sm text-stone-200 placeholder-stone-600 outline-none resize-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Target Keywords (Optional)</label>
                <span className="text-[10px] text-stone-600">Comma separated</span>
              </div>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. startup clarity, validation frameworks, business pivot"
                className="w-full bg-[#0d0d0d] border border-stone-850 hover:border-stone-800 focus:border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 outline-none transition"
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading || !text.trim()}
              className="w-full bg-stone-100 hover:bg-white text-stone-950 text-xs font-bold py-3 px-4 rounded-lg transition tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-stone-900" />
                  Synthesizing Alignment Metrics...
                </>
              ) : (
                <>
                  <Activity size={13} className="text-stone-950" />
                  Run Comprehensive Audit
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/40 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Informative Box */}
          <div className="p-3 bg-stone-900/30 border border-stone-850 rounded-lg text-[11px] text-stone-500 space-y-1 select-none">
            <p className="font-semibold text-stone-400 flex items-center gap-1">
              <Info size={11} className="text-blue-500" /> Understanding Optimization Pillars:
            </p>
            <ul className="list-disc pl-3.5 space-y-1">
              <li><strong className="text-stone-400">SEO</strong> audit scans metadata, heading structures, and traditional search indexing patterns.</li>
              <li><strong className="text-stone-400">GEO</strong> (Generative Engine) inspects if LLMs (Gemini, Copilot, ChatGPT) can parse, cite, and reference this text safely.</li>
              <li><strong className="text-stone-400">AEO</strong> (Answer Engine) evaluates snippet markup and Q&A formatting for smart voice-assistant matching.</li>
            </ul>
          </div>
        </div>

        {/* RESULTS PANEL (RIGHT Side on Desktop - span 7) */}
        <div className="lg:col-span-7 space-y-5">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#09090b]/40 border border-stone-900 border-dashed rounded-xl py-24 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mx-auto text-stone-600 border border-stone-850">
                  <Globe size={20} />
                </div>
                <p className="text-sm font-semibold text-stone-300">Ready for Optimization</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Paste your raw web content on the left to review instant optimization ratings, motivating remarks, and expert rewrites.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results-loaded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* 1. Motivating Remark Quote Card */}
                <div className="bg-[#09090b] border border-stone-900 rounded-xl p-4.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                    <Sparkles size={11} /> LUMEN Motivation
                  </p>
                  <p className="text-sm font-medium text-stone-200 italic leading-relaxed font-serif">
                    "{results.motivatingRemark}"
                  </p>
                </div>

                {/* 2. Visual Scores Grid */}
                <div className="grid grid-cols-3 gap-3.5">
                  {[
                    { label: "SEO Score", val: results.scores.seo, icon: Search, id: "seo-dial" },
                    { label: "GEO Score", val: results.scores.geo, icon: Cpu, id: "geo-dial" },
                    { label: "AEO Score", val: results.scores.aeo, icon: Layers, id: "aeo-dial" }
                  ].map((s) => {
                    return (
                      <div 
                        key={s.label}
                        className="bg-[#09090b] border border-stone-900 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 select-none"
                        id={s.id}
                      >
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                          <s.icon size={11} className="text-stone-400" />
                          {s.label}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-0.5">
                          <span className={getScoreColor(s.val)}>{s.val}</span>
                          <span className="text-xs text-stone-600">/100</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden border border-stone-900">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getScoreProgressBg(s.val)}`}
                            style={{ width: `${s.val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Detailed Tabs Options */}
                <div className="bg-[#09090b] border border-stone-900 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
                  
                  {/* Sub Tab Buttons */}
                  <div className="bg-[#0d0d0d] border-b border-stone-900 px-3 flex items-center justify-between">
                    <div className="flex space-x-1 py-2">
                      {[
                        { key: "seo", label: "Search Engine (SEO)", icon: Search },
                        { key: "geo", label: "Generative Engine (GEO)", icon: Cpu },
                        { key: "aeo", label: "Answer Engine (AEO)", icon: Layers }
                      ].map((tb) => {
                        const isActive = activeSubTab === tb.key;
                        return (
                          <button
                            key={tb.key}
                            onClick={() => setActiveSubTab(tb.key as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isActive 
                                ? "bg-stone-900 text-stone-100 border border-stone-800" 
                                : "text-stone-400 hover:text-stone-200"
                            }`}
                          >
                            <tb.icon size={12} />
                            {tb.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab Details View */}
                  <div className="p-5 flex-1 space-y-5">
                    
                    {/* SEO TAB CONTENT */}
                    {activeSubTab === "seo" && (
                      <div className="space-y-4" id="seo-tab-panel">
                        
                        {/* Title and Meta Description Suggestion Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle size={11} className="text-emerald-500" />
                              Title Tag Proposals
                            </h4>
                            <div className="space-y-1.5">
                              {results.seo.titleSuggestions.map((title, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-stone-950 border border-stone-900 rounded-lg p-2.5 text-xs text-stone-300">
                                  <span className="truncate pr-1 font-medium">{title}</span>
                                  <button
                                    onClick={() => handleCopyTitle(title, idx)}
                                    className="p-1 rounded hover:bg-stone-900 text-stone-500 hover:text-stone-300 transition"
                                  >
                                    {copiedTitleIdx === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle size={11} className="text-emerald-500" />
                              Meta Description Proposals
                            </h4>
                            <div className="space-y-1.5">
                              {results.seo.descriptionSuggestions.map((desc, idx) => (
                                <div key={idx} className="flex items-start justify-between bg-stone-950 border border-stone-900 rounded-lg p-2.5 text-xs text-stone-300 gap-1.5">
                                  <span className="font-medium text-left leading-relaxed">{desc}</span>
                                  <button
                                    onClick={() => handleCopyDesc(desc, idx)}
                                    className="p-1 rounded hover:bg-stone-900 text-stone-500 hover:text-stone-300 transition shrink-0"
                                  >
                                    {copiedDescIdx === idx ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Traditional Recommendations Checklist */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                            <Info size={11} className="text-blue-400" />
                            Core Action Checklist
                          </h4>
                          <div className="space-y-1 bg-stone-950/60 border border-stone-900 rounded-lg p-3">
                            {results.seo.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-stone-300 py-1">
                                <CornerDownRight size={12} className="text-stone-600 mt-0.5 shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Optimized Copy View */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                              <FileText size={12} className="text-blue-500" />
                              LUMEN SEO-Optimized Version
                            </h4>
                            <button
                              onClick={() => handleCopyText(results.seo.optimizedCopy, "optimized")}
                              className="text-xs text-stone-400 hover:text-stone-200 transition flex items-center gap-1 bg-stone-900 border border-stone-850 py-1 px-2.5 rounded-lg cursor-pointer"
                            >
                              {copiedCopyText === "optimized" ? (
                                <>
                                  <Check size={11} className="text-emerald-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  Copy Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-stone-950 border border-stone-900 rounded-lg p-4 font-sans text-xs text-stone-300 leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap select-text">
                            {results.seo.optimizedCopy}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* GEO TAB CONTENT */}
                    {activeSubTab === "geo" && (
                      <div className="space-y-4" id="geo-tab-panel">
                        
                        {/* Citation Index meter */}
                        <div className="p-4 bg-stone-950 border border-stone-900 rounded-xl flex items-center justify-between">
                          <div className="space-y-1 text-left">
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">AI Search Citation Likelihood</p>
                            <p className="text-sm text-stone-300 font-serif leading-relaxed">
                              How probable are Gemini, Perplexity, or ChatGPT Search to refer and attribute this content?
                            </p>
                          </div>
                          <div className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg font-mono font-bold text-sm text-blue-400">
                            {results.geo.citationProbability}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                            <Cpu size={11} className="text-purple-400" />
                            LLM &amp; Citation Engine Recommendations
                          </h4>
                          <div className="space-y-1 bg-stone-950/60 border border-stone-900 rounded-lg p-3">
                            {results.geo.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-stone-300 py-1">
                                <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GEO Optimized copy */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                              <FileText size={12} className="text-purple-400" />
                              LUMEN GEO-Optimized Version (High Citation Suitability)
                            </h4>
                            <button
                              onClick={() => handleCopyText(results.geo.optimizedCopy, "optimized")}
                              className="text-xs text-stone-400 hover:text-stone-200 transition flex items-center gap-1 bg-stone-900 border border-stone-850 py-1 px-2.5 rounded-lg cursor-pointer"
                            >
                              {copiedCopyText === "optimized" ? (
                                <>
                                  <Check size={11} className="text-emerald-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  Copy Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-stone-950 border border-stone-900 rounded-lg p-4 font-sans text-xs text-stone-300 leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap select-text">
                            {results.geo.optimizedCopy}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* AEO TAB CONTENT */}
                    {activeSubTab === "aeo" && (
                      <div className="space-y-4" id="aeo-tab-panel">
                        
                        {/* Schema.org markup box */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                              <Layers size={11} className="text-indigo-400" />
                              Recommended Schema.org Micro-Data
                            </h4>
                            <button
                              onClick={() => handleCopySchema(results.aeo.schemaSuggestion)}
                              className="text-xs text-stone-400 hover:text-stone-200 transition flex items-center gap-1 bg-stone-900 border border-stone-850 py-1 px-2.5 rounded-lg cursor-pointer"
                            >
                              {copiedSchema ? (
                                <>
                                  <Check size={11} className="text-emerald-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  Copy Schema
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-stone-950 border border-stone-900 rounded-lg p-3 font-mono text-[10px] text-indigo-300 leading-normal max-h-[140px] overflow-y-auto whitespace-pre-wrap select-text">
                            {results.aeo.schemaSuggestion}
                          </div>
                        </div>

                        {/* Smart Hub QA Recommendations */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                            <HelpCircle size={11} className="text-blue-400" />
                            Voice Assistants / Snippets Matching FAQ Template
                          </h4>
                          <div className="space-y-2">
                            {results.aeo.faqRecommendations.map((faq, i) => (
                              <div key={i} className="bg-stone-950/60 border border-stone-900 rounded-lg p-3 space-y-1">
                                <p className="text-xs font-bold text-stone-200">Q: {faq.q}</p>
                                <p className="text-xs text-stone-400 pl-4 border-l border-stone-800">A: {faq.a}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AEO optimized copy */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                              <FileText size={12} className="text-indigo-400" />
                              LUMEN AEO-Optimized Version (Snippet-Ready Structure)
                            </h4>
                            <button
                              onClick={() => handleCopyText(results.aeo.optimizedCopy, "optimized")}
                              className="text-xs text-stone-400 hover:text-stone-200 transition flex items-center gap-1 bg-stone-900 border border-stone-850 py-1 px-2.5 rounded-lg cursor-pointer"
                            >
                              {copiedCopyText === "optimized" ? (
                                <>
                                  <Check size={11} className="text-emerald-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  Copy Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-stone-950 border border-stone-900 rounded-lg p-4 font-sans text-xs text-stone-300 leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap select-text">
                            {results.aeo.optimizedCopy}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
