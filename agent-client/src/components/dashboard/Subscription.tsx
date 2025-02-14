import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import { Star as StarIcon, Check as CheckIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { agentService } from '../../services/agent';
import type { Agent } from '../../types';

export function Subscription() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentService.getAgents();
        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    fetchAgents();
  }, []);

  const handleUpgrade = () => {
    setOpenUpgradeDialog(true);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const agentUsagePercent = (agents.length / (user?.subscription?.maxAgents || 1)) * 100;
  const chatUsagePercent = ((user?.subscription?.secondsUsed || 0) / (user?.subscription?.chatSecondsLimit || 1)) * 100;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Current Plan
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={user?.subscription?.type?.toUpperCase() || 'FREE'}
                      color={user?.subscription?.type === 'premium' ? 'secondary' : 'default'}
                      size="medium"
                    />
                    {user?.subscription?.type === 'free' && (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<StarIcon />}
                        onClick={handleUpgrade}
                      >
                        Upgrade to Premium
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Agent Usage
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {agents.length} / {user?.subscription?.maxAgents || 0} Agents
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {Math.round(agentUsagePercent)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(agentUsagePercent, 100)}
                      color={agentUsagePercent >= 90 ? 'error' : 'primary'}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Chat Time Usage
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatTime(user?.subscription?.secondsUsed || 0)} / {formatTime(user?.subscription?.chatSecondsLimit || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {Math.round(chatUsagePercent)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(chatUsagePercent, 100)}
                      color={chatUsagePercent >= 90 ? 'error' : 'primary'}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Plan Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Free Plan
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon fontSize="small" />
                        <Typography>1 Agent</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon fontSize="small" />
                        <Typography>5 Minutes Chat Time</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Premium Plan
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon fontSize="small" color="secondary" />
                        <Typography>Unlimited Agents</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon fontSize="small" color="secondary" />
                        <Typography>Unlimited Chat Time</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon fontSize="small" color="secondary" />
                        <Typography>Priority Support</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openUpgradeDialog} onClose={() => setOpenUpgradeDialog(false)}>
        <DialogTitle>Upgrade to Premium</DialogTitle>
        <DialogContent>
          <Typography>
            To upgrade your subscription to premium and unlock more features, please contact our sales team at:
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
            contact@tribot.com
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpgradeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 