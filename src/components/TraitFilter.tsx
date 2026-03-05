'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NFTTrait } from '@/lib/explorer'

interface TraitGroup {
  trait_type: string
  values: { value: string; count: number }[]
}

interface TraitFilterProps {
  instances: Array<{ metadata?: { attributes?: NFTTrait[] } | null }>
  selectedTraits: Record<string, Set<string>>
  onTraitToggle: (traitType: string, value: string) => void
  onClear: () => void
}

export function TraitFilter({ instances, selectedTraits, onTraitToggle, onClear }: TraitFilterProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Aggregate trait groups
  const traitGroups: TraitGroup[] = []
  const groupMap = new Map<string, Map<string, number>>()

  for (const inst of instances) {
    const attrs = inst.metadata?.attributes
    if (!attrs) continue
    for (const attr of attrs) {
      if (!attr.trait_type) continue
      let valueMap = groupMap.get(attr.trait_type)
      if (!valueMap) {
        valueMap = new Map()
        groupMap.set(attr.trait_type, valueMap)
      }
      const val = String(attr.value)
      valueMap.set(val, (valueMap.get(val) ?? 0) + 1)
    }
  }

  for (const [trait_type, valueMap] of groupMap) {
    const values = Array.from(valueMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
    traitGroups.push({ trait_type, values })
  }
  traitGroups.sort((a, b) => a.trait_type.localeCompare(b.trait_type))

  const hasSelected = Object.values(selectedTraits).some((s) => s.size > 0)

  if (traitGroups.length === 0) return null

  return (
    <div className="bg-card rounded-xl border border-border p-4 w-60 shrink-0">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-semibold">Traits</div>
        {hasSelected && (
          <button
            onClick={onClear}
            className="bg-transparent border-none text-primary text-xs cursor-pointer hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {traitGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.trait_type)
        const selected = selectedTraits[group.trait_type]
        const activeCount = selected?.size ?? 0

        return (
          <div key={group.trait_type} className="mb-1">
            <button
              onClick={() => {
                const next = new Set(expandedGroups)
                if (isExpanded) next.delete(group.trait_type)
                else next.add(group.trait_type)
                setExpandedGroups(next)
              }}
              className="w-full flex justify-between items-center py-2 bg-transparent border-none text-foreground cursor-pointer text-[13px] font-medium"
            >
              <span>
                {group.trait_type}
                {activeCount > 0 && (
                  <span className="ml-1.5 text-primary text-[11px]">({activeCount})</span>
                )}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            {isExpanded && (
              <div className="pl-1 pb-2 flex flex-col gap-0.5">
                {group.values.slice(0, 20).map((v) => {
                  const isActive = selected?.has(v.value) ?? false
                  return (
                    <button
                      key={v.value}
                      onClick={() => onTraitToggle(group.trait_type, v.value)}
                      className={cn(
                        'flex justify-between items-center px-2 py-1 rounded-md cursor-pointer text-xs text-left border transition-colors',
                        isActive
                          ? 'bg-primary/10 border-primary/50 text-foreground'
                          : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {v.value}
                      </span>
                      <span className="text-[11px] shrink-0 ml-2 font-mono">{v.count}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
