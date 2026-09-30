import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { ITEMS, THEMES, AMBIENCE_COST, STREAK_BONUS_DAYS } from '../items'

const LOCAL_KEY = 'focusRoomState'
const SESSION_SECONDS = 25 * 60
const SESSION_MINUTES = 25

const DEFAULT_STATE = {
  coins: 0,
  unlocked: {},
  placed: {},
  theme: 'default',
  unlockedThemes: { default: true },
  ambienceOwned: false,
  ambienceOn: false,
  streak: { count: 0, lastDate: null },
  tasks: [],
  dailyGoal: 4,
  dailyProgress: { count: 0, date: null },
  leaderboardOptIn: false,
  username: null,
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function isYesterday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10)
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

function saveLocal(state) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)) } catch {}
}

export function useFocusState(userId, githubUsername) {
  const [state, setState] = useState(loadLocal)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const userIdRef = useRef(userId)

  useEffect(() => { userIdRef.current = userId }, [userId])

  // On login, pull cloud state and merge in (cloud wins if present)
  useEffect(() => {
    if (!userId) return
    supabase
      .from('user_profiles')
      .select('total_coins, unlocked_items')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Supabase load failed:', error.message, error)
        if (data) {
          setState(s => ({
            ...s,
            coins: data.total_coins ?? s.coins,
            ...(data.unlocked_items ?? {}),
          }))
        }
      })
  }, [userId])

  // Capture GitHub username once, for the leaderboard display
  useEffect(() => {
    if (githubUsername && !state.username) {
      setState(prev => ({ ...prev, username: githubUsername }))
    }
  }, [githubUsername])

  // Persist on every change: always local, and to Supabase when logged in
  useEffect(() => {
    saveLocal(state)
    if (userId) {
      const { coins, ...rest } = state
      supabase.from('user_profiles').upsert({
        id: userId,
        total_coins: coins,
        unlocked_items: rest,
        username: state.username,
        leaderboard_opt_in: state.leaderboardOptIn,
      }).then(({ error }) => {
        if (error) console.error('Supabase save failed:', error.message, error)
      })
    }
  }, [state, userId])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)

          // Log the completed session to Supabase (fire and forget)
          const uid = userIdRef.current
          if (uid) {
            supabase.from('sessions').insert({
              user_id: uid,
              duration_minutes: SESSION_MINUTES,
            }).then(({ error }) => {
              if (error) console.error('Session log failed:', error.message, error)
            })
          }

          setState(prev => {
            const today = todayStr()
            let streak = prev.streak
            if (streak.lastDate === today) {
              // already counted today, streak unchanged
            } else if (isYesterday(streak.lastDate)) {
              streak = { count: streak.count + 1, lastDate: today }
            } else {
              streak = { count: 1, lastDate: today }
            }
            const bonus = streak.count >= STREAK_BONUS_DAYS
            const reward = bonus ? 20 : 10

            const dailyProgress = prev.dailyProgress.date === today
              ? { count: prev.dailyProgress.count + 1, date: today }
              : { count: 1, date: today }

            return { ...prev, coins: prev.coins + reward, streak, dailyProgress }
          })
          setTimeout(() => setSecondsLeft(SESSION_SECONDS), 1200)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = () => { setRunning(false); setSecondsLeft(SESSION_SECONDS) }

  const buyItem = (itemId) => {
    const item = ITEMS.find(i => i.id === itemId)
    if (!item || state.unlocked[itemId] || state.coins < item.cost) return
    setState(prev => ({
      ...prev,
      coins: prev.coins - item.cost,
      unlocked: { ...prev.unlocked, [itemId]: true },
    }))
  }

  const togglePlace = (itemId) => {
    setState(prev => ({ ...prev, placed: { ...prev.placed, [itemId]: !prev.placed[itemId] } }))
  }

  const buyTheme = (themeId) => {
    const theme = THEMES.find(t => t.id === themeId)
    if (!theme || state.unlockedThemes[themeId] || state.coins < theme.cost) return
    setState(prev => ({
      ...prev,
      coins: prev.coins - theme.cost,
      unlockedThemes: { ...prev.unlockedThemes, [themeId]: true },
    }))
  }

  const selectTheme = (themeId) => {
    if (!state.unlockedThemes[themeId]) return
    setState(prev => ({ ...prev, theme: themeId }))
  }

  const buyAmbience = () => {
    if (state.ambienceOwned || state.coins < AMBIENCE_COST) return
    setState(prev => ({ ...prev, coins: prev.coins - AMBIENCE_COST, ambienceOwned: true }))
  }

  const toggleAmbience = () => {
    if (!state.ambienceOwned) return
    setState(prev => ({ ...prev, ambienceOn: !prev.ambienceOn }))
  }

  const addTask = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), text: trimmed, done: false }],
    }))
  }

  const toggleTask = (taskId) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
    }))
  }

  const removeTask = (taskId) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }))
  }

  const setDailyGoal = (n) => {
    setState(prev => ({ ...prev, dailyGoal: Math.max(1, n) }))
  }

  const toggleLeaderboardOptIn = () => {
    setState(prev => ({ ...prev, leaderboardOptIn: !prev.leaderboardOptIn }))
  }

  return {
    state, secondsLeft, running, start, pause, reset,
    buyItem, togglePlace, buyTheme, selectTheme, buyAmbience, toggleAmbience,
    addTask, toggleTask, removeTask, setDailyGoal, toggleLeaderboardOptIn,
  }
}
