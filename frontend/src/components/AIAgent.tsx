import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Mic, Send, Loader2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { apiClient } from "app";
import { ChatData } from "types";
import { useToast } from "./Toast";

type ConsultationType = "consultation" | "health_check" | "support" | "transformation";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  consultationType: ConsultationType;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAgent({ isOpen = false, onClose, consultationType }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => uuidv4());
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const initializeSession = async () => {
      try {
        // Store session ID
        localStorage.setItem('ai_session_id', sessionId);

        // Add initial system message based on consultation type
        const systemMessage = {
          role: "assistant" as const,
          content: `Starting ${consultationType} session. How can I help you today?`
        };
        setMessages([systemMessage]);

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to start session"
          });
          onClose?.();
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [isOpen, sessionId, onClose, toast, consultationType]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // process_chat is not available in Riff - show a friendly message
      setMessages(prev => [...prev, { role: "assistant", content: "AI chat is currently unavailable. Please contact us via the Contact Us page." }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // Audio processing would go here
        toast({
          variant: "destructive",
          title: "Not Implemented",
          description: "Audio processing is not yet available"
        });
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {consultationType === "consultation" && "Consultation"}
            {consultationType === "health_check" && "Health Check"}
            {consultationType === "support" && "Support"}
            {consultationType === "transformation" && "Transformation"}
          </h2>
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          {isRecording && (
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="text-sm">Recording... Click the microphone again to stop</span>
            </div>
          )}
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              <Mic className={`h-4 w-4 ${isRecording ? "text-red-500" : ""}`} />
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
