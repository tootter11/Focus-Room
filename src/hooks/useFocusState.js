import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { ITEMS } from '../items'

const LOCAL_KEY = 'focusRoomState'
const SESSION_SECONDS = 25 * 60

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : { coins: 0, unlocked: {}, placed: {} }
  } catch {
    return { coins: 0, unlocked: {}, placed: {} }
  }
}

function saveLocal(state) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)) } catch {}
}

export function useFocusState(userId) {
  const [state, setState] = useState(loadLocal)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  // On login, pull cloud state and merge in (cloud wins if present)
  useEffect(() => {
    if (!userId) return
    supabase
      .from('user_profiles')
      .select('total_coins, unlocked_items')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setState(s => ({
            ...s,
            coins: data.total_coins ?? s.coins,
            unlocked: data.unlocked_items?.unlocked ?? s.unlocked,
            placed: data.unlocked_items?.placed ?? s.placed,
          }))
        }
      })
  }, [userId])

  // Persist on every change: always local, and to Supabase when logged in
  useEffect(() => {
    saveLocal(state)
    if (userId) {
      supabase.from('user_profiles').upsert({
        id: userId,
        total_coins: state.coins,
        unlocked_items: { unlocked: state.unlocked, placed: state.placed },
      }).then(() => {})
    }
  }, [state, userId])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setState(prev => ({ ...prev, coins: prev.coins + 10 }))
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

  return { state, secondsLeft, running, start, pause, reset, buyItem, togglePlace }
}
