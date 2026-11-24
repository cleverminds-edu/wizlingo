'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioPlayerProps {
  text: string
  onAudioPlay?: () => void
  onAudioEnd?: () => void
  instructions?: string
}

export default function AudioPlayer({
  text,
  onAudioPlay,
  onAudioEnd,
  instructions = 'Click play to listen to the audio'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check browser support for Web Speech API
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance
    if (!SpeechSynthesisUtterance) {
      setIsBrowserSupported(false)
      setIsInitialized(true)
      return
    }

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Set voice to English if available
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(voice => voice.lang.includes('en'))
    if (englishVoice) {
      utterance.voice = englishVoice
    } else if (voices.length > 0) {
      utterance.voice = voices[0]
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      onAudioPlay?.()
    }

    utterance.onend = () => {
      setIsPlaying(false)
      onAudioEnd?.()
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    setIsInitialized(true)

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [text, onAudioPlay, onAudioEnd])

  const handlePlayPause = () => {
    if (!utteranceRef.current) return

    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPlaying(true)
    } else {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utteranceRef.current)
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }

  if (!isInitialized) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700">Initializing audio player...</p>
      </div>
    )
  }

  if (!isBrowserSupported) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">⚠️ Browser Not Supported</p>
        <p className="text-red-600 text-sm mt-2">
          Your browser doesn't support text-to-speech. Please use Chrome, Edge, Firefox, or Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Instructions */}
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-gray-800 font-medium">🎧 {instructions}</p>
      </div>

      {/* Audio Player Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={!utteranceRef.current}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all transform ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-105'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:scale-110'
            } active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white`}
          >
            <span className="text-3xl">
              {isPlaying ? '⏸️' : '▶️'}
            </span>
          </button>

          {/* Status Text */}
          <div className="flex-1 mx-6">
            {isPlaying ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  <p className="text-sm font-semibold text-red-600">Playing</p>
                </div>
                <p className="text-xs text-gray-600">Listen carefully to the content</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Ready to listen</p>
                <p className="text-xs text-gray-500">Click play to hear the audio</p>
              </div>
            )}
          </div>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            disabled={!isPlaying}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              isPlaying
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            <span className="text-lg">⏹️</span>
          </button>
        </div>
      </div>

      {/* Audio Content Preview */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs text-gray-600 font-semibold">LISTENING CONTENT:</p>
        </div>
        <p className="text-gray-800 text-base leading-relaxed italic">
          "{text}"
        </p>
      </div>

      {/* Tips */}
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="text-xs font-semibold text-gray-700 mb-2">💡 Tips:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Listen carefully to the entire content</li>
          <li>✓ Take notes if needed</li>
          <li>✓ You can replay the audio multiple times</li>
          <li>✓ Answer the questions based on what you heard</li>
        </ul>
      </div>
    </div>
  )
}
