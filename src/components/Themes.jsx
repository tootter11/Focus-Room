import { THEMES } from '../items'

export default function Themes({ coins, unlockedThemes, currentTheme, buyTheme, selectTheme }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map(theme => {
        const owned = !!unlockedThemes[theme.id]
        const active = currentTheme === theme.id
        return (
          <div key={theme.id}
            className={`rounded-xl p-3 text-center border bg-gradient-to-br ${theme.bg} ${active ? 'border-orange-500' : 'border-neutral-200 dark:border-neutral-700'}`}>
            <div className="text-sm font-medium mb-2">{theme.name}</div>
            {owned ? (
              <button onClick={() => selectTheme(theme.id)}
                className={`w-full py-1.5 rounded-lg text-sm ${active ? 'bg-orange-500 text-white' : 'bg-white/70 dark:bg-black/30'}`}>
                {active ? 'Active' : 'Use'}
              </button>
            ) : (
              <button onClick={() => buyTheme(theme.id)} disabled={coins < theme.cost}
                className="w-full py-1.5 rounded-lg text-sm bg-blue-500 text-white disabled:opacity-40">
                Buy: {theme.cost}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
