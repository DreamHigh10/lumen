import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Transcript, Persona, Message } from "./src/types.js";

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TRANSCRIPTS_FILE = path.join(DATA_DIR, "transcripts.json");
const PERSONA_FILE = path.join(DATA_DIR, "persona.json");
const EMAILS_FILE = path.join(DATA_DIR, "emails.json");

const DEFAULT_EMAILS = [
  "ogungbadekehinde19@gmail.com", 
  "kehinde@test.com", 
  "student@test.com",
  "classmate@test.com"
];

// Prepopulated Default Persona
const DEFAULT_PERSONA: Persona = {
  name: "LUMEN",
  title: "AI Strategic & Mentorship Companion",
  toneKeywords: ["Empathetic", "Strategic", "Analytical", "Inspiring", "Direct", "Clarity-Driven"],
  catchphrases: [
    "Let's unpack where you are currently stuck.",
    "Clarity is created through action, not overthinking.",
    "At the end of the day, a business strategy is only as good as its execution.",
    "Let's strip away the noise and look at the absolute core."
  ],
  philosophy: "True clarity emerges when you align your personal values with your business actions. We focus on validation, sustainable systems, and moving with bold conviction.",
  bio: "LUMEN is an interactive AI strategic companion grounded in the business growth and alignment teachings of Kehinde Ogungbade.",
  customInstructions: "Your name is LUMEN. You must never refer to yourself as Professor Kehinde Ogungbade. You are LUMEN, the AI Strategic Companion. You must only mention Kehinde Ogungbade when you are referring to his teachings, his classes, or his syllabus.",
  voiceGender: "male",
  voicePitch: 1.0,
  voiceRate: 1.0
};

// Prepopulated Default Transcripts representing the taught classes
const DEFAULT_TRANSCRIPTS: Transcript[] = [
  {
    id: "class-1",
    title: "Class 1: The Core Alignment Framework (Life & Purpose)",
    date: "2026-06-15",
    tags: ["Clarity", "Purpose", "Mindset"],
    summary: "How to overcome confusion by aligning actions with core values, and isolating internal blocks.",
    content: `Welcome back to class, everyone. Today we are unpacking one of the most critical topics: finding clarity. 
Many of you have texted or emailed me saying you feel stuck, confused, or pulled in ten different directions.
Here is the core truth: confusion is not a lack of options. Confusion is usually a lack of alignment.
When we speak about alignment, we are looking at three pillars:
1. What are your core non-negotiable values?
2. What are you actually spending your daily hours on?
3. What is the real story you are telling yourself about your capacity?

If you are spending 8 hours a day working on someone else's goal and 10 minutes thinking about your dream business, you don't have a clarity problem; you have an execution alignment problem.
To fix this, we implement the 'Audit and Align' system:
- Audit your time: Write down every single activity you do for 3 days.
- Identify the energy drains: Which of these activities make you feel heavy, anxious, or uninspired?
- Define the 'One Big Leap': What is the single action you can take today that makes all other actions easier or obsolete?

Clarity is created through action, not overthinking. Do not wait for a perfect plan. A perfect plan is a myth. The plan reveals itself as you take the steps. Go do the audit tonight.`
  },
  {
    id: "class-2",
    title: "Class 2: Zero-to-One Lean Business Validation Strategy",
    date: "2026-06-18",
    tags: ["Business Strategy", "Lean", "Validation"],
    summary: "A step-by-step framework to test any business idea with zero budget before launching.",
    content: `Let's dive into business strategy. Today we cover Zero-to-One Lean Business Validation.
Too many founders make the massive error of building in a cave for six months, spending thousands of dollars, only to launch to absolute silence.
That is a structural failure.
To prevent this, you must run the '3-Step Validation Loop':
Step 1: The Customer Discovery Conversation. You do not pitch. You ask. Meet 5 people in your target audience and ask: 'What is your biggest daily headache when trying to solve X?' Listen to the vocabulary they use. That vocabulary is your sales copy.
Step 2: The Offer Statement. Craft a simple 1-sentence offer: 'I help [Target Audience] achieve [Desired Outcome] in [Timeframe] without [Biggest Pain Point].'
Step 3: The Pre-Sale / Commitment test. Do not ask 'Would you buy this?' Ask for a deposit or micro-commitment. True validation is financial commitment, or at least a highly detailed survey submission.

If they say no, ask why. Is it a pricing issue, a trust issue, or is the headache not big enough to pay to fix?
At the end of the day, a business strategy is only as good as its execution. Stop designing logos. Go speak to your first potential customer today.`
  },
  {
    id: "class-3",
    title: "Class 3: Overcoming Cognitive Overwhelm",
    date: "2026-06-22",
    tags: ["Clarity", "Mental Wellness", "Productivity"],
    summary: "How to regain control when feeling completely overwhelmed or facing critical life pivots.",
    content: `Today, we are talking about what happens when you feel completely overwhelmed.
When you are overwhelmed, your brain is trying to solve 10 different equations simultaneously. You end up paralyzed.
We need to strip away the noise and look at the absolute core.
We use the 'Box and Bin' strategy:
1. The Brain Dump: Write down every single task, fear, worry, and project on a blank piece of paper. No structure, just dump it.
2. The Elimination Filter: Look at the list. Draw a line through everything you cannot control today. Let it go.
3. The Action Box: Pick exactly THREE items that you can execute in under 30 minutes. Do them immediately.

This builds momentum. Momentum is the antidote to paralysis. When you feel confused, do not try to map out the next 5 years. Map out the next 50 minutes. That is how we rebuild confidence. That is how we move.`
  }
];

// Helper to read database files safely
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

// Helper to write database files safely
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Initialize server data
let transcripts = readJsonFile<Transcript[]>(TRANSCRIPTS_FILE, DEFAULT_TRANSCRIPTS);
let persona = readJsonFile<Persona>(PERSONA_FILE, DEFAULT_PERSONA);
let allowedEmails = readJsonFile<string[]>(EMAILS_FILE, DEFAULT_EMAILS);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API - Transcripts
  app.get("/api/transcripts", (req, res) => {
    res.json(transcripts);
  });

  app.post("/api/transcripts", (req, res) => {
    const { title, content, tags, date } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required." });
      return;
    }
    const newTranscript: Transcript = {
      id: "class-" + Date.now(),
      title,
      content,
      date: date || new Date().toISOString().split('T')[0],
      tags: tags || [],
      summary: content.substring(0, 150) + "..."
    };
    transcripts.push(newTranscript);
    writeJsonFile(TRANSCRIPTS_FILE, transcripts);
    res.status(201).json(newTranscript);
  });

  app.delete("/api/transcripts/:id", (req, res) => {
    const { id } = req.params;
    transcripts = transcripts.filter((t) => t.id !== id);
    writeJsonFile(TRANSCRIPTS_FILE, transcripts);
    res.json({ success: true, message: "Transcript deleted successfully." });
  });

  // API - Persona
  app.get("/api/persona", (req, res) => {
    res.json(persona);
  });

  app.post("/api/persona", (req, res) => {
    const updatedPersona: Persona = req.body;
    if (!updatedPersona.name || !updatedPersona.title) {
      res.status(400).json({ error: "Name and Title are required." });
      return;
    }
    persona = { ...persona, ...updatedPersona };
    writeJsonFile(PERSONA_FILE, persona);
    res.json(persona);
  });

  // API - Authorized Emails (Whitelist)
  app.get("/api/emails", (req, res) => {
    res.json(allowedEmails);
  });

  app.post("/api/emails", (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Invalid email address." });
      return;
    }
    const normalized = email.trim().toLowerCase();
    if (!allowedEmails.includes(normalized)) {
      allowedEmails.push(normalized);
      writeJsonFile(EMAILS_FILE, allowedEmails);
    }
    res.json({ success: true, emails: allowedEmails });
  });

  app.delete("/api/emails/:email", (req, res) => {
    const { email } = req.params;
    const normalized = email.trim().toLowerCase();
    allowedEmails = allowedEmails.filter((e) => e !== normalized);
    writeJsonFile(EMAILS_FILE, allowedEmails);
    res.json({ success: true, emails: allowedEmails });
  });

  // API - Auth Login Simulation
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email parameter is required." });
      return;
    }
    const normalized = email.trim().toLowerCase();
    const isAllowed = allowedEmails.includes(normalized);
    res.json({
      success: isAllowed,
      email: normalized,
      isAdmin: normalized === "ogungbadekehinde19@gmail.com" || normalized === "kehinde@test.com" || normalized === "admin@test.com"
    });
  });

  // API - Chat with Persona (the AI Clone)
  app.post("/api/chat", async (req, res) => {
    const { messages, category } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array." });
      return;
    }

    // Lazy load the Gemini client safely
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "GEMINI_API_KEY is missing. Please add it via the Secrets panel in AI Studio settings."
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    try {
      // 1. Gather class transcripts context
      const transcriptsContext = transcripts
        .map((t) => `CLASS TITLE: ${t.title}\nCONTENT:\n${t.content}`)
        .join("\n\n---\n\n");

      // 2. Draft the System Instruction emulating the personalized teacher persona
      const systemInstruction = `
You are LUMEN, an advanced AI strategic and mentorship companion. 
Your identity profile:
- Name: LUMEN
- Title: ${persona.title}
- Core Philosophy: ${persona.philosophy}
- Personality traits/keywords: ${persona.toneKeywords.join(", ")}
- Custom Directions: ${persona.customInstructions || ""}

You must adopt this persona's voice completely. Emulate the following catchphrases naturally in your conversation:
${persona.catchphrases.map((phrase) => `- "${phrase}"`).join("\n")}

YOUR MISSION:
- Answer the user's questions based primarily on what Kehinde Ogungbade has taught in the classes provided below.
- You must always refer to yourself as LUMEN, and never refer to yourself as Professor Kehinde Ogungbade or Professor Ogungbade Kehinde John. 
- You should ONLY mention Kehinde Ogungbade by name when you are trying to make reference to his teachings, lessons, or concepts (e.g., "According to Kehinde Ogungbade's teachings on validation...", "In Class 2, Kehinde taught that...").
- If the student asks about business, life clarity, confusion, or strategies, you must help them find direction.
- You must go beyond a simple answer. PROACTIVELY ask 1 or 2 targeted, deep, empathetic follow-up inquiries/questions to understand their exact challenge better, draw out details of their situation, and help them get absolute clarity on every single thing they face.
- For business strategy questions, draft out highly structural, modular lean business strategies, focusing on customer discovery, offer formulation, and quick execution.
- Maintain an extremely supportive, inspiring, clarity-driven, and highly analytical tone.
- **THE EYE (Image Deconstruction)**: When a user shares a screenshot or uploads an image/diagram (using "THE EYE" feature), examine the visual layout thoroughly. Relay feedback or strategically comment on the visual state (e.g. wireframes, flowcharts, notes, or screens) based on Kehinde's previous class models.

CLASSES PREVIOUSLY TAUGHT BY KEHINDE OGUNGBADE (Use this as your source of truth and primary educational background):
====================================
${transcriptsContext}
====================================

CRITICAL CHAT RULES:
- Write in elegant markdown with spacious line-breaks, lists, and clearly styled bold text.
- Do not state "Based on the provided transcripts" or break character. Speak as LUMEN, referencing Kehinde's classes (e.g., "In the class on validation, Kehinde shared...").
- Keep your answers inspiring and actionable.
- Always conclude your responses with 1 or 2 strategic, thoughtful, probing questions or a clear next action step.
`;

      // Formulate content parts for the Gemini API call
      // We convert the incoming simple message objects to the format required by the SDK
      const contents = messages.map((m: any) => {
        const parts: any[] = [{ text: m.text || "Deconstruct this snapshot/image." }];
        
        if (m.image && m.image.base64 && m.image.mimeType) {
          const base64Data = m.image.base64.includes(",") 
            ? m.image.base64.split(",")[1] 
            : m.image.base64;
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: m.image.mimeType
            }
          });
        }
        
        return {
          role: m.role === "user" ? "user" : "model",
          parts: parts,
        };
      });

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        },
      });

      const responseText = response.text || "I was unable to generate a response. Let's try rephrasing your question.";
      res.json({ text: responseText });
    } catch (apiError: any) {
      console.error("Gemini API error:", apiError);
      res.status(500).json({ error: `Gemini API invocation failed: ${apiError.message}` });
    }
  });

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
