import { create } from 'zustand'
import {
  Character,
  CharacterNode,
  WorldRule,
  Chapter,
  Series,
  ComposerScene,
  StyleGuide,
} from './types'

interface AppStore {
  // Data
  characters: CharacterNode[]
  characters_full: Record<string, Character>
  worldRules: WorldRule[]
  chapters: Chapter[]
  series: Series[]

  // UI State
  selectedCharacterId: string | null
  selectedWorldRuleId: string | null
  selectedChapterId: string | null
  selectedSeriesFilter: string | null
  selectedAffiliationFilter: string | null
  selectedFighterTypeFilter: string | null
  searchQuery: string
  showCharacterPanel: boolean
  showWorldPanel: boolean
  showChapterPanel: boolean

  // Graph Filters
  eplRangeMin: number
  eplRangeMax: number
  showCharacterNodes: boolean
  showWorldNodes: boolean
  showChapterNodes: boolean

  // Composer State
  composerScenes: ComposerScene[]
  currentSceneId: string | null
  styleGuide: StyleGuide

  // Actions - Data
  setCharacters: (characters: CharacterNode[]) => void
  setCharactersFull: (characters: Record<string, Character>) => void
  setWorldRules: (rules: WorldRule[]) => void
  setChapters: (chapters: Chapter[]) => void
  setSeries: (series: Series[]) => void

  // Actions - UI
  selectCharacter: (id: string | null) => void
  selectWorldRule: (id: string | null) => void
  selectChapter: (id: string | null) => void
  setSelectedSeriesFilter: (series: string | null) => void
  setSelectedAffiliationFilter: (affiliation: string | null) => void
  setSelectedFighterTypeFilter: (fighterType: string | null) => void
  setSearchQuery: (query: string) => void
  setShowCharacterPanel: (show: boolean) => void
  setShowWorldPanel: (show: boolean) => void
  setShowChapterPanel: (show: boolean) => void

  // Actions - Graph
  setEplRange: (min: number, max: number) => void
  setShowCharacterNodes: (show: boolean) => void
  setShowWorldNodes: (show: boolean) => void
  setShowChapterNodes: (show: boolean) => void

  // Actions - Composer
  createScene: (scene: ComposerScene) => void
  updateScene: (id: string, updates: Partial<ComposerScene>) => void
  deleteScene: (id: string) => void
  setCurrentScene: (id: string | null) => void
  updateStyleGuide: (guide: Partial<StyleGuide>) => void
}

export const useStore = create<AppStore>((set) => ({
  // Initial state - Data
  characters: [],
  characters_full: {},
  worldRules: [],
  chapters: [],
  series: [],

  // Initial state - UI
  selectedCharacterId: null,
  selectedWorldRuleId: null,
  selectedChapterId: null,
  selectedSeriesFilter: null,
  selectedAffiliationFilter: null,
  selectedFighterTypeFilter: null,
  searchQuery: '',
  showCharacterPanel: false,
  showWorldPanel: false,
  showChapterPanel: false,

  // Initial state - Graph
  eplRangeMin: 0,
  eplRangeMax: 100,
  showCharacterNodes: true,
  showWorldNodes: true,
  showChapterNodes: true,

  // Initial state - Composer
  composerScenes: [],
  currentSceneId: null,
  styleGuide: {
    artStyle: 'Studio Ghibli',
    colorPalette: ['#00f0ff', '#ff00ff', '#b300ff', '#39ff14'],
    characterStyle: 'Anime',
    environmentStyle: 'Cyberpunk',
  },

  // Actions - Data
  setCharacters: (characters) => set({ characters }),
  setCharactersFull: (characters_full) => set({ characters_full }),
  setWorldRules: (worldRules) => set({ worldRules }),
  setChapters: (chapters) => set({ chapters }),
  setSeries: (series) => set({ series }),

  // Actions - UI
  selectCharacter: (selectedCharacterId) =>
    set({
      selectedCharacterId,
      showCharacterPanel: selectedCharacterId !== null,
    }),
  selectWorldRule: (selectedWorldRuleId) =>
    set({
      selectedWorldRuleId,
      showWorldPanel: selectedWorldRuleId !== null,
    }),
  selectChapter: (selectedChapterId) =>
    set({
      selectedChapterId,
      showChapterPanel: selectedChapterId !== null,
    }),
  setSelectedSeriesFilter: (selectedSeriesFilter) =>
    set({ selectedSeriesFilter }),
  setSelectedAffiliationFilter: (selectedAffiliationFilter) =>
    set({ selectedAffiliationFilter }),
  setSelectedFighterTypeFilter: (selectedFighterTypeFilter) =>
    set({ selectedFighterTypeFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowCharacterPanel: (showCharacterPanel) => set({ showCharacterPanel }),
  setShowWorldPanel: (showWorldPanel) => set({ showWorldPanel }),
  setShowChapterPanel: (showChapterPanel) => set({ showChapterPanel }),

  // Actions - Graph
  setEplRange: (eplRangeMin, eplRangeMax) =>
    set({ eplRangeMin, eplRangeMax }),
  setShowCharacterNodes: (showCharacterNodes) => set({ showCharacterNodes }),
  setShowWorldNodes: (showWorldNodes) => set({ showWorldNodes }),
  setShowChapterNodes: (showChapterNodes) => set({ showChapterNodes }),

  // Actions - Composer
  createScene: (scene) =>
    set((state) => ({
      composerScenes: [...state.composerScenes, scene],
      currentSceneId: scene.id,
    })),
  updateScene: (id, updates) =>
    set((state) => ({
      composerScenes: state.composerScenes.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
  deleteScene: (id) =>
    set((state) => ({
      composerScenes: state.composerScenes.filter((s) => s.id !== id),
      currentSceneId:
        state.currentSceneId === id ? null : state.currentSceneId,
    })),
  setCurrentScene: (currentSceneId) => set({ currentSceneId }),
  updateStyleGuide: (updates) =>
    set((state) => ({
      styleGuide: { ...state.styleGuide, ...updates },
    })),
}))
