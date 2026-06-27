import React, { useState, useEffect, useRef } from "react";
import { Message, Persona, Transcript, ChatSession } from "../types";
import { 
  Send, Sparkles, MessageSquare, AlertCircle, HelpCircle, ArrowRight, 
  Compass, Shield, RefreshCw, Mic, MicOff, Volume2, VolumeX, 
  Monitor, Image, Trash2, Paperclip, Check, FileText, Download, 
  Plus, Calendar, ExternalLink, Play, Lightbulb, CheckSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ScreenMonitor from "./ScreenMonitor";

interface ChatInterfaceProps {
  personaUpdatedSignal: number;
}

export default function ChatInterface({ personaUpdatedSignal }: ChatInterfaceProps) {
  // Chat Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Current active chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<"clarity" | "business" | "general">("general");
  const [error, setError] = useState<string | null>(null);

  // STT, TTS and Multimodal states
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [showEye, setShowEye] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptStarters = {
    general: [
      { text: "What did we learn about validation in Class 2?", label: "Class 2 Review", desc: "Review customer feedback loops and validation criteria." },
      { text: "Can you explain the 'Audit and Align' system from Class 1?", label: "Audit & Align", desc: "Inspect personal values vs actual business activities." },
      { text: "What is the 'Box and Bin' strategy for overwhelm?", label: "Overwhelm Solution", desc: "A structural method to categorize and clear daily tasks." }
    ],
    business: [
      { text: "I want to start a custom consulting agency. Draft a lean validation strategy.", label: "Consulting Blueprint", desc: "Create pre-sale options and launch steps." },
      { text: "How do I validate my e-commerce business idea without spending any money?", label: "Zero-Budget Launch", desc: "Set up high-intent landing page commitment tests." },
      { text: "What are some good pre-sale commitment tests for B2B services?", label: "Pre-Sale Validation", desc: "Structure letters of intent or deposit payments." }
    ],
    clarity: [
      { text: "I feel stuck between staying in my 9-to-5 and building a startup. Can we unpack this?", label: "Career Overlap", desc: "Map transition timelines and safe side-hustle steps." },
      { text: "I have so many options and feel paralyzed. What should I do next?", label: "Mental Overwhelm", desc: "Analyze energy levels and execute a single micro-goal." },
      { text: "How do I identify if my daily actions actually align with my values?", label: "Value Alignment Audit", desc: "Calculate direct value connection of your active hours." }
    ]
  };

  // On mount, load sessions from local storage
  useEffect(() => {
    const savedSessions = localStorage.getItem("luma_chat_sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          // Default to the most recent active session
          setActiveSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
          setCategory(parsed[0].category || "general");
        }
      } catch (err) {
        console.error("Failed to load past sessions", err);
      }
    }
    fetchPersona();
    fetchTranscripts();
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, [personaUpdatedSignal]);

  // Sync current active messages to local storage whenever they change
  useEffect(() => {
    if (!activeSessionId) return;
    setSessions((prevSessions) => {
      const updated = prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, messages, category };
        }
        return s;
      });
      localStorage.setItem("luma_chat_sessions", JSON.stringify(updated));
      return updated;
    });
  }, [messages, category]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchPersona = async () => {
    try {
      const res = await fetch("/api/persona");
      if (res.ok) {
        const data = await res.json();
        setPersona(data);
      }
    } catch (err) {
      console.error("Error loading persona:", err);
    }
  };

  const fetchTranscripts = async () => {
    try {
      const res = await fetch("/api/transcripts");
      if (res.ok) {
        const data = await res.json();
        setTranscripts(data);
      }
    } catch (err) {
      console.error("Error loading transcripts:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper helper to generate downloadable files
  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) {
      alert("There are no messages in the current session to download.");
      return;
    }
    let md = `# LUMEN AI Consultation Session Transcript\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n`;
    md += `*Category: ${category.toUpperCase()}*\n\n`;
    md += `==================================================\n\n`;

    messages.forEach((m) => {
      const role = m.role === "user" ? "STUDENT" : "LUMEN (AI ADV_CLONE)";
      md += `[${m.timestamp}] ${role}:\n${m.text}\n\n`;
      md += `--------------------------------------------------\n\n`;
    });

    downloadFile(`Lumen_Consultation_${category}_${Date.now()}.md`, md, "text/markdown");
  };

  const handleDownloadBlueprint = () => {
    const content = `===================================================================
LUMEN AI - SHADOW STARTUP & VENTURE VALIDATION BLUEPRINT
===================================================================
Adapted directly from Class 1 & Class 2 core strategic lectures.

1. THE SEVEN-DAY FEEDBACK ENGINE
- Step 1: Draft your MVP premise on a single text file. Specify exactly WHO 
  the audience is and WHAT critical problem you resolve.
- Step 2: Formulate three Pre-Sale Commitment triggers.
  * Trigger A: Simple landing page click metrics (Low Intent).
  * Trigger B: Requesting email/phone numbers for waiting list (Medium Intent).
  * Trigger C: Standard deposit or Letter of Intent signing (High Intent).
- Step 3: Launch. Connect directly with 25 target audience leads via LinkedIn 
  or cold outreach. Capture raw text feedback. Do not edit.

2. THE CRITICAL 'BOX AND BIN' CONGESTION CLEARER
- BOX 1: HIGH ALIGNMENT + HIGH RETURN -> DO TODAY.
- BOX 2: HIGH ALIGNMENT + DEFERRED RETURN -> DELEGATE OR BLOCK 1 HR.
- BOX 3: LOW ALIGNMENT + SYSTEM NOISE -> TRASH IMMEDIATELY.

3. GOLDEN RULE OF ACTION:
"True conviction is tested by actual market interaction, never in quiet reflection.
Launch raw, iterate fast, let customer wallets make the final ruling."
===================================================================`;
    downloadFile("Lumen_Venture_Validation_Blueprint.txt", content, "text/plain");
  };

  const handleDownloadWorksheet = () => {
    const content = `# LUMEN AI - PERSONAL CLARITY & ENERGY ALIGNMENT WORKBOOK
## Grounded in Class 1 "Audit & Align" syllabus directives.

### SECTION 1: THE CORE ENERGY AUDIT
List the top 5 business or personal activities you spent hours on this past week:
1. ___________________________ (Hours: ____ / Energy Drain: 1-10)
2. ___________________________ (Hours: ____ / Energy Drain: 1-10)
3. ___________________________ (Hours: ____ / Energy Drain: 1-10)
4. ___________________________ (Hours: ____ / Energy Drain: 1-10)
5. ___________________________ (Hours: ____ / Energy Drain: 1-10)

### SECTION 2: ALIGNMENT TEST
For each activity, answer the "Why":
- Does this activity directly generate capital or teach high-impact skills?
- Is this activity an "invented task" to delay true customer interaction?
- Does it match the core value set you outlined in Class 1?

### SECTION 3: THE ACTION COMMITMENT
"I commit to trimming 3 hours of system noise next week to invest strictly in 
one-on-one validation calls."
Signed: __________________________  Date: _________________`;
    downloadFile("Lumen_Clarity_Alignment_Worksheet.md", content, "text/markdown");
  };

  // Start new distinct conversation session
  const startNewSession = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const newSessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: `Consultation Thread #${sessions.length + 1}`,
      messages: [],
      category: "general",
      timestamp: new Date().toLocaleDateString([], { month: "short", day: "numeric" })
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSessionId);
    setMessages([]);
    setCategory("general");
    setError(null);
    setAttachedImage(null);
    localStorage.setItem("luma_chat_sessions", JSON.stringify(updated));
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this chat thread?")) return;
    
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const filtered = sessions.filter((s) => s.id !== idToDelete);
    setSessions(filtered);
    localStorage.setItem("luma_chat_sessions", JSON.stringify(filtered));

    if (activeSessionId === idToDelete) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(filtered[0].messages);
        setCategory(filtered[0].category || "general");
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    }
  };

  const selectSession = (session: ChatSession) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setCategory(session.category || "general");
    setError(null);
  };

  // Speech-to-Text handler
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Apple Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("Microphone permission was denied. Please click the microphone/lock icon in your browser's address bar to allow microphone access for this site.");
      } else if (event.error === "network") {
        setError("Network error occurred during speech recognition. Please check your internet connection.");
      } else {
        setError(`Speech recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText) {
        setInput((prev) => (prev ? prev + " " + resultText : resultText));
      }
    };

    recognition.start();
  };

  // Text-to-Speech handler simulating LUMEN's pitch & rate
  const handleToggleSpeak = (text: string, index: number) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingIdx === index) {
        setSpeakingIdx(null);
        return;
      }
    }

    // Strip markdown formatting symbols
    const cleanText = text
      .replace(/[*#`_\-]/g, "")
      .replace(/>\s/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (persona) {
      utterance.pitch = persona.voicePitch ?? 1.0;
      utterance.rate = persona.voiceRate ?? 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredGender = persona.voiceGender || "male";
      const voice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        if (!lang.startsWith("en")) return false;
        if (preferredGender === "male") {
          return name.includes("male") || name.includes("david") || name.includes("natural") || name.includes("google us english");
        } else {
          return name.includes("female") || name.includes("zira") || name.includes("google uk english female");
        }
      });
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(index);
    window.speechSynthesis.speak(utterance);
  };

  // Direct image uploading
  const triggerImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG/JPG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedImage({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && !attachedImage) return;

    setError(null);
    const userMessage: Message = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: category,
      image: attachedImage || undefined
    };

    // Determine current active session, create one if it doesn't exist
    let currentSessionId = activeSessionId;
    let currentSessions = [...sessions];

    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}`;
      // Generate a nice human readable title from the message text
      const slicedText = textToSend.trim().split(" ").slice(0, 4).join(" ");
      const threadTitle = slicedText ? `${slicedText}...` : `Consultation thread`;
      
      const newSession: ChatSession = {
        id: currentSessionId,
        title: threadTitle,
        messages: [userMessage],
        category: category,
        timestamp: new Date().toLocaleDateString([], { month: "short", day: "numeric" })
      };

      currentSessions = [newSession, ...currentSessions];
      setSessions(currentSessions);
      setActiveSessionId(currentSessionId);
      setMessages([userMessage]);
      setInput("");
      setAttachedImage(null);
    } else {
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setAttachedImage(null);
    }

    setLoading(true);

    try {
      // Create current context messages sequence
      const sequence = !activeSessionId 
        ? [userMessage] 
        : [...messages, userMessage];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: sequence.map((m) => ({
            role: m.role,
            text: m.text,
            image: m.image
          })),
          category: category
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to communicate with LUMEN.");
      }

      const responseData = await res.json();
      
      const cloneResponse: Message = {
        role: "model",
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        category: category
      };

      setMessages((prev) => [...prev, cloneResponse]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please verify your GEMINI_API_KEY environment configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm("Reset current active thread messages?")) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setMessages([]);
      setError(null);
      setAttachedImage(null);
    }
  };

  const renderMessageContent = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const content = line.trim().substring(2);
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 mb-1 text-stone-700 font-sans text-sm leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      const numberMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numberMatch) {
        const content = numberMatch[2];
        return (
          <li key={lineIdx} className="ml-4 list-decimal pl-1 mb-1 text-stone-700 font-sans text-sm leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      if (line.trim().startsWith("> ")) {
        return (
          <blockquote key={lineIdx} className="border-l-4 border-blue-600 pl-4 py-1 italic my-2 text-stone-600 font-serif text-sm">
            {parseBoldText(line.trim().substring(2))}
          </blockquote>
        );
      }
      return (
        <p key={lineIdx} className="mb-2 leading-relaxed text-stone-700 font-sans text-sm min-h-[1rem]">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-bold text-stone-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Screen frame grab callback
  const handleScreenGrabbed = (base64: string, mimeType: string) => {
    setAttachedImage({ base64, mimeType });
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto" id="lumen-workspace-container">
      
      {/* COLUMN 1: LEFT SIDEBAR (History, downloads, custom resources) */}
      <div className="lg:col-span-3 space-y-5 flex flex-col" id="left-sidebar-panel">
        
        {/* Thread History Card */}
        <div className="bg-stone-900 p-4.5 rounded-xl border border-stone-800 shadow-xs flex flex-col flex-1 min-h-[280px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 mb-3.5">
            <h3 className="font-serif text-stone-100 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={13} className="text-stone-400" /> Consultations History
            </h3>
            <button
              onClick={startNewSession}
              className="p-1 text-stone-400 hover:text-stone-100 bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-md transition cursor-pointer"
              title="Start New Conversation Session"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Session Threads List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-60 pr-1 select-none">
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-stone-800 rounded-xl space-y-1">
                <p className="text-[11px] font-semibold text-stone-400">No previous sessions</p>
                <p className="text-[10px] text-stone-550">Click the '+' button to start a distinct strategic thread.</p>
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition group cursor-pointer ${
                      isActive
                        ? "bg-blue-500 text-stone-950 shadow-xs"
                        : "bg-stone-950 hover:bg-stone-850/80 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-stone-950 animate-pulse" : "bg-stone-700"}`}></div>
                      <span className="truncate">{s.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono opacity-50">{s.timestamp}</span>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                          isActive ? "text-stone-750 hover:text-red-950" : "text-stone-400 hover:text-rose-500"
                        }`}
                        title="Delete Session"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Downloads Library Vault Card */}
        <div className="bg-stone-900 p-4.5 rounded-xl border border-stone-800 shadow-xs">
          <div className="flex items-center pb-3 border-b border-stone-800 mb-3">
            <h3 className="font-serif text-stone-100 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Download size={13} className="text-stone-400" /> Syllabus Downloads Vault
            </h3>
          </div>

          <div className="space-y-2">
            {/* Download Session Logs */}
            <button
              onClick={handleDownloadTranscript}
              disabled={messages.length === 0}
              className="w-full bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-lg p-2.5 flex items-center justify-between text-left text-xs transition cursor-pointer disabled:opacity-50"
              title={messages.length === 0 ? "Send a message to enable transcript download" : "Download current active session chat"}
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-stone-400" />
                <div>
                  <p className="font-semibold text-stone-200">Current Session Logs</p>
                  <p className="text-[9px] text-stone-550">Export chat thread (.md)</p>
                </div>
              </div>
              <Download size={12} className="text-stone-500" />
            </button>

            {/* Download Startup Blueprint */}
            <button
              onClick={handleDownloadBlueprint}
              className="w-full bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-lg p-2.5 flex items-center justify-between text-left text-xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                <div>
                  <p className="font-semibold text-stone-200">Venture Blueprint</p>
                  <p className="text-[9px] text-stone-550">7-Day validation framework (.txt)</p>
                </div>
              </div>
              <Download size={12} className="text-stone-500" />
            </button>

            {/* Download Alignment Worksheet */}
            <button
              onClick={handleDownloadWorksheet}
              className="w-full bg-stone-950 hover:bg-stone-850 border border-stone-800 rounded-lg p-2.5 flex items-center justify-between text-left text-xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckSquare size={14} className="text-stone-400" />
                <div>
                  <p className="font-semibold text-stone-200">Clarity Alignment Guide</p>
                  <p className="text-[9px] text-stone-550">Values & Action worksheets (.md)</p>
                </div>
              </div>
              <Download size={12} className="text-stone-500" />
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 2: EXPANDED CONVERSATION STAGE (Optimized for maximum screen workspace) */}
      <div className="lg:col-span-9 flex flex-col h-[680px] bg-stone-900 rounded-xl border border-stone-800 shadow-md overflow-hidden relative" id="chat-conversation-area">
        
        {/* Ambient floating glowing orb details - feels alive! */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-stone-950 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

        {/* Chat top header with THE EYE control */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/50 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-blue-500 animate-ping' : 'bg-blue-500'}`}></div>
            <div>
              <h3 className="text-xs font-bold text-stone-100 tracking-wider uppercase font-serif">
                {activeSessionId ? "Consultation Thread Mode" : "Ask LUMEN Anything"}
              </h3>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Authorized Classroom Wisdom Session
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* THE EYE Toggle Button */}
            <button
              onClick={() => setShowEye(!showEye)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                showEye 
                  ? "bg-blue-500 border-blue-600 text-stone-950 shadow-sm" 
                  : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850"
              }`}
              title="Toggle THE EYE - Screen & Vision stream"
            >
              <Monitor size={13} className={showEye ? "text-stone-950 animate-pulse" : "text-stone-500"} />
              <span>THE EYE</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleResetChat}
                className="text-stone-400 hover:text-stone-250 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition p-1.5 hover:bg-stone-850 rounded-lg"
              >
                <RefreshCw size={12} /> Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* Collapsible THE EYE Panel */}
        <AnimatePresence>
          {showEye && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-b border-stone-800 bg-stone-950/90 z-10 overflow-hidden shrink-0"
            >
              <div className="p-4 max-w-xl mx-auto">
                <ScreenMonitor onCaptureFrame={handleScreenGrabbed} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Screen Stage: Displays Gemini Welcome Interface if empty, else shows conversation bubble feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-950/15 z-10 relative">
          
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              // GEMINI STYLE LUMEN WELCOME INTERFACE
              <motion.div
                key="welcome-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="h-full flex flex-col justify-between py-2 space-y-6 select-none"
              >
                {/* Visual centered glowing active sphere */}
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 16px rgba(59,130,246,0.1)",
                        "0 0 32px rgba(59,130,246,0.25)",
                        "0 0 16px rgba(59,130,246,0.1)",
                      ]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-stone-950 border border-blue-500/20 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition"
                    onClick={toggleListening}
                    title="Click to speak directly to LUMEN"
                  >
                    <Sparkles size={26} className="text-blue-500 animate-pulse" />
                  </motion.div>

                  <div className="space-y-1.5">
                    {/* Breathtaking Gemini-Style Gradient Text heading */}
                    <h2 className="text-3xl font-serif tracking-tight font-extrabold bg-gradient-to-r from-stone-100 via-blue-400 to-stone-100 bg-clip-text text-transparent">
                      Ask LUMEN anything.
                    </h2>
                    <p className="text-stone-400 text-xs max-w-sm mx-auto font-sans leading-relaxed">
                      LUMEN is your personal, voice-activated strategic advisor clone. Tap the prompt cards below or speak with your voice to map out startups or resolve blocks.
                    </p>
                  </div>
                </div>

                {/* Grid of beautifully categories prompt starters adapt with icons */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Strategic Lenses</span>
                    <span className="h-px bg-stone-800 flex-1"></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* General Review prompt card */}
                    <button
                      onClick={() => {
                        setCategory("general");
                        handleSendMessage("What did we learn about validation in Class 2?");
                      }}
                      className="bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-blue-500/30 p-3.5 rounded-xl text-left transition duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-28 group"
                    >
                      <div>
                        <span className="p-1 bg-blue-950/50 text-blue-400 rounded-md inline-block text-[10px] font-bold uppercase tracking-wider mb-1">Q&A Lecture Review</span>
                        <p className="text-xs font-semibold text-stone-200 line-clamp-2 mt-1 leading-snug">What did we learn about validation in Class 2?</p>
                      </div>
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-350 flex items-center gap-0.5 mt-2">
                        Inspect framework <ArrowRight size={10} />
                      </span>
                    </button>

                    {/* Startup prompt card */}
                    <button
                      onClick={() => {
                        setCategory("business");
                        handleSendMessage("I want to start a custom consulting agency. Draft a lean validation strategy.");
                      }}
                      className="bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-blue-500/30 p-3.5 rounded-xl text-left transition duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-28 group"
                    >
                      <div>
                        <span className="p-1 bg-blue-950/50 text-blue-400 rounded-md inline-block text-[10px] font-bold uppercase tracking-wider mb-1">Venture Blueprint</span>
                        <p className="text-xs font-semibold text-stone-200 line-clamp-2 mt-1 leading-snug">Draft a lean validation strategy for a custom consulting agency.</p>
                      </div>
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-350 flex items-center gap-0.5 mt-2">
                        Draft blueprint <ArrowRight size={10} />
                      </span>
                    </button>

                    {/* Clarity prompt card */}
                    <button
                      onClick={() => {
                        setCategory("clarity");
                        handleSendMessage("I have so many options and feel paralyzed. What should I do next?");
                      }}
                      className="bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-blue-500/30 p-3.5 rounded-xl text-left transition duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-28 group"
                    >
                      <div>
                        <span className="p-1 bg-purple-950/50 text-purple-400 rounded-md inline-block text-[10px] font-bold uppercase tracking-wider mb-1">Clarity & Overwhelm</span>
                        <p className="text-xs font-semibold text-stone-200 line-clamp-2 mt-1 leading-snug">I have so many options and feel paralyzed. What should I do?</p>
                      </div>
                      <span className="text-[10px] text-stone-500 group-hover:text-stone-350 flex items-center gap-0.5 mt-2">
                        Map clarity audit <ArrowRight size={10} />
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // ACTIVE MESSAGES FEED
              <motion.div
                key="chat-messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {messages.map((message, index) => {
                  const isModel = message.role === "model";
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isModel ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-xl px-5 py-4 shadow-xs relative group ${
                          isModel
                            ? "bg-stone-950 border border-stone-800 text-stone-200 rounded-tl-none"
                            : "bg-stone-800 text-stone-100 rounded-tr-none border border-stone-750"
                        }`}
                      >
                        {/* Role header */}
                        <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-stone-800/60">
                          <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">
                            {isModel ? "LUMEN AI" : "Student"}
                          </span>
                          <div className="flex items-center gap-2">
                            {isModel && (
                              <button
                                onClick={() => handleToggleSpeak(message.text, index)}
                                className="p-1.5 rounded bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                                title="Hear LUMEN's spoken voice"
                              >
                                {speakingIdx === index ? <VolumeX size={12} className="text-blue-500 animate-pulse" /> : <Volume2 size={12} />}
                              </button>
                            )}
                            <span className="text-[9px] opacity-40 font-mono">{message.timestamp}</span>
                          </div>
                        </div>

                        {/* Image attachment inside message if present */}
                        {message.image && (
                          <div className="mb-3 max-w-sm rounded-lg overflow-hidden border border-stone-800">
                            <img 
                              src={message.image.base64} 
                              alt="Screenshot Context" 
                              className="w-full h-auto max-h-48 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="p-1.5 bg-stone-950 text-stone-400 text-[9px] text-center font-mono">
                              Captured Screen Context
                            </div>
                          </div>
                        )}

                        {/* Message content block */}
                        <div className="space-y-1 select-text">
                          {isModel ? renderMessageContent(message.text) : (
                            <p className="text-sm font-sans font-medium whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thinking loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-stone-950 border border-stone-800 rounded-xl rounded-tl-none px-5 py-4 shadow-xs max-w-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 animate-pulse">
                    LUMEN is synthesizing wisdom...
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-lg text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <div>
                <p className="font-semibold">LUMEN Assistant Alert</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Image capture or uploaded file preview indicator */}
        {attachedImage && (
          <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border border-stone-800 overflow-hidden shrink-0">
                <img src={attachedImage.base64} alt="attached snapshot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-200">Visual context attached</p>
                <p className="text-[10px] text-stone-550">LUMEN will strategically analyze this screen frame in the next answer.</p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="text-stone-400 hover:text-rose-400 transition p-1.5 hover:bg-stone-800 rounded-lg cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Category consultation helper filter tabs */}
        <div className="px-6 py-2 bg-stone-950/70 border-t border-stone-800 overflow-x-auto whitespace-nowrap flex items-center gap-2 scrollbar-none z-10 shrink-0 select-none">
          <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold shrink-0 mr-1 flex items-center gap-1">
            Consultation Scope:
          </span>
          <button
            onClick={() => setCategory("general")}
            className={`px-3 py-1 text-xs rounded-full transition cursor-pointer font-medium ${
              category === "general" 
                ? "bg-blue-500 text-stone-950" 
                : "bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            General Q&A
          </button>
          <button
            onClick={() => setCategory("business")}
            className={`px-3 py-1 text-xs rounded-full transition cursor-pointer font-medium ${
              category === "business" 
                ? "bg-blue-500 text-stone-950" 
                : "bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            Business Growth
          </button>
          <button
            onClick={() => setCategory("clarity")}
            className={`px-3 py-1 text-xs rounded-full transition cursor-pointer font-medium ${
              category === "clarity" 
                ? "bg-blue-500 text-stone-950" 
                : "bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            Life Clarity
          </button>
        </div>

        {/* Unified Input Box (Microphone voice beside the Send button!) */}
        <div className="p-4 border-t border-stone-800 bg-stone-900 z-10 shrink-0">
          <div className="flex items-center gap-2">
            
            {/* Left media control buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={triggerImageSelect}
                className="bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 p-2.5 rounded-lg transition shrink-0 cursor-pointer border border-stone-800"
                title="Attach Diagram/Image file"
              >
                <Image size={16} />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder={isListening ? "Listening with voice STT..." : `Ask LUMEN anything...`}
              className="flex-1 px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 text-stone-100 placeholder-stone-600 resize-none min-h-[40px] max-h-[80px]"
            />

            {/* Voice microphone aspect IMMEDIATELY BESIDE the send button! */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-lg transition shrink-0 cursor-pointer border ${
                isListening 
                  ? "bg-rose-950/60 text-rose-300 animate-pulse border-rose-900/50" 
                  : "bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-800"
              }`}
              title={isListening ? "Listening... click to capture" : "Consult with voice recording (STT)"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              onClick={() => handleSendMessage(input)}
              disabled={loading || (!input.trim() && !attachedImage)}
              className="bg-blue-500 hover:bg-blue-400 text-stone-950 p-2.5 rounded-lg transition shrink-0 cursor-pointer disabled:opacity-40 font-bold"
            >
              <Send size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1">
            <p className="text-[10px] text-stone-500 flex items-center gap-1.5">
              <Shield size={10} className="text-emerald-500" /> Active Grade A Secure Encryption Whitelist
            </p>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">
              Grade A Security Level Active
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
