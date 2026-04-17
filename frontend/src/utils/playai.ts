import { ChatEvent } from "./types";

interface PlayAIConfig {
  agentId: string;
}

export const initializePlayAI = async () => {
  try {
    // Get agent ID from our backend
    const response = await fetch('/api/playai/config');
    if (!response.ok) {
      throw new Error('Failed to get Play.ai config');
    }
    
    const config: PlayAIConfig = await response.json();
    
    // Initialize Play.ai with agent ID
    if (window.PlayAI) {
      // Set up event listeners for transcripts
      window.PlayAI.on('transcript', async (event: ChatEvent) => {
        if (event.data?.transcript) {
          // Process transcript with our API
          const response = await fetch('/api/transcript/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              session_id: event.data.conversationId,
              transcript: event.data.transcript,
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to process transcript');
          }
        }
      });
    }
  } catch (error) {
    console.error('Error initializing Play.ai:', error);
  }
};
