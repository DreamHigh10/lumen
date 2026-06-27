import React, { useState, useRef, useEffect } from "react";
import { Monitor, Play, Square, Camera, Sparkles, RefreshCw, Eye, Maximize2 } from "lucide-react";
import { motion } from "motion/react";

interface ScreenMonitorProps {
  onCaptureFrame: (base64: string, mimeType: string) => void;
}

export default function ScreenMonitor({ onCaptureFrame }: ScreenMonitorProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [scanActive, setScanActive] = useState(true);
  const [telemetry, setTelemetry] = useState({ x: 50, y: 50, label: "Scanning Focus Point" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-simulate telemetry analysis points for visual engagement
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const labels = [
        "Analyzing interface layout",
        "Detecting visual hierarchy",
        "Evaluating spacing & margins",
        "Reading textual context",
        "Analyzing structural flow",
        "Grounding previous class model"
      ];
      setTelemetry({
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 80) + 10,
        label: labels[Math.floor(Math.random() * labels.length)]
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false
      });
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Handle stream end by user (browser stop sharing button)
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Failed to start screen stream:", err);
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Draw current video frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      onCaptureFrame(base64, "image/jpeg");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 shadow-md p-5 relative overflow-hidden" id="screen-monitor-box">
      {/* Decorative top header line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

      <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-stone-950 text-stone-300 rounded-lg shrink-0 border border-stone-800">
            <Monitor size={16} className={isActive ? "animate-pulse text-blue-500" : ""} />
          </div>
          <div>
            <h3 className="font-serif text-stone-100 text-sm font-bold uppercase tracking-wide leading-tight">
              THE EYE
            </h3>
            <p className="text-[10px] text-stone-400 mt-0.5">
              {isActive ? "🔴 Stream active - LUMEN is watching" : "Provide visual context to LUMEN"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isActive && (
            <button
              onClick={() => setScanActive(!scanActive)}
              className={`p-1.5 rounded text-[10px] font-semibold border ${
                scanActive 
                  ? "bg-blue-950/60 text-blue-400 border-blue-900/50" 
                  : "bg-stone-950 text-stone-400 border-stone-800"
              }`}
              title="Toggle AI Grid Scanners"
            >
              Scan Grid
            </button>
          )}
        </div>
      </div>

      {/* Screen stream viewport */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-950 border border-stone-800 flex flex-col items-center justify-center group shadow-inner">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />

            {/* Glowing Scanline Animation */}
            {scanActive && (
              <motion.div
                initial={{ y: "0%" }}
                animate={{ y: "100%" }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute left-0 w-full h-0.5 bg-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.6)] pointer-events-none"
              />
            )}

            {/* Simulated Live Telemetry Tag */}
            {scanActive && (
              <motion.div
                animate={{
                  left: `${telemetry.x}%`,
                  top: `${telemetry.y}%`,
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-6 h-6 border border-blue-500/40 rounded-full animate-ping" />
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                  <div className="absolute left-4 top-0 bg-stone-900/90 text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-stone-700 whitespace-nowrap shadow-md">
                    <span className="text-blue-400 font-bold">LUMEN:</span> {telemetry.label}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live Streaming watermark */}
            <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs px-2 py-1 rounded text-[9px] font-mono text-stone-300 border border-stone-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              LIVE CAPTURED FEED
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-3.5 z-10">
            <div className="mx-auto w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-300">No screen session linked</p>
              <p className="text-[10px] text-stone-550 mt-1 max-w-xs mx-auto">
                Stream your classroom window, notes, or business plans so LUMEN can analyze them instantly.
              </p>
            </div>
            <button
              onClick={startScreenShare}
              className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer shadow-md"
            >
              <Play size={12} fill="currentColor" /> Start Live Screen
            </button>
          </div>
        )}

        {/* Floating action bar when streaming is active */}
        {isActive && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-xs border border-stone-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2.5 opacity-90 hover:opacity-100 transition z-20">
            <button
              onClick={captureFrame}
              className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide transition cursor-pointer"
              title="Send screenshot of current video frame to chat"
            >
              <Camera size={12} /> Capture Frame
            </button>

            <span className="text-stone-700 font-mono">|</span>

            <button
              onClick={stopScreenShare}
              className="text-stone-400 hover:text-rose-400 p-1 rounded transition cursor-pointer"
              title="Stop Streaming Screen"
            >
              <Square size={12} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {isActive && (
        <div className="mt-3 bg-stone-950 border border-stone-850 p-2.5 rounded-lg text-[10px] text-stone-400 leading-relaxed font-sans">
          💡 <strong>Pro Tip:</strong> Click <strong>Capture Frame</strong> anytime you are looking at something complex on your screen. This uploads the image frame directly to LUMEN so you can ask specific questions about it!
        </div>
      )}
    </div>
  );
}
