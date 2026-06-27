import React, { useState, useEffect, useRef } from "react";
import { Transcript } from "../types";
import { FileText, Plus, Trash2, Calendar, Tag, Upload, Clipboard, BookOpen, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TranscriptsManagerProps {
  onUpdate: () => void;
}

export default function TranscriptsManager({ onUpdate }: TranscriptsManagerProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for new transcript
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Accordion active state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Drag and drop upload states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transcripts");
      if (!res.ok) throw new Error("Could not retrieve class transcripts.");
      const data = await res.json();
      setTranscripts(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const res = await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, date, tags }),
      });

      if (!res.ok) throw new Error("Failed to upload class transcript.");
      const newT = await res.json();
      
      setTranscripts((prev) => [newT, ...prev]);
      setTitle("");
      setContent("");
      setTagsInput("");
      setShowAddForm(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to save transcript.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (!confirm(`Are you sure you want to delete "${titleStr}"? This will immediately remove it from the AI Clone's memory.`)) return;

    try {
      setError(null);
      const res = await fetch(`/api/transcripts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete transcript.");
      
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
      if (expandedId === id) setExpandedId(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to delete transcript.");
    }
  };

  // Drag & Drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      setError("Please upload plain text files (.txt) containing your class transcriptions.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setContent(text);
        // Set a default title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        setShowAddForm(true);
        setError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="transcripts-manager-view">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-sm">
        <div>
          <h2 className="text-xl font-serif text-stone-100 flex items-center gap-2">
            <BookOpen className="text-blue-500" size={20} />
            Classroom Transcripts Hub
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Feed the AI Clone your class transcripts. It will ground its responses and wisdom in what you've taught.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-center"
        >
          {showAddForm ? "View All Classes" : "Upload New Class"}
          <Plus size={16} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-lg text-rose-300 flex items-center gap-2 text-xs">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Upload/Add Form Area */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900 p-6 rounded-xl border border-stone-800 shadow-sm space-y-6"
        >
          <div className="border-b border-stone-800 pb-4">
            <h3 className="font-serif text-stone-100 text-lg">Add New Taught Lecture</h3>
            <p className="text-xs text-stone-400 mt-0.5">Drag & drop your transcript file or type the content manually below.</p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              isDragging
                ? "border-blue-500 bg-stone-950"
                : "border-stone-800 hover:border-stone-700 hover:bg-stone-950/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-stone-950 border border-stone-850 rounded-full text-stone-300">
                <Upload size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-200">
                  Drag and drop your .txt transcript file here, or <span className="text-blue-500 underline">browse your local files</span>
                </p>
                <p className="text-[11px] text-stone-500 mt-1 font-mono">Plain text files only (.txt)</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddTranscript} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Class Title / Topic
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 4: Master the Business Model Canvas"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-stone-100 placeholder-stone-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Lecture Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Business, Validation, Marketing"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-stone-100 placeholder-stone-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Full Class Transcription Text
              </label>
              <textarea
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the full transcription of the lecture here..."
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-lg text-xs font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-stone-100 placeholder-stone-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-stone-800 text-stone-400 hover:bg-stone-850 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Clipboard size={14} />
                {submitting ? "Uploading..." : "Save Class to Memory"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Classroom Syllabus / Interactive Accordion */}
      {!showAddForm && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-48 bg-stone-900 rounded-xl border border-stone-800">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transcripts.length === 0 ? (
            <div className="bg-stone-900 rounded-xl border border-stone-800 p-12 text-center">
              <FileText className="mx-auto text-stone-700 mb-4" size={48} />
              <h3 className="font-serif text-stone-200 text-base font-semibold">No Class Transcripts Recorded</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Your AI Clone has no class material to build its answers on. Click "Upload New Class" to inject your first transcription.
              </p>
            </div>
          ) : (
            transcripts.map((t) => {
              const isExpanded = expandedId === t.id;
              return (
                <div
                  key={t.id}
                  className="bg-stone-900 rounded-xl border border-stone-800 shadow-xs overflow-hidden transition hover:border-stone-700"
                >
                  {/* Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : t.id)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-stone-950 border border-stone-850 rounded-lg text-stone-400 mt-0.5 animate-pulse">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="font-serif text-stone-200 text-sm font-semibold hover:text-blue-400 transition">
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                            <Calendar size={10} /> {t.date}
                          </span>
                          {t.tags.map((tag) => (
                             <span
                              key={tag}
                              className="inline-flex items-center gap-0.5 bg-stone-950 border border-stone-850 text-stone-400 text-[10px] px-2 py-0.5 rounded-full font-medium"
                            >
                              <Tag size={8} /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id, t.title);
                        }}
                        className="text-stone-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete Class Memory"
                      >
                        <Trash2 size={16} />
                      </button>
                      <span className="text-stone-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded transcription details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-stone-800 bg-stone-950/40"
                      >
                        <div className="p-5 text-xs text-stone-300 font-sans leading-relaxed space-y-4">
                          <div className="p-3 bg-stone-950 rounded-lg border border-stone-850">
                            <span className="font-semibold text-stone-200">Class Objective/Summary:</span>
                            <p className="mt-1 text-stone-400 italic">{t.summary || t.content.substring(0, 200) + "..."}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="font-semibold text-stone-300 uppercase tracking-wider text-[10px] block">
                              Full Transcript Text:
                            </span>
                            <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed text-stone-300 font-mono text-[11px]">
                              {t.content}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
