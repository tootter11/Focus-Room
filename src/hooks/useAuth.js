import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useAuth() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const loginWithGitHub = () => supabase.auth.signInWithOAuth({ provider: 'github' })
  const logout = () => supabase.auth.signOut()
  const githubUsername = session?.user?.user_metadata?.user_name
    ?? session?.user?.user_metadata?.preferred_username
    ?? null

  return { session, loginWithGitHub, logout, githubUsername }
}
