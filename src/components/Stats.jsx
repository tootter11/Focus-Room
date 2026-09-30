export default function Stats({ daily, lifetimeMinutes, loggedIn }) {
  if (!loggedIn) {
    return <p className="text-sm text-neutral-500 text-center py-8">Log in with GitHub to track your stats across sessions.</p>
  }
  const max = Math.max(1, ...daily.map(d => d.minutes))
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl font-bold">{Math.round((lifetimeMinutes / 60) * 10) / 10}h</div>
        <div className="text-xs text-neutral-500">total focus time</div>
      </div>
      <div className="flex items-end justify-between gap-2 h-32">
        {daily.map(d => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-orange-500/80 rounded-t"
              style={{ height: `${(d.minutes / max) * 100}%`, minHeight: d.minutes > 0 ? '4px' : '0' }}
            />
            <span className="text-[10px] text-neutral-500">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
