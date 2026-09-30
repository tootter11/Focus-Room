export default function GoalProgress({ count, goal, setGoal }) {
  const pct = Math.min(100, Math.round((count / goal) * 100))
  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur rounded-2xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span>Today's goal: {count}/{goal} sessions</span>
        <div className="flex gap-1">
          <button onClick={() => setGoal(goal - 1)} className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-700">−</button>
          <button onClick={() => setGoal(goal + 1)} className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-700">+</button>
        </div>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
        <div className="h-full bg-orange-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
