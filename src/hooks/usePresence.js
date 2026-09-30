import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

// Tracks how many people currently have an active session running,
// using Supabase Realtime presence. No video/audio, no extra table needed.
export function usePresence(userId, running) {
  const [count, setCount] = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    const key = userId || `guest-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel('focus-room-presence', {
      config: { presence: { key } },
    })
    channel.on('presence', { event: 'sync' }, () => {
      setCount(Object.keys(channel.presenceState()).length)
    })
    channel.subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return
    if (running) channel.track({ focusing: true })
    else channel.untrack()
  }, [running])

  return count
}
