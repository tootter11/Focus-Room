export default function Leaderboard({ rows, optedIn, toggleOptIn, loggedIn }) {
  return (
    <div className="space-y-4">
      {loggedIn ? (
        <button onClick={toggleOptIn}
          className={`w-full py-2 rounded-lg text-sm ${optedIn ? 'bg-orange-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
          {optedIn ? '✓ Showing on the leaderboard' : 'Join the leaderboard'}
        </button>
      ) : (
        <p className="text-xs text-neutral-500 text-center">Log in with GitHub to join the leaderboard.</p>
      )}
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-6">No one's opted in yet — be the first!</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm">
              <span>#{i + 1} {r.username || 'Anonymous'}</span>
              <span className="font-medium">{r.total_coins} coins</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
