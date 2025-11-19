import { useState, useEffect, useCallback } from 'react'

export interface QuizAttempt {
  attemptNumber: number
  completedAt: number
  score: number
  totalScore: number
  correctAnswers: number
  totalQuestions: number
  percentage: number
}

export interface ContentProgress {
  contentId: string
  completedAt: number
  completed: boolean
  progress?: number // Progress percentage for videos (0-100)
  quizAttempts?: QuizAttempt[]
  lastPosition?: number // For video progress in seconds
}

export interface ActivityLog {
  id: string
  contentId: string
  type: 'video_completed' | 'quiz_completed' | 'dissertation_completed' | 'content_completed'
  timestamp: number
  contentTitle?: string
}

export function useContentProgress() {
  const [progress, setProgress] = useState<Record<string, ContentProgress>>({})
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])

  useEffect(() => {
    // Load progress from localStorage
    const stored = localStorage.getItem('content_progress')
    if (stored) {
      setProgress(JSON.parse(stored))
    }

    // Load activity log
    const storedLog = localStorage.getItem('activity_log')
    if (storedLog) {
      setActivityLog(JSON.parse(storedLog))
    }
  }, [])

  const saveProgress = useCallback((newProgress: Record<string, ContentProgress>) => {
    setProgress(newProgress)
    localStorage.setItem('content_progress', JSON.stringify(newProgress))
  }, [])

  const saveActivityLog = useCallback((newLog: ActivityLog[]) => {
    setActivityLog(newLog)
    localStorage.setItem('activity_log', JSON.stringify(newLog))
  }, [])

  const getProgress = useCallback((type: string, contentId: string): ContentProgress | null => {
    return progress[`${type}-${contentId}`] || null
  }, [progress])

  const updateProgress = useCallback((type: string, contentId: string, progressPercentage: number) => {
    const key = `${type}-${contentId}`
    const newProgress = {
      ...progress,
      [key]: {
        ...progress[key],
        contentId: key,
        completedAt: Date.now(),
        completed: progressPercentage >= 100,
        progress: progressPercentage,
        lastPosition: progress[key]?.lastPosition,
      },
    }
    saveProgress(newProgress)
  }, [progress, saveProgress])

  const isCompleted = useCallback((type: string, contentId: string) => {
    const key = `${type}-${contentId}`
    return progress[key]?.completed || false
  }, [progress])

  const markAsCompleted = useCallback((contentId: string, contentTitle?: string) => {
    const newProgress = {
      ...progress,
      [contentId]: {
        contentId,
        completedAt: Date.now(),
        completed: true,
        progress: 100,
        quizAttempts: progress[contentId]?.quizAttempts,
        lastPosition: progress[contentId]?.lastPosition,
      },
    }
    saveProgress(newProgress)

    // Add to activity log
    const newActivity: ActivityLog = {
      id: `${contentId}-${Date.now()}`,
      contentId,
      type: 'content_completed',
      timestamp: Date.now(),
      contentTitle,
    }
    const newLog = [newActivity, ...activityLog].slice(0, 100) // Keep last 100 activities
    saveActivityLog(newLog)

    // Award XP (gamification)
    awardXP(50)
  }, [progress, activityLog, saveProgress, saveActivityLog])

  const updateVideoPosition = useCallback((contentId: string, position: number) => {
    const newProgress = {
      ...progress,
      [contentId]: {
        ...progress[contentId],
        contentId,
        completedAt: progress[contentId]?.completedAt || 0,
        completed: progress[contentId]?.completed || false,
        lastPosition: position,
      },
    }
    saveProgress(newProgress)
  }, [progress, saveProgress])

  const saveQuizAttempt = useCallback((contentId: string, attempt: QuizAttempt, contentTitle?: string) => {
    const existingAttempts = progress[contentId]?.quizAttempts || []
    const newProgress = {
      ...progress,
      [contentId]: {
        ...progress[contentId],
        contentId,
        completedAt: Date.now(),
        completed: true,
        quizAttempts: [...existingAttempts, attempt],
      },
    }
    saveProgress(newProgress)

    // Add to activity log
    const newActivity: ActivityLog = {
      id: `${contentId}-quiz-${Date.now()}`,
      contentId,
      type: 'quiz_completed',
      timestamp: Date.now(),
      contentTitle,
    }
    const newLog = [newActivity, ...activityLog].slice(0, 100)
    saveActivityLog(newLog)

    // Award XP based on score
    awardXP(Math.floor(attempt.percentage * 1.5))
  }, [progress, activityLog, saveProgress, saveActivityLog])

  const getLastQuizAttempt = useCallback((contentId: string): QuizAttempt | null => {
    const attempts = progress[contentId]?.quizAttempts
    if (!attempts || attempts.length === 0) return null
    return attempts[attempts.length - 1]
  }, [progress])

  const canRetryQuiz = useCallback((contentId: string, maxAttempts: number = 3): boolean => {
    const attempts = progress[contentId]?.quizAttempts || []
    return attempts.length < maxAttempts
  }, [progress])

  const getRecentActivity = useCallback((limit: number = 10): ActivityLog[] => {
    return activityLog.slice(0, limit)
  }, [activityLog])

  const getContinueWatching = useCallback(() => {
    // Get videos with progress but not completed
    return Object.values(progress)
      .filter(p => p.lastPosition && p.lastPosition > 0 && !p.completed)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 10)
  }, [progress])

  const awardXP = (amount: number) => {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}')
    if (user.xp !== undefined) {
      user.xp += amount
      // Level up logic (every 1000 XP = 1 level)
      const newLevel = Math.floor(user.xp / 1000) + 1
      if (newLevel > user.level) {
        user.level = newLevel
      }
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
  }

  return {
    progress,
    getProgress, // Added to exports
    updateProgress, // Added to exports
    isCompleted,
    markAsCompleted,
    updateVideoPosition,
    saveQuizAttempt,
    getLastQuizAttempt,
    canRetryQuiz,
    getRecentActivity,
    getContinueWatching,
  }
}
