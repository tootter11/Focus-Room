export default function Timer({ secondsLeft, running, start, pause, reset }) {
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const s = String(secondsLeft % 60).padStart(2, '0')
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 text-center shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="text-6xl font-bold tracking-wide mb-4">{m}:{s}</div>
      <div className="flex gap-3 justify-center">
        <button onClick={start} disabled={running} className="px-5 py-2 rounded-lg bg-orange-500 text-white disabled:opacity-40">Start</button>
        <button onClick={pause} className="px-5 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700">Pause</button>
        <button onClick={reset} className="px-5 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700">Reset</button>
      </div>
    </div>
  )
}
