import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Dialog } from './Dialog.tsx'
import { btn } from './styles.ts'
import { applyTheme, useUi, type ThemeChoice } from '../store/ui.ts'

const nextTheme: Record<ThemeChoice, ThemeChoice> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const themeLabel: Record<ThemeChoice, string> = {
  system: 'Тема: как в системе',
  light: 'Тема: светлая',
  dark: 'Тема: тёмная',
}

export function Shell() {
  const theme = useUi((state) => state.theme)
  const setTheme = useUi((state) => state.setTheme)
  const helpOpen = useUi((state) => state.helpOpen)
  const setHelpOpen = useUi((state) => state.setHelpOpen)
  const { pathname } = useLocation()
  const lockScroll = pathname.startsWith('/exercise') || pathname.startsWith('/sandbox')

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return (
    <div className="flex h-dvh flex-col">
      <a href="#editor" className="sr-only focus:not-sr-only focus:absolute focus:z-40 focus:bg-card focus:p-2">
        К редактору
      </a>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-line bg-card px-4 py-2">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none font-semibold tracking-tight italic">Верстак</span>
          <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">SQL</span>
        </Link>
        <nav className="flex items-center gap-4 font-mono text-[12px]">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'underline decoration-amber decoration-2 underline-offset-4' : '')}>
            Темы
          </NavLink>
          <NavLink to="/sandbox" className={({ isActive }) => (isActive ? 'underline decoration-amber decoration-2 underline-offset-4' : '')}>
            Песочница
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" className={btn} onClick={() => setHelpOpen(true)}>
            Клавиши
          </button>
          <button type="button" className={btn} onClick={() => setTheme(nextTheme[theme])}>
            {themeLabel[theme]}
          </button>
        </div>
      </header>
      <div className={`flex min-h-0 flex-1 flex-col overflow-auto ${lockScroll ? 'min-[900px]:overflow-hidden' : ''}`}>
        <Outlet />
      </div>
      {helpOpen ? (
        <Dialog title="Клавиши" onClose={() => setHelpOpen(false)}>
          <ul className="space-y-2 font-mono text-[13px]">
            <li>Ctrl+Enter — выполнить</li>
            <li>Ctrl+Shift+Enter — проверить упражнение</li>
            <li>Alt+Shift+F — отформатировать</li>
            <li>Клик по таблице или столбцу — вставить имя в курсор</li>
          </ul>
          <p>Подсказки в редакторе знают схему текущего упражнения: после FROM — таблицы, после точки — столбцы.</p>
        </Dialog>
      ) : null}
    </div>
  )
}
