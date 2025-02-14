import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, PieChart } from '@mui/x-charts';
import { agentService } from '../../services/agent';
import { dashboardService } from '../../services/dashboard';
import type { Agent } from '../../types';
import type { DashboardStats } from '../../services/dashboard';
import { useAuth } from '../../context/AuthContext';

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const { user } = useAuth();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, agentsData] = await Promise.all([
          dashboardService.getStats(),
          agentService.getAgents()
        ]);
        setStats(statsData);
        setAgents(agentsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (agent: Agent) => {
    navigate('/agents/edit/' + agent.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await agentService.deleteAgent(id);
      setAgents(agents.filter(agent => agent.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleChat = (id: string) => {
    navigate('/chat/' + id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                backgroundColor: 'primary.light',
                borderRadius: '50%',
                p: 1,
                display: 'flex'
              }}>
                <GroupIcon color="primary" />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Total Agents
                </Typography>
                <Typography variant="h4">
                  {stats.totalAgents}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +25% than last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                backgroundColor: 'info.light',
                borderRadius: '50%',
                p: 1,
                display: 'flex'
              }}>
                <PersonIcon color="info" />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Active Agents
                </Typography>
                <Typography variant="h4">
                  {stats.activeAgents}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +4% than last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                backgroundColor: 'success.light',
                borderRadius: '50%',
                p: 1,
                display: 'flex'
              }}>
                <MoneyIcon color="success" />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Chat Time Remaining
                </Typography>
                <Typography variant="h4">
                  {user?.subscription ? (
                    formatTime(Math.max(0, user.subscription.chatSecondsLimit - (user.subscription.secondsUsed || 0)))
                  ) : '0m 00s'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  of {formatTime(user?.subscription?.chatSecondsLimit || 0)} limit
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                backgroundColor: 'warning.light',
                borderRadius: '50%',
                p: 1,
                display: 'flex'
              }}>
                <TrendingUpIcon color="warning" />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  New Agents
                </Typography>
                <Typography variant="h4">
                  +{stats.recentAgents.length}
                </Typography>
                <Typography variant="body2">
                  Just updated
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Agent Creation
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <LineChart
                  xAxis={[{
                    data: stats.dailyStats.map(d => new Date(d.date).toLocaleDateString()),
                    scaleType: 'band',
                  }]}
                  series={[{
                    data: stats.dailyStats.map(d => d.count),
                    area: true,
                    color: '#4CAF50'
                  }]}
                  height={300}
                />
              </Box>
              <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                (+15%) increase in today's agent creation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Types Distribution
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <PieChart
                  series={[
                    {
                      data: stats.agentsByType.map(type => ({
                        id: type.type,
                        value: type.count,
                        label: type.type
                      })),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30 },
                    },
                  ]}
                  height={300}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Agents Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Agents
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Personality</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>{agent.name}</TableCell>
                        <TableCell>{agent.type}</TableCell>
                        <TableCell>{agent.personality}</TableCell>
                        <TableCell>
                          <Chip
                            label={agent.status}
                            color={agent.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleEdit(agent)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(agent.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton onClick={() => handleChat(agent.id)} color="primary">
                            <ChatIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 