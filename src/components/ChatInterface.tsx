import React, { useState, useEffect, useRef } from "react";
import { Message, Persona, Transcript, ChatSession } from "../types";
import { 
  Send, Sparkles, MessageSquare, AlertCircle, HelpCircle, ArrowRight, 
  Compass, Shield, RefreshCw, Mic, MicOff, Volume2, VolumeX, 
  Monitor, Image, Trash2, Paperclip, Check, FileText, Download, 
  Plus, Calendar, ExternalLink, Play, Lightbulb, CheckSquare, Sliders, ArrowUp,
  BookOpen, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ScreenMonitor from "./ScreenMonitor";

interface ChatInterfaceProps {
  personaUpdatedSignal: number;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeSessionId: string | null;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  onStartNewSession?: () => void;
}

export default function ChatInterface({ 
  personaUpdatedSignal, 
  sessions, 
  setSessions, 
  activeSessionId, 
  setActiveSessionId,
  onStartNewSession
}: ChatInterfaceProps) {
  
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

  // Sync messages and category from the active session in props
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      setCategory("general");
      return;
    }
    const current = sessions.find((s) => s.id === activeSessionId);
    if (current) {
      setMessages(current.messages);
      setCategory(current.category || "general");
    } else {
      setMessages([]);
      setCategory("general");
    }
  }, [activeSessionId, sessions]);

  // Sync current active messages back to local storage whenever they change
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

  useEffect(() => {
    fetchPersona();
    fetchTranscripts();
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, [personaUpdatedSignal]);

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
        setError("Microphone permission was denied. Please allow microphone access in your browser's address bar settings.");
      } else if (event.error === "network") {
        setError("Network error occurred during speech recognition.");
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
      setError(err.message || "An unexpected error occurred. Please verify your GEMINI_API_KEY configuration.");
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
          <li key={lineIdx} className="ml-4 list-disc pl-1 mb-1 text-stone-300 font-sans text-sm leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      const numberMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numberMatch) {
        const content = numberMatch[2];
        return (
          <li key={lineIdx} className="ml-4 list-decimal pl-1 mb-1 text-stone-300 font-sans text-sm leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      if (line.trim().startsWith("> ")) {
        return (
          <blockquote key={lineIdx} className="border-l-4 border-blue-600 pl-4 py-1 italic my-2 text-stone-400 font-serif text-sm">
            {parseBoldText(line.trim().substring(2))}
          </blockquote>
        );
      }
      return (
        <p key={lineIdx} className="mb-2 leading-relaxed text-stone-300 font-sans text-sm min-h-[1rem]">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-bold text-stone-100">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Screen frame grab callback
  const handleScreenGrabbed = (base64: string, mimeType: string) => {
    setAttachedImage({ base64, mimeType });
    setError(null);
  };

  const triggerTranscriptsTab = () => {
    document.getElementById("nav-tab-transcripts")?.click();
  };

  const triggerPersonaTab = () => {
    document.getElementById("nav-tab-persona")?.click();
  };

  // Render the large high-fidelity input card mimicking v0.dev exactly
  const renderInputCard = () => {
    const isSubmitDisabled = loading || (!input.trim() && !attachedImage);
    return (
      <div className="w-full max-w-2xl mx-auto space-y-3">
        {/* Custom Input Card Wrapper */}
        <div className="bg-[#09090b] border border-stone-850 rounded-xl overflow-hidden shadow-2xl p-3 focus-within:border-stone-700 transition flex flex-col gap-2">
          
          {/* Main prompt input text area */}
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
            placeholder={isListening ? "Listening with voice STT..." : "Ask LUMEN to design, guide, or synthesize..."}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 text-stone-200 placeholder-stone-600 text-sm resize-none min-h-[60px]"
          />

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Image attachment file trigger */}
              <button
                type="button"
                onClick={triggerImageSelect}
                className="text-stone-500 hover:text-stone-300 p-2 hover:bg-stone-900 rounded-lg transition cursor-pointer"
                title="Attach snapshot / visual diagram"
              >
                <Plus size={16} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Sliders settings / voice trigger */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  isListening 
                    ? "bg-rose-950/40 text-rose-400 animate-pulse" 
                    : "text-stone-500 hover:text-stone-300 hover:bg-stone-900"
                }`}
                title={isListening ? "Listening... click to pause" : "Consult with your voice recording"}
              >
                <Mic size={15} />
              </button>
            </div>

            {/* Dynamic Up Arrow Circle submit button like v0/ChatGPT */}
            <button
              onClick={() => handleSendMessage(input)}
              disabled={isSubmitDisabled}
              className={`p-2 rounded-full transition cursor-pointer shrink-0 flex items-center justify-center ${
                !isSubmitDisabled
                  ? "bg-stone-100 hover:bg-white text-stone-950"
                  : "bg-stone-900 text-stone-700 cursor-not-allowed"
              }`}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Under input context status stripe */}
          <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 bg-stone-950/50 px-3 py-2 rounded-lg border border-stone-850 select-none">
            <span className="truncate flex items-center gap-1.5 text-stone-400 font-sans">
              <Sparkles size={11} className="text-blue-500" />
              Using active workspace context grounded in classroom wisdom.
            </span>
            <button 
              onClick={triggerTranscriptsTab}
              className="text-blue-400 hover:underline font-bold shrink-0 ml-1.5"
            >
              View Materials
            </button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-120px)] w-full" id="lumen-workspace-container">
      
      {/* Collapsible THE EYE Panel */}
      <AnimatePresence>
        {showEye && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-b border-stone-900 bg-stone-950 z-10 overflow-hidden shrink-0"
          >
            <div className="p-4 max-w-xl mx-auto">
              <ScreenMonitor onCaptureFrame={handleScreenGrabbed} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE WORKSPACE SCREEN STAGE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-950/15 z-10 relative flex flex-col">
        
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            // REDESIGNED V0-STYLE WELCOME INTERFACE
            <motion.div
              key="welcome-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-12 space-y-8 select-none"
            >
              <div className="text-center space-y-5 flex flex-col items-center">
                {/* On top of the glowing LUMEN title as the identity of the AI */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-stone-850 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-stone-950 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-blue-500/10 opacity-60 animate-pulse" />
                  <img 
                    src="/John%20immage.jpg" 
                    alt="LUMEN AI Cybernetic Identity" 
                    className="w-full h-full object-cover relative z-10 filter brightness-110 contrast-105" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Title with logo on Left Hand Side (LHS) removed, keeping only the title */}
                <div className="flex items-center justify-center">
                  <h1 className="text-5xl sm:text-7xl font-sans font-black tracking-widest uppercase select-none text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 via-blue-500 to-cyan-500 animate-pulse drop-shadow-[0_0_25px_rgba(168,85,247,0.7)] leading-none py-1">
                    LUMEN
                  </h1>
                </div>

                <p className="text-stone-300 text-sm max-w-lg mx-auto font-medium tracking-wide">
                  "Clarity is created through action, not overthinking. Your alignment and strategic leap start here today."
                </p>
              </div>

              {/* Large styled input card */}
              {renderInputCard()}

              {/* Grid of high-fidelity responsive suggestions chips */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 max-w-2xl mx-auto">
                <button
                  onClick={() => { handleScreenGrabbed("", ""); setShowEye(true); }}
                  className="bg-[#09090b] hover:bg-stone-900 border border-stone-850 hover:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 transition duration-250 cursor-pointer flex items-center gap-2"
                >
                  <Monitor size={13} className="text-blue-500" />
                  Clone a Screenshot
                </button>

                <button
                  onClick={triggerTranscriptsTab}
                  className="bg-[#09090b] hover:bg-stone-900 border border-stone-850 hover:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 transition duration-250 cursor-pointer flex items-center gap-2"
                >
                  <BookOpen size={13} className="text-stone-400" />
                  Review Class Materials
                </button>

                <button
                  onClick={triggerPersonaTab}
                  className="bg-[#09090b] hover:bg-stone-900 border border-stone-850 hover:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 transition duration-250 cursor-pointer flex items-center gap-2"
                >
                  <User size={13} className="text-purple-400" />
                  Tweak Persona Studio
                </button>

                {onStartNewSession && (
                  <button
                    onClick={onStartNewSession}
                    className="bg-[#09090b] hover:bg-stone-900 border border-stone-850 hover:border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 transition duration-250 cursor-pointer flex items-center gap-2"
                  >
                    <Plus size={13} className="text-emerald-500" />
                    Start New Consultation
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            // ACTIVE MESSAGES FEED
            <motion.div
              key="chat-messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 max-w-3xl mx-auto w-full flex-1"
            >
              {/* Chat sub-header for active conversation utilities */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-900 mb-2 select-none">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-stone-500" />
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Strategic Consultation</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadTranscript}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-900/50 transition cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Export current consultation thread"
                  >
                    <Download size={13} />
                    <span>Export Logs</span>
                  </button>
                  <button
                    onClick={handleResetChat}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900/50 transition cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Reset current thread"
                  >
                    <RefreshCw size={13} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

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
                          ? "bg-[#09090b] border border-stone-900 text-stone-200 rounded-tl-none"
                          : "bg-stone-900 text-stone-100 rounded-tr-none border border-stone-850"
                      }`}
                    >
                      {/* Role header */}
                      <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-stone-900/60 select-none">
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-60">
                          {isModel ? "LUMEN AI" : "Student"}
                        </span>
                        <div className="flex items-center gap-2">
                          {isModel && (
                            <button
                              onClick={() => handleToggleSpeak(message.text, index)}
                              className="p-1.5 rounded bg-stone-950 hover:bg-stone-900 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                              title="Hear voice synthesis"
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
          <div className="flex justify-start max-w-3xl mx-auto w-full">
            <div className="bg-[#09090b] border border-stone-900 rounded-xl rounded-tl-none px-5 py-4 shadow-xs max-w-sm">
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
          <div className="p-4 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-lg text-xs flex items-center gap-2.5 max-w-3xl mx-auto w-full">
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
        <div className="max-w-3xl mx-auto w-full px-6 py-3 bg-stone-950 border-t border-stone-900 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-stone-900 overflow-hidden shrink-0">
              <img src={attachedImage.base64} alt="attached snapshot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-200 font-sans">Visual context attached</p>
              <p className="text-[10px] text-stone-500">LUMEN will analyze this image in the next message.</p>
            </div>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="text-stone-400 hover:text-rose-400 transition p-1.5 hover:bg-stone-900 rounded-lg cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* When chat is active, we render the input at the bottom (ChatGPT-style) */}
      {messages.length > 0 && (
        <div className="p-4 border-t border-stone-900 bg-[#0d0d0d] z-10 shrink-0">
          {renderInputCard()}
        </div>
      )}

    </div>
  );
}
