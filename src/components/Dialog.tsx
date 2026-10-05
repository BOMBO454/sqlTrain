import { useEffect, type ReactNode } from 'react'
import { btn } from './styles.ts'

export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#1c1915]/50 p-4 sm:items-center" role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85dvh] w-full max-w-lg overflow-auto border-2 border-line bg-card p-5 shadow-[8px_8px_0_0_var(--line)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl leading-none font-semibold">{title}</h2>
          <button type="button" className={btn} onClick={onClose} autoFocus>
            Закрыть
          </button>
        </div>
        <div className="space-y-3 text-[16px]">{children}</div>
      </div>
    </div>
  )
}
