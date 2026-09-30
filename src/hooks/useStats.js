import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useStats(userId, refreshKey) {
  const [daily, setDaily] = useState([])
  const [lifetimeMinutes, setLifetimeMinutes] = useState(0)

  useEffect(() => {
    if (!userId) { setDaily([]); setLifetimeMinutes(0); return }

    const since = new Date()
    since.setDate(since.getDate() - 6)

    supabase
      .from('sessions')
      .select('completed_at, duration_minutes')
      .eq('user_id', userId)
      .gte('completed_at', since.toISOString())
      .then(({ data, error }) => {
        if (error) { console.error('Stats load failed:', error.message); return }
        const byDay = {}
        for (let i = 0; i < 7; i++) {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          byDay[d.toISOString().slice(0, 10)] = 0
        }
        ;(data || []).forEach(row => {
          const key = row.completed_at.slice(0, 10)
          if (key in byDay) byDay[key] += row.duration_minutes
        })
        setDaily(Object.entries(byDay).map(([date, minutes]) => ({ date, minutes })))
      })

    supabase
      .from('sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) { console.error('Lifetime stats failed:', error.message); return }
        setLifetimeMinutes((data || []).reduce((sum, r) => sum + r.duration_minutes, 0))
      })
  }, [userId, refreshKey])

  return { daily, lifetimeMinutes }
}
