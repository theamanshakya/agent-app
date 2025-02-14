import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Alert,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Star as StarIcon } from '@mui/icons-material';
import { agentService } from '../../services/agent';
import { chatService } from '../../services/chat';
import type { Agent } from '../../types';
import Realtime from './Realtime';
import { useAuth } from '../../context/AuthContext';

function ChatView() {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
    const [isChatActive, setIsChatActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [totalSecondsUsed, setTotalSecondsUsed] = useState(user?.subscription?.secondsUsed || 0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const remainingSeconds = user?.subscription 
        ? user.subscription.chatSecondsLimit - totalSecondsUsed - elapsedSeconds
        : 0;
    const isNearLimit = remainingSeconds <= 60;
    const isTimeOver = remainingSeconds <= 0;

    useEffect(() => {
        setTotalSecondsUsed(user?.subscription?.secondsUsed || 0);
    }, [user?.subscription?.secondsUsed]);

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

        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                handleChatEnd();
            }
        };
    }, [agentId, navigate]);

    const startTimer = () => {
        if (!timerRef.current) {
            setIsChatActive(true);
            timerRef.current = setInterval(() => {
                setElapsedSeconds(prev => {
                    const newElapsed = prev + 1;
                    if (newElapsed >= remainingSeconds) {
                        handleChatEnd();
                        return prev;
                    }
                    return newElapsed;
                });
            }, 1000);
        }
    };

    const handleChatEnd = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsChatActive(false);

            if (elapsedSeconds > 0) {
                try {
                    const updatedSubscription = await chatService.endChat(elapsedSeconds);
                    if (user) {
                        updateUser({
                            ...user,
                            subscription: updatedSubscription
                        });
                    }
                    setTotalSecondsUsed(updatedSubscription.secondsUsed);
                } catch (error) {
                    console.error('Error updating chat time:', error);
                }
            }
            setElapsedSeconds(0);
        }
    };

    const handleMessageReceived = (message: string) => {
        if (!isChatActive) {
            startTimer();
        }
        console.log('New message:', message);
    };

    const handleStopChat = () => {
        handleChatEnd();
    };

    const handleUpgrade = () => {
        setOpenUpgradeDialog(true);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.abs(seconds) % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimeUsage = (): string => {
        const totalSeconds = user?.subscription?.chatSecondsLimit || 0;
        const usedSeconds = totalSecondsUsed + elapsedSeconds;
        return `${formatTime(usedSeconds)} / ${formatTime(totalSeconds)}`;
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
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">
                        Chat with {agent.name}
                    </Typography>
                </Box>
                {!isTimeOver && (
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography color={isNearLimit ? 'error' : 'textSecondary'}>
                            Time remaining: {formatTime(remainingSeconds)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block">
                            Time used: {formatTimeUsage()}
                        </Typography>
                        {isChatActive && (
                            <Typography variant="caption" color="textSecondary" display="block">
                                Session time: {formatTime(elapsedSeconds)}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>

            {isTimeOver ? (
                <Box sx={{ p: 3 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h5" gutterBottom>
                                Chat Time Limit Reached
                            </Typography>
                            <Typography color="textSecondary" paragraph>
                                You have used all your available chat minutes. Upgrade to premium for unlimited chat time.
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<StarIcon />}
                                onClick={handleUpgrade}
                                sx={{ mt: 2 }}
                            >
                                Upgrade to Premium
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            ) : (
                <>
                    {isNearLimit && (
                        <Alert severity="warning" sx={{ m: 2 }}>
                            You are approaching your chat time limit. Please upgrade your subscription to continue chatting.
                        </Alert>
                    )}

                    {isChatActive && (
                        <LinearProgress 
                            variant="determinate" 
                            value={(elapsedSeconds / remainingSeconds) * 100}
                            color={isNearLimit ? 'error' : 'primary'}
                            sx={{ height: 1 }}
                        />
                    )}

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
                                onStop={handleStopChat}
                                defaultSystemMessage={`You are a ${agent.personality} assistant named ${agent.name}. ${agent.description || ''}`}
                                defaultEndpoint="https://ai-talibahmed0504ai310861974661.openai.azure.com/"
                                defaultApiKey="Bd7U6uErjmvDNutguAD8K0xKUxIH9ZMWG8ssd3gOWyreprDy2vEPJQQJ99ALACHYHv6XJ3w3AAAAACOG7qA2"
                                defaultModel="gpt-4o-realtime-preview"
                                defaultVoice={agent.ttsVoice}
                            />
                        </Box>
                    </Paper>
                </>
            )}

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

export default ChatView; 