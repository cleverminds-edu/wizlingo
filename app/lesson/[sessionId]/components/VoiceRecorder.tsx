'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  onRecordingStateChange?: (isRecording: boolean) => void
  prompt?: string
  maxDuration?: number
}

export default function VoiceRecorder({
  onTranscriptChange,
  onRecordingStateChange,
  prompt = "Click the microphone to start speaking",
  maxDuration = 60
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const recognitionRef = useRef<any>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Only initialize once on client side
    if (typeof window === 'undefined') return

    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsBrowserSupported(false)
      setError('Speech Recognition not supported in this browser')
      setIsInitialized(true)
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started')
      setIsListening(true)
      setError(null)
      setDuration(0)

      durationIntervalRef.current = setInterval(() => {
        setDuration(d => {
          if (d >= maxDuration) {
            stopRecording()
            return d
          }
          return d + 1
        })
      }, 1000)
    }

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += text + ' '
        } else {
          interimTranscript += text
        }
      }

      const fullTranscript = (finalTranscript || interimTranscript).trim()
      setTranscript(fullTranscript)
      onTranscriptChange(fullTranscript)
    }

    recognitionRef.current.onerror = (event: any) => {
      let errorMessage = ''

      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly and try again.'
          break
        case 'aborted':
          // Don't show error if user intentionally stopped
          if (!isRecording) {
            console.log('Recording stopped by user')
            return
          }
          errorMessage = 'Recording was interrupted. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'No microphone detected. Please check your audio input.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow access and try again.'
          break
        default:
          errorMessage = `Error: ${event.error}`
      }
      if (errorMessage) {
        setError(errorMessage)
        console.error('Speech recognition error:', event.error)
      }
    }

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended')
      setIsListening(false)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }

    setIsInitialized(true)

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort()
        }
      } catch (err) {
        console.error('Error aborting recognition:', err)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          try {
            track.stop()
          } catch (err) {
            console.error('Error stopping track:', err)
          }
        })
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      setTranscript('')
      setIsRecording(true)

      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream
      } catch (micError: any) {
        if (micError.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please enable it in your browser settings.')
          return
        }
      }

      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
        onRecordingStateChange?.(true)
      }
    } catch (err) {
      setError('Failed to start recording')
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } catch (err) {
      console.error('Error stopping recognition:', err)
    }

    setIsRecording(false)
    onRecordingStateChange?.(false)

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop()
        } catch (err) {
          console.error('Error stopping track:', err)
        }
      })
      mediaStreamRef.current = null
    }

    // Ensure answer is registered even if transcript is empty
    // This prevents "unanswered questions" for pronunciation attempts
    setTimeout(() => {
      if (!transcript) {
        onTranscriptChange('recording-submitted')
      }
    }, 500)
  }

  const clearTranscript = () => {
    setTranscript('')
    onTranscriptChange('')
  }

  if (!isInitialized) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700">Initializing speech recognition...</p>
      </div>
    )
  }

  if (!isBrowserSupported) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">⚠️ Browser Not Supported</p>
        <p className="text-red-600 text-sm mt-2">
          Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Prompt */}
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-gray-800 font-medium">{prompt}</p>
      </div>

      {/* Recording Control */}
      <div className="flex flex-col items-center gap-4">
        {/* Microphone Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isListening && !isRecording}
          className={`flex items-center justify-center w-24 h-24 rounded-full transition-all transform ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-105 active:scale-95'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:scale-110 active:scale-95'
          } ${isListening && !isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className="text-5xl">
            {isRecording ? '⏹️' : '🎤'}
          </span>
        </button>

        {/* Status Text */}
        <div className="text-center h-16 flex flex-col justify-center">
          {isRecording && (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <p className="text-sm font-semibold text-red-600">Recording</p>
              </div>
              <p className="text-xs text-gray-600">
                {duration}s / {maxDuration}s
              </p>
            </div>
          )}
          {isListening && !isRecording && (
            <p className="text-sm text-blue-600 font-semibold">🔄 Processing...</p>
          )}
          {!isRecording && !isListening && transcript && (
            <p className="text-sm text-green-600 font-semibold">✓ Recorded</p>
          )}
          {!isRecording && !isListening && !transcript && (
            <p className="text-sm text-gray-600">Click to start speaking</p>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className={`p-4 rounded-lg border ${
          transcript === 'recording-submitted'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold" style={{
              color: transcript === 'recording-submitted' ? '#0b5a9c' : '#4b5563'
            }}>
              {transcript === 'recording-submitted' ? '✅ RECORDING SUBMITTED' : 'YOUR SPEECH:'}
            </p>
            {transcript !== 'recording-submitted' && (
              <button
                onClick={clearTranscript}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          {transcript !== 'recording-submitted' && (
            <p className="text-gray-800 text-lg leading-relaxed italic">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="text-xs font-semibold text-gray-700 mb-2">💡 Tips:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Speak clearly at a normal pace</li>
          <li>✓ Use a quiet environment</li>
          <li>✓ Keep microphone at normal distance</li>
          <li>✓ Wait a moment after speaking before clicking stop</li>
        </ul>
      </div>
    </div>
  )
}
