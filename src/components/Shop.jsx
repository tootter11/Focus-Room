import { ITEMS } from '../items'

export default function Shop({ coins, unlocked, placed, buyItem, togglePlace }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map(item => {
        const owned = !!unlocked[item.id]
        const on = !!placed[item.id]
        return (
          <div key={item.id} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-center">
            <div className="text-3xl">{item.emoji}</div>
            <div className="text-sm my-1">{item.name}</div>
            {owned ? (
              <button onClick={() => togglePlace(item.id)}
                className={`w-full py-1.5 rounded-lg text-sm ${on ? 'bg-orange-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                {on ? 'Placed' : 'Place'}
              </button>
            ) : (
              <button onClick={() => buyItem(item.id)} disabled={coins < item.cost}
                className="w-full py-1.5 rounded-lg text-sm bg-blue-500 text-white disabled:opacity-40">
                Buy: {item.cost}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
