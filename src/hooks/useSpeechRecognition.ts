// 音声認識機能のフック

import { useState, useEffect, useCallback, useRef } from 'react'

// ブラウザベンダープレフィックスに対応
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Web Speech APIのサポート確認
    if (typeof SpeechRecognition !== 'undefined') {
      setIsSupported(true)

      // 音声認識インスタンスの作成
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ja-JP' // 日本語に設定

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = ''
        let finalText = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalText += result[0].transcript
          } else {
            interimText += result[0].transcript
          }
        }

        if (finalText) {
          setTranscript((prev) => prev + finalText)
        }
        setInterimTranscript(interimText)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = '音声認識エラー: '
        switch (event.error) {
          case 'no-speech':
            errorMessage += '音声が検出されませんでした'
            break
          case 'audio-capture':
            errorMessage += 'マイクが見つかりません'
            break
          case 'not-allowed':
            errorMessage += 'マイクの使用が許可されていません'
            break
          case 'network':
            errorMessage += 'ネットワークエラーが発生しました'
            break
          default:
            errorMessage += event.error
        }
        setError(errorMessage)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError('お使いのブラウザは音声認識に対応していません')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch {
        // 既に開始している場合のエラーを無視
        console.warn('Speech recognition already started')
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  }
}
