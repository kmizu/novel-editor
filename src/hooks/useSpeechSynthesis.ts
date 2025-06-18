// 音声合成（読み上げ）機能のフック

import { useState, useEffect, useCallback, useRef } from 'react'

export interface Voice {
  name: string
  lang: string
  default: boolean
  localService: boolean
  voiceURI: string
}

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [rate, setRate] = useState(1.0) // 読み上げ速度
  const [pitch, setPitch] = useState(1.0) // ピッチ
  const [volume, setVolume] = useState(1.0) // 音量
  const [isSupported, setIsSupported] = useState(false)

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Web Speech APIのサポート確認
    if ('speechSynthesis' in window) {
      setIsSupported(true)
      synthRef.current = window.speechSynthesis

      // 音声リストの取得
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || []
        // 日本語の音声を優先
        const japaneseVoices = availableVoices.filter((voice) => voice.lang.startsWith('ja'))
        setVoices(japaneseVoices.length > 0 ? japaneseVoices : availableVoices)

        // デフォルトの日本語音声を選択
        const defaultJapaneseVoice = japaneseVoices.find((voice) => voice.default)
        if (defaultJapaneseVoice) {
          setSelectedVoice(defaultJapaneseVoice)
        } else if (japaneseVoices.length > 0) {
          setSelectedVoice(japaneseVoices[0])
        }
      }

      // 音声リストの読み込み
      if (synthRef.current.getVoices().length > 0) {
        loadVoices()
      } else {
        // Chrome等では音声リストが非同期で読み込まれる
        synthRef.current.onvoiceschanged = loadVoices
      }
    } else {
      setIsSupported(false)
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !text) return

      // 既存の読み上げをキャンセル
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // 音声設定
      if (selectedVoice) {
        utterance.voice = selectedVoice as SpeechSynthesisVoice
      }
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      utterance.lang = 'ja-JP'

      // イベントハンドラー
      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }

      utterance.onerror = (event) => {
        console.error('音声合成エラー:', event)
        setIsSpeaking(false)
        setIsPaused(false)
      }

      utterance.onpause = () => {
        setIsPaused(true)
      }

      utterance.onresume = () => {
        setIsPaused(false)
      }

      utteranceRef.current = utterance
      synthRef.current.speak(utterance)
    },
    [selectedVoice, rate, pitch, volume]
  )

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause()
    }
  }, [isSpeaking])

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume()
    }
  }, [isPaused])

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [])

  const speakSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      speak(selection.toString())
    }
  }, [speak])

  return {
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    speakSelection,
    setSelectedVoice,
    setRate,
    setPitch,
    setVolume,
  }
}
