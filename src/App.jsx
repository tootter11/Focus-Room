import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFocusState } from './hooks/useFocusState'
import Timer from './components/Timer'
import Room from './components/Room'
import Shop from './components/Shop'

export default function App() {
  const { session, loginWithGitHub, logout } = useAuth()
  const userId = session?.user?.id ?? null
  const { state, secondsLeft, running, start, pause, reset, buyItem, togglePlace } = useFocusState(userId)
  const [tab, setTab] = useState('timer')

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">🪴 Focus Room</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-sm font-medium">{state.coins} coins</span>
          {session
            ? <button onClick={logout} className="text-xs text-neutral-500 underline">Log out</button>
            : <button onClick={loginWithGitHub} className="text-xs text-blue-500 underline">Login with GitHub</button>}
        </div>
      </header>

      <nav className="flex gap-2 mb-4">
        <button onClick={() => setTab('timer')} className={`flex-1 py-2 rounded-lg border text-sm ${tab === 'timer' ? 'bg-orange-500 text-white border-orange-500' : 'border-neutral-300 dark:border-neutral-700'}`}>Timer & Room</button>
        <button onClick={() => setTab('shop')} className={`flex-1 py-2 rounded-lg border text-sm ${tab === 'shop' ? 'bg-orange-500 text-white border-orange-500' : 'border-neutral-300 dark:border-neutral-700'}`}>Shop</button>
      </nav>

      {tab === 'timer' ? (
        <div className="space-y-4">
          <Timer secondsLeft={secondsLeft} running={running} start={start} pause={pause} reset={reset} />
          <Room placed={state.placed} />
        </div>
      ) : (
        <Shop coins={state.coins} unlocked={state.unlocked} placed={state.placed} buyItem={buyItem} togglePlace={togglePlace} />
      )}
    </div>
  )
}
