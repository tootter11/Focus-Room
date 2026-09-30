import { ITEMS, THEMES } from '../items'

export default function Room({ placed, themeId }) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
  const placedItems = ITEMS.filter(i => placed[i.id])

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-gradient-to-b ${theme.bg} shadow-inner`}>
      {/* window */}
      <div className="absolute top-3 right-3 w-16 h-16 rounded-lg bg-white/30 dark:bg-black/20 backdrop-blur-sm border border-white/40 dark:border-white/10" />

      {/* desk */}
      <div className="relative mt-16 mx-3 mb-3 h-24 rounded-xl bg-amber-800/70 dark:bg-amber-950/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)] flex items-end justify-center gap-3 px-4 pb-3 shadow-lg">
        {placedItems.length === 0 ? (
          <span className="text-xs text-white/80 pb-3">Empty desk — earn coins and place something here</span>
        ) : (
          placedItems.map(i => (
            <span key={i.id} title={i.name} className="text-3xl drop-shadow-md animate-float">
              {i.emoji}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
