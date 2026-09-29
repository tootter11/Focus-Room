import { ITEMS } from '../items'

export default function Room({ placed }) {
  const placedItems = ITEMS.filter(i => placed[i.id])
  return (
    <div className="bg-neutral-200 dark:bg-neutral-800 rounded-xl p-4 min-h-[80px] flex flex-wrap gap-3 items-end justify-center text-4xl">
      {placedItems.length === 0
        ? <span className="text-sm text-neutral-500">Your room is empty. Earn coins and place items!</span>
        : placedItems.map(i => <span key={i.id} title={i.name}>{i.emoji}</span>)}
    </div>
  )
}
