import api from './api';
import type { Subscription } from '../types';

interface ChatEndResponse {
  status: string;
  data: {
    subscription: Subscription;
  };
}

export const chatService = {
  async endChat(seconds: number): Promise<Subscription> {
    const response = await api.post<ChatEndResponse>('/chat/end', { seconds });
    return response.data.data.subscription;
  }
}; 