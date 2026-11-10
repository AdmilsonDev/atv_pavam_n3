import { create } from 'zustand'
import type { GlossaryId } from '@/content/glossary'

export type LearnTab = 'strategy' | 'metrics' | 'compare' | 'glossary' | 'quiz'

interface UiStore {
  tab: LearnTab
  glossaryTerm: GlossaryId | null
  setTab: (tab: LearnTab) => void
  /** Abre o glossário já posicionado no termo informado. */
  openGlossary: (id: GlossaryId) => void
  setGlossaryTerm: (id: GlossaryId | null) => void
}

export const useUiStore = create<UiStore>((set) => ({
  tab: 'strategy',
  glossaryTerm: null,
  setTab: (tab) => set({ tab }),
  openGlossary: (id) => set({ tab: 'glossary', glossaryTerm: id }),
  setGlossaryTerm: (id) => set({ glossaryTerm: id }),
}))
