import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/Toast";
import { useNavigate } from "react-router-dom";
import { handleChatEvent } from "@/utils/chat-events";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

// Placeholder for Play.ai initialization
const initializeEmbed = () => {
  return new Promise<void>((resolve) => {
    console.log('Play.ai widget will be initialized here');
    resolve();
  });
};

export function ChatWidget({ isOpen = false, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => localStorage.getItem('chat_session_id') || uuidv4());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize event handler with dependencies
  useEffect(() => {
    if (window.PlayAI) {
      window.PlayAI.on('event', (event) => handleChatEvent(event, { navigate, toast }));
    }
    return () => {
      if (window.PlayAI) {
        window.PlayAI.off('event');
      }
    };
  }, [navigate, toast]);

  useEffect(() => {
    if (!isOpen) {
      if (window.PlayAI) {
        try {
          window.PlayAI.close();
        } catch (error) {
          console.error('Error closing widget:', error);
        }
      }
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    console.log('Starting widget initialization...');
    const initializeWidget = async () => {
      try {
        localStorage.setItem('chat_session_id', sessionId);
        
        // Chat session initialization - Play.ai handles session management
        console.log('Chat session initialized:', sessionId);
        
        await initializeEmbed();
        
        if (!isMounted) return;
        
        console.log('ChatWidget: Embed opened successfully');
      } catch (error) {
        console.error('ChatWidget: Error initializing:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeWidget();

    return () => {
      isMounted = false;
      if (window.PlayAI) {
        try {
          window.PlayAI.close();
        } catch (error) {
          console.error('Error closing widget:', error);
        }
      }
    };
  }, [isOpen]);

  if (error) {
    onClose?.();
    return null;
  }

  return null;
}

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    console.log('Chat button clicked');
    setIsLoading(true);
    try {
      await initializeEmbed();
      setIsOpen(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize chat. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg hover:shadow-[0_8px_32px_rgba(79,70,229,0.4)] transition-all duration-300 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-110 border border-indigo-400/20"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
      <ChatWidget 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setIsLoading(false);
        }} 
      />
    </>
  );
}
