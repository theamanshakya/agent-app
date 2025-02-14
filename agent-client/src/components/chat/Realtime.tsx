import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import { Mic, MicOff, Delete } from '@mui/icons-material';
import { LowLevelRTClient, SessionUpdateMessage, Voice } from 'rt-client';

// Import the utility classes (these will need to be in separate files)
import { Player } from './player';
import { Recorder } from './recorder';

interface RealtimeChatProps {
  onMessageReceived?: (message: string) => void;
  onStop?: () => void;
  defaultSystemMessage?: string;
  defaultEndpoint?: string;
  defaultApiKey?: string;
  defaultModel?: string;
  defaultVoice?: string;
}

const RealtimeChat: React.FC<RealtimeChatProps> = ({
  onMessageReceived,
  onStop,
  defaultSystemMessage = '',
  defaultEndpoint = '',
  defaultApiKey = '',
  defaultModel = '',
  defaultVoice = ''
}) => {
  // Add logging at the start of component
  
  console.log('Realtime Chat Props:', {
    defaultSystemMessage,
    defaultEndpoint,
    defaultApiKey,
    defaultModel,
    defaultVoice
  });

  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isAzure] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);

  // Form states
  const [endpoint] = useState(defaultEndpoint);
  const [apiKey] = useState(defaultApiKey);
  const [deploymentOrModel] = useState(defaultModel);
  const [selectedVoice] = useState(defaultVoice);

  // Refs for audio handling
  const realtimeStreamingRef = useRef<LowLevelRTClient | null>(null);
  const audioRecorderRef = useRef<Recorder | null>(null);
  const audioPlayerRef = useRef<Player | null>(null);
  const recordingActiveRef = useRef(false);
  const bufferRef = useRef(new Uint8Array());


  const combineArray = (newData: Uint8Array) => {
    const newBuffer = new Uint8Array(bufferRef.current.length + newData.length);
    newBuffer.set(bufferRef.current);
    newBuffer.set(newData, bufferRef.current.length);
    bufferRef.current = newBuffer;
  };

  const processAudioRecordingBuffer = (data: Buffer) => {
    const uint8Array = new Uint8Array(data);
    combineArray(uint8Array);

    if (bufferRef.current.length >= 4800) {
      const toSend = new Uint8Array(bufferRef.current.slice(0, 4800));
      bufferRef.current = new Uint8Array(bufferRef.current.slice(4800));
      const regularArray = String.fromCharCode(...toSend);
      const base64 = btoa(regularArray);

      if (recordingActiveRef.current && realtimeStreamingRef.current) {
        realtimeStreamingRef.current.send({
          type: "input_audio_buffer.append",
          audio: base64,
        });
      }
    }
  };

  const createConfigMessage = (): SessionUpdateMessage => {
    console.log(selectedVoice);
    
    const configMessage: SessionUpdateMessage = {
      type: "session.update",
      session: {
        turn_detection: {
          type: "server_vad",
        },
        input_audio_transcription: {
          model: "whisper-1"
        }
      }
    };

    configMessage.session.voice = selectedVoice as Voice;
    return configMessage;
  };

  const handleRealtimeMessages = async () => {
    
    if (!realtimeStreamingRef.current) return;

    for await (const message of realtimeStreamingRef.current.messages()) {
      switch (message.type) {
        case "session.created":
          setMessages(prev => [...prev, "<< Session Started >>"]);
          break;
        case "response.audio_transcript.delta":
          console.log('New message:', message.delta);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1] || '';
            newMessages[newMessages.length - 1] = lastMessage + message.delta;
            return newMessages;
          });
          break;
        case "response.audio.delta":
          if (audioPlayerRef.current) {
            const binary = atob(message.delta);
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
            const pcmData = new Int16Array(bytes.buffer);
            audioPlayerRef.current.play(pcmData);
          }
          break;
        case "input_audio_buffer.speech_started":
          setMessages(prev => [...prev, "<< Speech Started >>"]);
          if (audioPlayerRef.current) {
            audioPlayerRef.current.clear();
          }
          break;
        case "conversation.item.input_audio_transcription.completed":
          setMessages(prev => [...prev, `User: ${message.transcript}`]);
          if (onMessageReceived) {
            onMessageReceived(message.transcript);
          }
          break;
        case "response.done":
          setMessages(prev => [...prev, "---"]);
          break;
      }
    }
  };

  const startRecording = async () => {
    try {
      if (isAzure && (!endpoint || !deploymentOrModel)) {
        alert("Endpoint and Deployment are required for Azure OpenAI");
        return;
      }

      if (!isAzure && !deploymentOrModel) {
        alert("Model is required for OpenAI");
        return;
      }

      if (!apiKey) {
        alert("API Key is required");
        return;
      }

      setIsRecording(true);
      // Add welcome message
      setMessages([
        "Welcome! I'm your AI assistant. You can start speaking, and I'll listen and respond.",
        "---"
      ]);

      if (isAzure) {
        realtimeStreamingRef.current = new LowLevelRTClient(
          new URL(endpoint),
          { key: apiKey },
          { deployment: deploymentOrModel },
        );
      } else {
        realtimeStreamingRef.current = new LowLevelRTClient(
          { key: apiKey },
          { model: deploymentOrModel }
        );
      }

      await realtimeStreamingRef.current.send(createConfigMessage());

      // Initialize audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRecorderRef.current = new Recorder(processAudioRecordingBuffer);
      audioPlayerRef.current = new Player();
      await audioPlayerRef.current.init(24000);
      await audioRecorderRef.current.start(stream);
      recordingActiveRef.current = true;

      handleRealtimeMessages();
    } catch (error) {
      console.error(error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    recordingActiveRef.current = false;

    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.clear();
    }
    if (realtimeStreamingRef.current) {
      realtimeStreamingRef.current.close();
    }
    onStop?.();
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Paper
            elevation={3}
            sx={{
              height: '70vh',
              overflow: 'auto',
              p: 2,
              backgroundColor: theme.palette.grey[50]
            }}
          >
            {messages.map((message, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{
                  mb: 1,
                  ...(message.startsWith('User:') && {
                    color: theme.palette.primary.main,
                    fontWeight: 'bold'
                  })
                }}
              >
                {message}
              </Typography>
            ))}
          </Paper>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color={isRecording ? "secondary" : "primary"}
              startIcon={isRecording ? <MicOff /> : <Mic />}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? 'Stop' : 'Start'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={clearMessages}
            >
              Clear
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RealtimeChat;