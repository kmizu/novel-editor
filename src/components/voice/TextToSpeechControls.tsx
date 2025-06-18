import { useState } from 'react'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import {
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface TextToSpeechControlsProps {
  text: string
  className?: string
}

export default function TextToSpeechControls({ text, className = '' }: TextToSpeechControlsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const {
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
  } = useSpeechSynthesis()

  if (!isSupported) {
    return (
      <button
        disabled
        className={`p-2 text-gray-400 cursor-not-allowed ${className}`}
        title="読み上げ機能は対応していません"
      >
        <SpeakerWaveIcon className="w-5 h-5" />
      </button>
    )
  }

  const handlePlayPause = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      // 選択テキストがあれば選択部分を、なければ全文を読み上げ
      const selection = window.getSelection()?.toString()
      if (selection) {
        speak(selection)
      } else {
        speak(text)
      }
    }
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex items-center space-x-2">
        {/* 再生/一時停止ボタン */}
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          title={isSpeaking ? (isPaused ? '再開' : '一時停止') : '読み上げ開始'}
        >
          {isSpeaking && !isPaused ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>

        {/* 停止ボタン */}
        {isSpeaking && (
          <button
            onClick={stop}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            title="読み上げ停止"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        )}

        {/* 選択部分を読み上げ */}
        <button
          onClick={speakSelection}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          title="選択部分を読み上げ"
        >
          <SpeakerWaveIcon className="w-5 h-5" />
        </button>

        {/* 設定ボタン */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          title="読み上げ設定"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-10 w-80">
          <h3 className="font-semibold mb-3">読み上げ設定</h3>

          {/* 音声選択 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">音声</label>
            <select
              value={selectedVoice?.voiceURI || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.voiceURI === e.target.value)
                if (voice) setSelectedVoice(voice)
              }}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* 速度 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              速度: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* ピッチ */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ピッチ: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 音量 */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              音量: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  )
}
