import { useState, useEffect, useRef, useCallback } from 'react'
import { WritingSession } from '../types/statistics'
import { StorageManager } from '../utils/storage'
import { generateId } from '../utils/helpers'

const WRITING_SESSIONS_KEY = 'writing_sessions'
const SESSION_TIMEOUT = 5 * 60 * 1000 // 5分間操作がなければセッション終了

export const useWritingSession = (projectId: string, chapterId?: string, content?: string) => {
  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null)
  const [sessions, setSessions] = useState<WritingSession[]>([])
  const lastActivityRef = useRef<Date>(new Date())
  const lastContentRef = useRef<string>(content || '')
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // セッションを読み込む
  useEffect(() => {
    const loadSessions = () => {
      try {
        const allSessions = StorageManager.get<WritingSession[]>(WRITING_SESSIONS_KEY) || []
        const projectSessions = allSessions.filter((s) => s.projectId === projectId)
        setSessions(projectSessions)
      } catch (error) {
        console.error('Failed to load writing sessions:', error)
      }
    }

    loadSessions()
  }, [projectId])

  // セッションを保存
  const saveSessions = useCallback(
    (updatedSessions: WritingSession[]) => {
      try {
        const allSessions = StorageManager.get<WritingSession[]>(WRITING_SESSIONS_KEY) || []
        const otherSessions = allSessions.filter((s) => s.projectId !== projectId)
        StorageManager.set(WRITING_SESSIONS_KEY, [...otherSessions, ...updatedSessions])
        setSessions(updatedSessions)
      } catch (error) {
        console.error('Failed to save writing sessions:', error)
      }
    },
    [projectId]
  )

  // 新しいセッションを開始
  const startSession = useCallback(() => {
    const now = new Date().toISOString()
    const newSession: WritingSession = {
      id: generateId(),
      projectId,
      chapterId,
      startTime: now,
      endTime: now,
      duration: 0,
      wordsAdded: 0,
      wordsDeleted: 0,
      finalWordCount: content ? content.length : 0,
    }

    setCurrentSession(newSession)
    lastActivityRef.current = new Date()
    lastContentRef.current = content || ''
  }, [projectId, chapterId, content])

  // セッションを終了
  const endSession = useCallback(() => {
    if (!currentSession) return

    const endTime = new Date()
    const duration = Math.round(
      (endTime.getTime() - new Date(currentSession.startTime).getTime()) / 60000
    )

    const finalSession: WritingSession = {
      ...currentSession,
      endTime: endTime.toISOString(),
      duration,
      finalWordCount: content ? content.length : 0,
    }

    const updatedSessions = [...sessions, finalSession]
    saveSessions(updatedSessions)
    setCurrentSession(null)
  }, [currentSession, sessions, saveSessions, content])

  // コンテンツの変更を記録
  const recordChange = useCallback(() => {
    if (!currentSession || !content) return

    const currentLength = content.length
    const previousLength = lastContentRef.current.length
    const diff = currentLength - previousLength

    if (diff > 0) {
      setCurrentSession({
        ...currentSession,
        wordsAdded: currentSession.wordsAdded + diff,
      })
    } else if (diff < 0) {
      setCurrentSession({
        ...currentSession,
        wordsDeleted: currentSession.wordsDeleted + Math.abs(diff),
      })
    }

    lastContentRef.current = content
    lastActivityRef.current = new Date()
  }, [currentSession, content])

  // セッションタイムアウトの管理
  useEffect(() => {
    const checkTimeout = () => {
      const now = new Date()
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime()

      if (currentSession && timeSinceLastActivity > SESSION_TIMEOUT) {
        endSession()
      }
    }

    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current)
    }

    sessionTimerRef.current = setInterval(checkTimeout, 30000) // 30秒ごとにチェック

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [currentSession, endSession])

  // コンテンツ変更時の処理
  useEffect(() => {
    if (!content) return

    if (!currentSession) {
      startSession()
    } else {
      recordChange()
    }
  }, [content, currentSession, startSession, recordChange])

  // コンポーネントアンマウント時にセッションを終了
  useEffect(() => {
    return () => {
      if (currentSession) {
        endSession()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    currentSession,
    sessions,
    startSession,
    endSession,
  }
}
