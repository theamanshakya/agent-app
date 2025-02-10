import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    Paper,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { agentService } from '../../services/agent';
import type { Agent } from '../../types';
import Realtime from './Realtime';

function ChatView() {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState<Agent | null>(null);

    useEffect(() => {
        const fetchAgent = async () => {
            if (agentId) {
                try {
                    const agentData = await agentService.getAgent(agentId);
                    setAgent(agentData);
                } catch (error) {
                    console.error('Error fetching agent:', error);
                    navigate('/');
                }
            }
        };
        fetchAgent();
    }, [agentId, navigate]);

    const handleMessageReceived = (message: string) => {
        console.log('New message:', message);
    };

    if (!agent) {
        return null;
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center'
            }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">
                    Chat with {agent.name}
                </Typography>
            </Box>

            <Box sx={{
                flex: 1,
                p: 2,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse'
            }}>
                {/* Chat messages will go here */}
            </Box>

            <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Realtime
                        onMessageReceived={handleMessageReceived}
                        defaultSystemMessage={`You are a ${agent.personality} assistant named ${agent.name}. ${agent.description || ''}`}
                        defaultEndpoint="https://ai-talibahmed0504ai310861974661.openai.azure.com/"
                        defaultApiKey="Bd7U6uErjmvDNutguAD8K0xKUxIH9ZMWG8ssd3gOWyreprDy2vEPJQQJ99ALACHYHv6XJ3w3AAAAACOG7qA2"
                        defaultModel="gpt-4o-realtime-preview"
                        defaultVoice={agent.ttsVoice}
                    />
                </Box>
            </Paper>
        </Box>
    );
}

export default ChatView; 