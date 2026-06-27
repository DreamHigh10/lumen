import React, { useState, useEffect } from "react";
import { Persona } from "../types";
import { Save, AlertCircle, Plus, X, User, Heart, Sparkles, Check } from "lucide-react";
import { motion } from "motion/react";

interface PersonaSettingsProps {
  onUpdate: () => void;
  currentEmail: string;
}

export default function PersonaSettings({ onUpdate, currentEmail }: PersonaSettingsProps) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Input states for list arrays
  const [newKeyword, setNewKeyword] = useState("");
  const [newCatchphrase, setNewCatchphrase] = useState("");

  useEffect(() => {
    fetchPersona();
  }, []);

  const fetchPersona = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/persona");
      if (!res.ok) throw new Error("Failed to fetch persona settings");
      const data = await res.json();
      setPersona(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Email": currentEmail
        },
        body: JSON.stringify(persona),
      });

      if (!res.ok) throw new Error("Failed to save persona settings");
      const data = await res.json();
      setPersona(data);
      setSuccess(true);
      onUpdate();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Could not save persona.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !persona) return;
    if (persona.toneKeywords.includes(newKeyword.trim())) return;

    setPersona({
      ...persona,
      toneKeywords: [...persona.toneKeywords, newKeyword.trim()],
    });
    setNewKeyword("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    if (!persona) return;
    setPersona({
      ...persona,
      toneKeywords: persona.toneKeywords.filter((k) => k !== keyword),
    });
  };

  const handleAddCatchphrase = () => {
    if (!newCatchphrase.trim() || !persona) return;
    if (persona.catchphrases.includes(newCatchphrase.trim())) return;

    setPersona({
      ...persona,
      catchphrases: [...persona.catchphrases, newCatchphrase.trim()],
    });
    setNewCatchphrase("");
  };

  const handleRemoveCatchphrase = (phrase: string) => {
    if (!persona) return;
    setPersona({
      ...persona,
      catchphrases: persona.catchphrases.filter((p) => p !== phrase),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="p-4 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <p>Could not load the AI Clone settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" id="persona-settings-view">
      <div className="bg-stone-900 rounded-xl shadow-sm border border-stone-800 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-800">
          <div>
            <h2 className="text-2xl font-serif tracking-tight text-stone-100 flex items-center gap-2.5">
              <Sparkles className="text-blue-500 animate-pulse" size={24} />
              Identity Clone Studio
            </h2>
            <p className="text-stone-400 text-sm mt-1">
              Configure and train your AI Clone. These settings define how the AI behaves, speaks, and guides students.
            </p>
          </div>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-900/50"
            >
              <Check size={16} /> Saved Successfully
            </motion.div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/50 rounded-lg text-rose-300 flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Your Professional Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={persona.name}
                  onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                  placeholder="e.g. Professor Kehinde Ogungbade"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Professional Title or Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500">
                  <Heart size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={persona.title}
                  onChange={(e) => setPersona({ ...persona, title: e.target.value })}
                  placeholder="e.g. Lead Business Strategist & Life Alignment Mentor"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Short Professional Bio
            </label>
            <textarea
              required
              rows={3}
              value={persona.bio}
              onChange={(e) => setPersona({ ...persona, bio: e.target.value })}
              placeholder="Tell your students who you are and what your journey has been..."
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Core Mentorship Philosophy
            </label>
            <textarea
              required
              rows={3}
              value={persona.philosophy}
              onChange={(e) => setPersona({ ...persona, philosophy: e.target.value })}
              placeholder="What do you stand for? What is your core educational belief? e.g. Action-led growth, absolute value alignment, etc."
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Tone Keywords Section */}
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-850">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                Voice Tone Keywords
              </label>
              <p className="text-xs text-stone-500 mb-3 font-sans">Words that describe your speaking/writing style.</p>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {persona.toneKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-stone-900 text-stone-300 text-xs px-2.5 py-1 rounded-full font-medium border border-stone-800"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-stone-500 hover:text-stone-300 focus:outline-none"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="e.g. Empathetic, Analytical..."
                  className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-stone-100 placeholder-stone-600"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Custom Catchphrases Section */}
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-850">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                Your Catchphrases & Expressions
              </label>
              <p className="text-xs text-stone-500 mb-3 font-sans">Phrases you say often that make you sound like 'you'.</p>

              <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto pr-1">
                {persona.catchphrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-stone-900 text-stone-250 text-xs px-3 py-1.5 rounded-lg border border-stone-800"
                  >
                    <span className="italic">"{phrase}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCatchphrase(phrase)}
                      className="text-stone-500 hover:text-stone-300 focus:outline-none ml-2 shrink-0 animate-pulse"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatchphrase}
                  onChange={(e) => setNewCatchphrase(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCatchphrase())}
                  placeholder="Add catchphrases you repeat often..."
                  className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-stone-100 placeholder-stone-600"
                />
                <button
                  type="button"
                  onClick={handleAddCatchphrase}
                  className="bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Deep Training Guidelines (Advanced Clone Instructions)
            </label>
            <textarea
              rows={3}
              value={persona.customInstructions || ""}
              onChange={(e) => setPersona({ ...persona, customInstructions: e.target.value })}
              placeholder="Example: Keep responses highly action-oriented. Never write more than 4 short paragraphs. Make sure to call out students who seek shortcuts."
              className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-sm"
            />
          </div>

          {/* Voice parameters */}
          <div className="p-5 bg-stone-950 rounded-xl border border-stone-850 space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300">Educator Vocal Persona Profile</h4>
              <p className="text-[11px] text-stone-550 mt-0.5">Adjust how the AI Clone sounds when reading answers aloud.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Voice Gender Tone</label>
                <select
                  value={persona.voiceGender || "male"}
                  onChange={(e) => setPersona({ ...persona, voiceGender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-250 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="male">Rich Masculine (Default)</option>
                  <option value="female">Clear Feminine</option>
                  <option value="neutral">Neutral Adaptive</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Voice Pitch: {(persona.voicePitch || 1.0).toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.1"
                  value={persona.voicePitch || 1.0}
                  onChange={(e) => setPersona({ ...persona, voicePitch: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-stone-900 border border-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Speech Tempo: {(persona.voiceRate || 1.0).toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.1"
                  value={persona.voiceRate || 1.0}
                  onChange={(e) => setPersona({ ...persona, voiceRate: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-stone-900 border border-stone-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-stone-800">
            <p className="text-xs text-stone-500 italic">
              * The Persona settings will immediately refresh the AI Clone's speaking system.
            </p>
            <div className="flex items-center gap-3">
              {success && (
                <span className="md:hidden text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <Check size={14} /> Saved!
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Identity settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
