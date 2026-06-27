export interface Transcript {
  id: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  summary?: string;
}

export interface Persona {
  name: string;
  title: string;
  toneKeywords: string[];
  catchphrases: string[];
  philosophy: string;
  bio: string;
  customInstructions?: string;
  voiceGender?: 'male' | 'female' | 'neutral';
  voicePitch?: number; // scale of 0.5 to 2
  voiceRate?: number;  // scale of 0.5 to 2
}

export interface MessageImage {
  base64: string;
  mimeType: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  category?: 'clarity' | 'business' | 'general';
  image?: MessageImage;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  category: 'clarity' | 'business' | 'general';
  timestamp: string;
}

