import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useLeaderboard(refreshKey) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('username, total_coins')
      .eq('leaderboard_opt_in', true)
      .order('total_coins', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) { console.error('Leaderboard load failed:', error.message); return }
        setRows(data || [])
      })
  }, [refreshKey])

  return rows
}
