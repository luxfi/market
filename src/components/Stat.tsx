import { Card } from '@/components/ui/card'

// One tile, one measurement. `value` is null when the read did not answer, and
// the tile says so rather than printing a dash, a zero or an empty box — the
// three ways a missing number gets mistaken for a real one.

export function Stat({ label, value, note }: { label: string; value: string | null; note?: string }) {
  return (
    <Card className="px-5 py-4">
      <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      {value === null ? (
        <div className="text-sm text-muted-foreground">unavailable</div>
      ) : (
        <div className="font-mono text-xl font-bold">{value}</div>
      )}
      {note ? <div className="mt-1 text-[11px] text-muted-foreground">{note}</div> : null}
    </Card>
  )
}
