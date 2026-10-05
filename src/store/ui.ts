import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeChoice = 'light' | 'dark' | 'system'

type UiState = {
  theme: ThemeChoice
  liveRun: boolean
  leftWidth: number
  rightWidth: number
  lastExerciseId: string | null
  helpOpen: boolean
  setTheme: (theme: ThemeChoice) => void
  setLiveRun: (liveRun: boolean) => void
  setLeftWidth: (leftWidth: number) => void
  setRightWidth: (rightWidth: number) => void
  setLastExerciseId: (lastExerciseId: string | null) => void
  setHelpOpen: (helpOpen: boolean) => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      liveRun: true,
      leftWidth: 340,
      rightWidth: 420,
      lastExerciseId: null,
      helpOpen: false,
      setTheme: (theme) => set({ theme }),
      setLiveRun: (liveRun) => set({ liveRun }),
      setLeftWidth: (leftWidth) => set({ leftWidth }),
      setRightWidth: (rightWidth) => set({ rightWidth }),
      setLastExerciseId: (lastExerciseId) => set({ lastExerciseId }),
      setHelpOpen: (helpOpen) => set({ helpOpen }),
    }),
    {
      name: 'verstak-ui',
      partialize: (state) => ({
        theme: state.theme,
        liveRun: state.liveRun,
        leftWidth: state.leftWidth,
        rightWidth: state.rightWidth,
        lastExerciseId: state.lastExerciseId,
      }),
    },
  ),
)

export function applyTheme(theme: ThemeChoice) {
  const dark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  return dark
}
