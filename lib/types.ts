// Character types
export interface CharacterNode {
  id: string
  name: string
  series: string
  affiliations: string[]
  fighterType: string[]
  specialAbilities?: string[]
  age?: string
  height?: string
  specialty?: string
  imageUrl?: string
  pageUrl?: string
  eplScores?: Record<string, number>
}

export interface Character extends CharacterNode {
  aliases: string[]
  birthday?: string
  genre?: string
  origin?: string
  sexuality?: string
  romanticInterests?: string
  family?: string
  fightingStyle?: string
  specialAbilities: string[]
  backstory?: string
  personality?: string
  motivations?: string
  weapons?: string
  references?: string[]
  pageUrl: string
}

// World Building types
export interface WorldRule {
  id: string
  name: string
  tags: string[]
  content: string
  created: string
  pageUrl: string
}

// Chapter types
export interface Chapter {
  id: string
  title: string
  series: string
  book?: string
  status: string
  drawingStatus: string
  schedule?: string
  releaseOrder?: number
  content?: string
  characterIds: string[]
  pageUrl: string
}

// Series types
export interface Series {
  id: string
  name: string
  description?: string
  genres: string[]
  status: string
  platforms: string[]
  mature?: boolean
  pageUrl: string
}

// Node graph types
export interface GraphNode {
  id: string
  label: string
  type: 'character' | 'world' | 'chapter' | 'series'
  group?: string
  color?: string
  size?: number
  data: any
}

export interface GraphLink {
  source: string
  target: string
  type: string
}

// Panel Composer types
export interface ComposerPanel {
  id: string
  position: number
  characters: CharacterNode[]
  setting?: string
  mood?: string
  dialogue?: string
  action?: string
  timeOfDay?: string
  imagePrompt?: string
}

export interface ComposerScene {
  id: string
  title: string
  panelLayout: '1' | '2' | '3' | '4' | 'full'
  panels: ComposerPanel[]
  chapterId?: string
  artStyle?: string
  colorPalette?: string[]
  generatedPrompts: string[]
}

export interface StyleGuide {
  artStyle: string
  colorPalette: string[]
  characterStyle: string
  environmentStyle: string
}
