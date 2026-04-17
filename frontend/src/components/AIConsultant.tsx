"use client"

import { useEffect, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "./ui/button"
import { useToast } from "./Toast"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

const MAX_RETRIES = 3
// Agent ID from environment
const AGENT_ID = 'TEST-83Gwai2TPgg84awLBqb-v'

// Load Play.ai script once at app start
if (typeof window !== 'undefined' && !document.querySelector('script[src*="play-ai"]')) {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://api.play.ai/v1/web-embed.js'
  document.head.appendChild(script)
}

interface Props {
  onClose?: () => void
}

function AIConsultantWidgetInner({ onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWidgetVisible, setIsWidgetVisible] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [sessionId] = useState<string>(
    () => localStorage.getItem('ai_consultant_session') || uuidv4()
  )
  const { toast } = useToast()

  const initializeEmbed = useCallback(async () => {
    if (isLoading || isWidgetVisible) return
    
    setIsLoading(true)
    try {
      // Store session ID for persistence
      localStorage.setItem('ai_consultant_session', sessionId)
      
      // Log session start
      console.log(`Starting AI consultation session: ${sessionId}`)
      
      // Wait for PlayAI to be available
      const checkPlayAI = () => {
        const playAi = (window as any).PlayAI
        if (playAi) {
          playAi.open(AGENT_ID)
          setIsWidgetVisible(true)
          setIsLoading(false)
        } else {
          setTimeout(checkPlayAI, 100) // Check again in 100ms
        }
      }
      
      checkPlayAI()
    } catch (error) {
      console.error("Failed to initialize AI consultant:", error)
      
      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1)
        toast({
          title: "Connection failed",
          description: `Retrying... (${retryCount + 1}/${MAX_RETRIES})`
        })
        setTimeout(initializeEmbed, 1000)
        return
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start AI consultation. Please try again."
      })
      setIsLoading(false)
    }
  }, [isLoading, isWidgetVisible, retryCount, sessionId, toast])

  const handleClose = useCallback(() => {
    // Close the widget if it's open
    const playAi = (window as any).PlayAI
    if (playAi) {
      playAi.close()
    }
    
    // Clear session if explicitly closed
    localStorage.removeItem('ai_consultant_session')
    setRetryCount(0)
    setIsWidgetVisible(false)
    onClose?.()
  }, [onClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleClose()
    }
  }, [handleClose])

  // Reset retry count when widget becomes visible
  useEffect(() => {
    if (isWidgetVisible) {
      setRetryCount(0)
    }
  }, [isWidgetVisible])

  return (
    <ErrorBoundary fallback={<div>Error loading AI consultant</div>}>
      <div 
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        role="region"
        aria-label="AI Consultation Widget"
      >
        {isWidgetVisible && (
          <Button
            onClick={handleClose}
            variant="outline"
            className="ml-auto"
            size="sm"
            aria-label="Close AI consultation"
          >
            Close Consultation
          </Button>
        )}
        {!isWidgetVisible && (
          <Button
            onClick={initializeEmbed}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Start AI Consultation'
            )}
          </Button>
        )}
      </div>
    </ErrorBoundary>
  )
}

export function AIConsultantWidget(props: Props) {
  return (
    <ErrorBoundary fallback={<div>Error loading AI consultant</div>}>
      <AIConsultantWidgetInner {...props} />
    </ErrorBoundary>
  )
}
