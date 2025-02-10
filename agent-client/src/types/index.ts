// Common types used across the application
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  type: string;
  description?: string;
  personality: string;
  ttsProvider: string;
  ttsVoice: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const TTS_PROVIDERS = {
  azure: {
    name: 'Azure TTS',
    voices: [
      'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'
    ]
  },
  elevenlabs: {
    name: 'ElevenLabs',
    voices: [
      'Rachel',
      'Domi',
      'Bella',
      'Antoni',
      'Josh'
    ]
  }
} as const;

export const PERSONALITIES = [
  'friendly',
  'professional',
  'casual',
  'formal',
  'empathetic',
  'humorous'
] as const; 