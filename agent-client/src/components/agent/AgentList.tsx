import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../../services/agent';
import type { Agent } from '../../types';
import { TTS_PROVIDERS, PERSONALITIES } from '../../types';
import { useAuth } from '../../context/AuthContext';

export function AgentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    personality: 'friendly',
    ttsProvider: 'azure',
    ttsVoice: 'en-US-JennyNeural'
  });

  const fetchAgents = async () => {
    const data = await agentService.getAgents();
    setAgents(data);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpenDialog = (agent?: Agent) => {
    if (agent) {
      setSelectedAgent(agent);
      setFormData({
        name: agent.name,
        type: agent.type,
        description: agent.description || '',
        personality: agent.personality,
        ttsProvider: agent.ttsProvider,
        ttsVoice: agent.ttsVoice
      });
    } else {
      setSelectedAgent(null);
      setFormData({
        name: '',
        type: '',
        description: '',
        personality: 'friendly',
        ttsProvider: 'azure',
        ttsVoice: 'alloy'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAgent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const agentData = {
        ...formData
      };

      if (selectedAgent) {
        await agentService.updateAgent(selectedAgent.id, {
          ...agentData,
          status: selectedAgent.status,
          createdAt: selectedAgent.createdAt,
          updatedAt: new Date().toISOString()
        });
      } else {
        await agentService.createAgent({
          ...agentData,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      handleCloseDialog();
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await agentService.deleteAgent(id);
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const handleChat = (agentId: string) => {
    navigate(`/chat/${agentId}`);
  };

  const getAvailableVoices = () => {
    return TTS_PROVIDERS[formData.ttsProvider as keyof typeof TTS_PROVIDERS].voices;
  };

  const isAtAgentLimit = agents.length >= (user?.subscription?.maxAgents || 0);
  const createButtonTooltip = isAtAgentLimit 
    ? `You have reached your limit of ${user?.subscription?.maxAgents} agents. Please upgrade your subscription to create more agents.`
    : 'Create a new agent';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Agents</Typography>
        <Tooltip title={createButtonTooltip}>
          <span>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={isAtAgentLimit}
            >
              Create Agent
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} key={agent.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{agent.name}</Typography>
                <Typography color="textSecondary" gutterBottom>Type: {agent.type}</Typography>
                <Typography variant="body2" gutterBottom>{agent.description}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={agent.personality} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }} 
                  />
                  <Chip 
                    label={`${TTS_PROVIDERS[agent.ttsProvider as keyof typeof TTS_PROVIDERS].name}`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpenDialog(agent)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(agent.id)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleChat(agent.id)}
                  color="primary"
                  sx={{ ml: 'auto' }}
                >
                  <ChatIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedAgent ? 'Edit Agent' : 'Create Agent'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                fullWidth
              >
                <MenuItem value="chatbot">Chatbot</MenuItem>
                <MenuItem value="assistant">Assistant</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </TextField>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                select
                label="Personality"
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                required
                fullWidth
              >
                {PERSONALITIES.map((personality) => (
                  <MenuItem key={personality} value={personality}>
                    {personality.charAt(0).toUpperCase() + personality.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="TTS Provider"
                value={formData.ttsProvider}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ttsProvider: e.target.value,
                  ttsVoice: TTS_PROVIDERS[e.target.value as keyof typeof TTS_PROVIDERS].voices[0]
                })}
                required
                fullWidth
              >
                {Object.entries(TTS_PROVIDERS).map(([key, provider]) => (
                  <MenuItem key={key} value={key}>
                    {provider.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Voice"
                value={formData.ttsVoice}
                onChange={(e) => setFormData({ ...formData, ttsVoice: e.target.value })}
                required
                fullWidth
              >
                {getAvailableVoices().map((voice) => (
                  <MenuItem key={voice} value={voice}>
                    {voice}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedAgent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 