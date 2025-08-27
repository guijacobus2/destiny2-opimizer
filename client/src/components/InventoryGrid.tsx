import React from 'react'
import type { ArmorItem } from '../lib/types'
import { STAT_LABELS } from '../lib/stats'

export default function InventoryGrid({ items }: { items: ArmorItem[] }) {
  return (
    <div className="grid">
      {items.map((it) => (
        <div className={"card" + (it.isExotic ? " exotic" : "")} key={(it.itemInstanceId || it.itemHash) + it.slot}>
          <div className="row space">
            <div className="left">
              {it.icon ? <img src={it.icon} alt={it.name} className="icon" /> : <div className="icon placeholder" />}
              <div>
                <div className="name">{it.name}</div>
                <div className="sub">{it.slot}{it.setName ? ` • ${it.setName}` : ''}</div>
              </div>
            </div>
            <div className="tag">{it.isExotic ? 'Exotic' : 'Legendary'}</div>
          </div>
          <div className="stats">
            {Object.entries(it.stats).map(([k,v]) => (
              <div className="stat" key={k}>
                <span>{STAT_LABELS[k as keyof typeof STAT_LABELS]}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
