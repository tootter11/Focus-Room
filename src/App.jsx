import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFocusState } from './hooks/useFocusState'
import Timer from './components/Timer'
import Room from './components/Room'
import Shop from './components/Shop'
import Themes from './components/Themes'
import Ambience from './components/Ambience'

// Replace with your own Tally.so / Google Form link
const FEEDBACK_URL = 'https://tally.so/r/your-form-id'

const TABS = [
  { id: 'timer', label: 'Timer & Room' },
  { id: 'shop', label: 'Shop' },
  { id: 'themes', label: 'Themes' },
]

export default function App() {
  const { session, loginWithGitHub, logout } = useAuth()
  const userId = session?.user?.id ?? null
  const {
    state, secondsLeft, running, start, pause, reset,
    buyItem, togglePlace, buyTheme, selectTheme, buyAmbience, toggleAmbience,
  } = useFocusState(userId)
  const [tab, setTab] = useState('timer')

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold">🪴 Focus Room</h1>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1 text-sm font-medium">
            {state.coins} coins
          </span>
          {session
            ? <button onClick={logout} className="text-xs text-neutral-500 underline">Log out</button>
            : <button onClick={loginWithGitHub} className="text-xs text-blue-500 underline">Login with GitHub</button>}
        </div>
      </header>

      {state.streak.count > 1 && (
        <div className="text-xs text-orange-500 font-medium mb-3">
          🔥 {state.streak.count}-day streak{state.streak.count >= 5 ? ' — 2x coins active!' : ` — ${5 - state.streak.count} more day(s) for 2x coins`}
        </div>
      )}

      <nav className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg border text-sm ${tab === t.id ? 'bg-orange-500 text-white border-orange-500' : 'border-neutral-300 dark:border-neutral-700'}`}>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'timer' && (
        <div className="space-y-4">
          <Timer secondsLeft={secondsLeft} running={running} start={start} pause={pause} reset={reset} />
          <Room placed={state.placed} themeId={state.theme} />
          <Ambience
            owned={state.ambienceOwned}
            on={state.ambienceOn}
            coins={state.coins}
            buyAmbience={buyAmbience}
            toggleAmbience={toggleAmbience}
          />
        </div>
      )}

      {tab === 'shop' && (
        <Shop coins={state.coins} unlocked={state.unlocked} placed={state.placed}
          buyItem={buyItem} togglePlace={togglePlace} />
      )}

      {tab === 'themes' && (
        <Themes coins={state.coins} unlockedThemes={state.unlockedThemes}
          currentTheme={state.theme} buyTheme={buyTheme} selectTheme={selectTheme} />
      )}

      <a href={FEEDBACK_URL} target="_blank" rel="noreferrer"
        className="block text-center text-xs text-neutral-500 underline mt-6">
        Got feedback? Tell me what to add next →
      </a>
    </div>
  )
}
