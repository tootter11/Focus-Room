import { useEffect, useRef } from 'react'
import { AMBIENCE_COST } from '../items'

// Procedurally generated brown-noise "rain" loop via Web Audio API —
// no external audio file needed, so it works offline and needs no hosting.
export default function Ambience({ owned, on, coins, buyAmbience, toggleAmbience }) {
  const ctxRef = useRef(null)
  const nodeRef = useRef(null)

  useEffect(() => {
    if (on && !nodeRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const bufferSize = 2 * ctx.sampleRate
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = data[i]
        data[i] *= 3.5
      }
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const gain = ctx.createGain()
      gain.gain.value = 0.15
      source.connect(gain).connect(ctx.destination)
      source.start()
      ctxRef.current = ctx
      nodeRef.current = source
    }
    if (!on && nodeRef.current) {
      nodeRef.current.stop()
      ctxRef.current.close()
      nodeRef.current = null
      ctxRef.current = null
    }
    return () => {
      if (nodeRef.current) {
        nodeRef.current.stop()
        ctxRef.current.close()
        nodeRef.current = null
        ctxRef.current = null
      }
    }
  }, [on])

  if (!owned) {
    return (
      <button onClick={buyAmbience} disabled={coins < AMBIENCE_COST}
        className="w-full py-2 rounded-lg text-sm bg-blue-500 text-white disabled:opacity-40">
        Unlock rain sounds — {AMBIENCE_COST} coins
      </button>
    )
  }
  return (
    <button onClick={toggleAmbience}
      className={`w-full py-2 rounded-lg text-sm ${on ? 'bg-orange-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
      {on ? '🔊 Rain sounds on' : '🔈 Rain sounds off'}
    </button>
  )
}
