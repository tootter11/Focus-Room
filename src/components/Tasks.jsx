import { useState } from 'react'

export default function Tasks({ tasks, addTask, toggleTask, removeTask }) {
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    addTask(value)
    setValue('')
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="What are you studying today?"
          className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button type="submit" className="px-4 rounded-lg bg-orange-500 text-white text-sm">Add</button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-6">No tasks yet — add one to focus on this session.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id}
              className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2">
              <button onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${task.done ? 'bg-orange-500 border-orange-500 text-white' : 'border-neutral-400'}`}>
                {task.done ? '✓' : ''}
              </button>
              <span className={`flex-1 text-sm ${task.done ? 'line-through text-neutral-400' : ''}`}>{task.text}</span>
              <button onClick={() => removeTask(task.id)} className="text-neutral-400 hover:text-red-500 text-sm">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
