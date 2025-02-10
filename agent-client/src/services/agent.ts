import api from './api';
import type { Agent } from '../types';

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    const response = await api.get<{ status: string; data: { agents: Agent[] } }>('/agents');
    return response.data.data.agents;
  },

  async createAgent(agentData: Omit<Agent, 'id' | 'createdBy'>): Promise<Agent> {
    const response = await api.post<{ status: string; data: { agent: Agent } }>('/agents', agentData);
    return response.data.data.agent;
  },

  async updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent> {
    const response = await api.put<{ status: string; data: { agent: Agent } }>(`/agents/${id}`, agentData);
    return response.data.data.agent;
  },

  async deleteAgent(id: string): Promise<void> {
    await api.delete(`/agents/${id}`);
  },

  async getAgent(id: string): Promise<Agent> {
    const response = await api.get<{ status: string; data: { agent: Agent } }>(`/agents/${id}`);
    return response.data.data.agent;
  }
}; 