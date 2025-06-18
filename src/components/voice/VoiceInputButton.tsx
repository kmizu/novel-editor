import { useEffect } from 'react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { MicrophoneIcon } from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  className?: string
}

export default function VoiceInputButton({ onTranscript, className = '' }: VoiceInputButtonProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition()

  // 音声認識結果を親コンポーネントに渡す
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript)
      clearTranscript()
    }
  }, [transcript, onTranscript, clearTranscript])

  if (!isSupported) {
    return (
      <button
        disabled
        className={`p-2 text-gray-400 cursor-not-allowed ${className}`}
        title="音声入力は対応していません"
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
    )
  }

  const handleToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={`p-2 rounded-lg transition-colors ${
          isListening
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        } ${className}`}
        title={isListening ? '音声入力を停止' : '音声入力を開始'}
      >
        {isListening ? (
          <MicrophoneSolidIcon className="w-5 h-5 animate-pulse" />
        ) : (
          <MicrophoneIcon className="w-5 h-5" />
        )}
      </button>

      {/* 音声認識中の表示 */}
      {isListening && interimTranscript && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap">
          {interimTranscript}
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-red-600 text-white text-sm rounded shadow-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
