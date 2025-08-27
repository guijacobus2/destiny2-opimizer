import React from 'react'
import type { StatKey } from '../lib/types'
import { STAT_LABELS } from '../lib/stats'

export default function StatSliders({ weights, onChange }:{ weights: Record<StatKey, number>, onChange: (w: any)=>void }) {
  return (
    <div className="sliders">
      {(Object.keys(weights) as StatKey[]).map(k => (
        <div className="slider" key={k}>
          <label>{STAT_LABELS[k]} <b>{weights[k].toFixed(2)}</b></label>
          <input
            type="range"
            min={0} max={2} step={0.05}
            value={weights[k]}
            onChange={e => onChange({ ...weights, [k]: parseFloat(e.target.value) })}
          />
        </div>
      ))}
    </div>
  )
}
