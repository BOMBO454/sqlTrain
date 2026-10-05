import { useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { useUi } from '../store/ui.ts'

export function Workbench({
  left,
  center,
  right,
}: {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}) {
  const stacked = useMatchMedia('(max-width: 899px)')
  const leftWidth = useUi((state) => state.leftWidth)
  const rightWidth = useUi((state) => state.rightWidth)
  const setLeftWidth = useUi((state) => state.setLeftWidth)
  const setRightWidth = useUi((state) => state.setRightWidth)

  return (
    <div className={stacked ? 'flex flex-col gap-3 p-3' : 'flex min-h-0 flex-1 gap-0 p-3'}>
      <div className="flex min-h-0 min-w-0 flex-col" style={stacked ? undefined : { width: leftWidth }}>
        {left}
      </div>
      {stacked ? null : (
        <Splitter
          label="Ширина условия"
          onDrag={(delta) => setLeftWidth(clamp(leftWidth + delta, 260, 520))}
        />
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{center}</div>
      {stacked ? null : (
        <Splitter
          label="Ширина результата"
          onDrag={(delta) => setRightWidth(clamp(rightWidth - delta, 280, 640))}
        />
      )}
      <div className="flex min-h-0 min-w-0 flex-col" style={stacked ? undefined : { width: rightWidth }}>
        {right}
      </div>
    </div>
  )
}

function Splitter({ label, onDrag }: { label: string; onDrag: (delta: number) => void }) {
  const start = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const origin = event.clientX
    const move = (ev: PointerEvent) => onDrag(ev.clientX - origin)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={start}
      className="mx-1 w-2 shrink-0 cursor-col-resize border-x-2 border-transparent bg-line/30 hover:bg-amber"
    />
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return matches
}
