import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useFocusState } from './hooks/useFocusState'
import { usePresence } from './hooks/usePresence'
import { useStats } from './hooks/useStats'
import { useLeaderboard } from './hooks/useLeaderboard'
import Timer from './components/Timer'
import Room from './components/Room'
import Shop from './components/Shop'
import Themes from './components/Themes'
import Ambience from './components/Ambience'
import Tasks from './components/Tasks'
import GoalProgress from './components/GoalProgress'
import Stats from './components/Stats'
import Leaderboard from './components/Leaderboard'

// Replace with your own Tally.so / Google Form link
const FEEDBACK_URL = 'https://tally.so/r/your-form-id'

const TABS = [
  { id: 'timer', label: 'Focus' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'shop', label: 'Shop' },
  { id: 'themes', label: 'Themes' },
  { id: 'stats', label: 'Stats' },
  { id: 'leaderboard', label: 'Leaders' },
]

export default function App() {
  const { session, loginWithGitHub, logout, githubUsername } = useAuth()
  const userId = session?.user?.id ?? null
  const {
    state, secondsLeft, running, start, pause, reset,
    buyItem, togglePlace, buyTheme, selectTheme, buyAmbience, toggleAmbience,
    addTask, toggleTask, removeTask, setDailyGoal, toggleLeaderboardOptIn,
  } = useFocusState(userId, githubUsername)
  const [tab, setTab] = useState('timer')

  const presenceCount = usePresence(userId, running)
  const { daily, lifetimeMinutes } = useStats(userId, state.coins) // refetch when coins change (proxy for session completed)
  const leaderboardRows = useLeaderboard(state.leaderboardOptIn)

  const openTasks = state.tasks.filter(t => !t.done).length
  const todayCount = state.dailyProgress.date === new Date().toISOString().slice(0, 10)
    ? state.dailyProgress.count
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">🪴 Focus Room</h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-sm font-medium shadow-sm">
              {state.coins} coins
            </span>
            {session
              ? <button onClick={logout} className="text-xs text-neutral-500 underline">Log out</button>
              : <button onClick={loginWithGitHub} className="text-xs text-orange-600 dark:text-orange-400 underline font-medium">Login with GitHub</button>}
          </div>
        </header>

        <div className="flex items-center gap-3 mb-4 text-xs">
          {state.streak.count > 1 && (
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              🔥 {state.streak.count}-day streak{state.streak.count >= 5 ? ' — 2x coins' : ''}
            </span>
          )}
          <span className="text-neutral-500">
            👥 {presenceCount} focusing right now
          </span>
        </div>

        <nav className="flex flex-wrap gap-2 mb-5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[30%] py-2 rounded-xl border text-sm font-medium transition-colors relative
                ${tab === t.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white/70 dark:bg-neutral-800/70 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
              {t.label}
              {t.id === 'tasks' && openTasks > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {openTasks}
                </span>
              )}
            </button>
          ))}
        </nav>

        {tab === 'timer' && (
          <div className="space-y-4">
            <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-6 text-center shadow-sm border border-neutral-200 dark:border-neutral-700">
              <Timer secondsLeft={secondsLeft} running={running} start={start} pause={pause} reset={reset} />
            </div>
            <GoalProgress count={todayCount} goal={state.dailyGoal} setGoal={setDailyGoal} />
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

        {tab === 'tasks' && (
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <Tasks tasks={state.tasks} addTask={addTask} toggleTask={toggleTask} removeTask={removeTask} />
          </div>
        )}

        {tab === 'shop' && (
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <Shop coins={state.coins} unlocked={state.unlocked} placed={state.placed}
              buyItem={buyItem} togglePlace={togglePlace} />
          </div>
        )}

        {tab === 'themes' && (
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <Themes coins={state.coins} unlockedThemes={state.unlockedThemes}
              currentTheme={state.theme} buyTheme={buyTheme} selectTheme={selectTheme} />
          </div>
        )}

        {tab === 'stats' && (
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <Stats daily={daily} lifetimeMinutes={lifetimeMinutes} loggedIn={!!userId} />
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <Leaderboard rows={leaderboardRows} optedIn={state.leaderboardOptIn}
              toggleOptIn={toggleLeaderboardOptIn} loggedIn={!!userId} />
          </div>
        )}

        <a href={FEEDBACK_URL} target="_blank" rel="noreferrer"
          className="block text-center text-xs text-neutral-500 underline mt-6">
          Got feedback? Tell me what to add next →
        </a>
      </div>
    </div>
  )
}
