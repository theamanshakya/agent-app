import api from './api';
import type { Agent } from '../types';

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  agentsByType: Array<{
    type: string;
    count: number;
  }>;
  recentAgents: Agent[];
  dailyStats: Array<{
    date: string;
    count: number;
  }>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ status: string; data: DashboardStats }>('/dashboard/stats');
    return response.data.data;
  }
}; 