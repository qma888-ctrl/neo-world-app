'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ComposerPanel, ComposerScene, CharacterNode, Chapter } from '@/lib/types'
import { ChevronLeft, Plus, Trash2, Copy, Wand2, Check, BookOpen } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function ComposerPage() {
  const {
    characters,
    chapters,
    composerScenes,
    currentSceneId,
    styleGuide,
    createScene,
    updateScene,
    deleteScene,
    setCurrentScene,
    updateStyleGuide,
  } = useStore()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [charsRes, chaptersRes] = await Promise.all([
          axios.get('/api/characters'),
          axios.get('/api/chapters'),
        ])
        useStore.setState({
          characters: charsRes.data,
          chapters: chaptersRes.data,
        })
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (characters.length === 0) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [characters.length])

  const handleNewScene = () => {
    const newScene: ComposerScene = {
      id: generateUUID(),
      title: 'Untitled Scene',
      panelLayout: '4',
      panels: Array(4)
        .fill(null)
        .map((_, i) => ({
          id: `panel-${i}`,
          position: i,
          characters: [],
          setting: '',
          mood: '',
          dialogue: '',
          action: '',
          timeOfDay: '',
          imagePrompt: '',
        })),
      chapterId: undefined,
      artStyle: styleGuide.artStyle,
      colorPalette: styleGuide.colorPalette,
      generatedPrompts: [],
    }
    createScene(newScene)
  }

  const currentScene = composerScenes.find((s) => s.id === currentSceneId)

  if (loading) {
    return (
      <div className="w-full h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neon-cyan">Loading world data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <div className="w-80 bg-dark-surface border-r border-neon-cyan/20 flex flex-col">
        {/* Header */}
        <div className="border-b border-neon-cyan/20 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-neon-cyan hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Graph
          </Link>
          <h1 className="text-2xl font-bold text-neon-magenta">Composer</h1>
          <p className="text-xs text-gray-400">Manga Panel Creator</p>
        </div>

        {/* Style Guide */}
        <div className="border-b border-neon-cyan/20 p-4 space-y-3">
          <h3 className="font-semibold text-neon-cyan text-sm">Style Guide</h3>
          <div>
            <label className="text-xs text-gray-400">Art Style</label>
            <input
              type="text"
              value={styleGuide.artStyle}
              onChange={(e) => updateStyleGuide({ artStyle: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-100 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Character Style</label>
            <input
              type="text"
              value={styleGuide.characterStyle}
              onChange={(e) => updateStyleGuide({ characterStyle: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-100 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Environment Style</label>
            <input
              type="text"
              value={styleGuide.environmentStyle}
              onChange={(e) => updateStyleGuide({ environmentStyle: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-100 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Color Palette</label>
            <div className="flex gap-2 mt-1">
              {styleGuide.colorPalette.map((color, i) => (
                <input
                  key={i}
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newPalette = [...styleGuide.colorPalette]
                    newPalette[i] = e.target.value
                    updateStyleGuide({ colorPalette: newPalette })
                  }}
                  className="w-8 h-8 rounded border border-gray-600 cursor-pointer bg-transparent"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scenes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neon-cyan text-sm">Scenes</h3>
            <button
              onClick={handleNewScene}
              className="p-1 hover:bg-dark-elevated rounded transition-colors"
              title="New Scene"
            >
              <Plus className="w-4 h-4 text-neon-green" />
            </button>
          </div>

          {composerScenes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-500 mb-3">No scenes yet</p>
              <button
                onClick={handleNewScene}
                className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded text-xs hover:bg-neon-cyan/30 transition-colors"
              >
                Create First Scene
              </button>
            </div>
          ) : (
            composerScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setCurrentScene(scene.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  currentSceneId === scene.id
                    ? 'bg-dark-elevated border-neon-magenta'
                    : 'bg-dark-elevated/50 border-neon-cyan/20 hover:border-neon-cyan/50'
                }`}
              >
                <p className="font-semibold text-sm text-neon-cyan">{scene.title}</p>
                <p className="text-xs text-gray-400">
                  {scene.panelLayout === 'full' ? 'Full page' : `${scene.panelLayout}-panel`} layout
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentScene ? (
          <>
            {/* Canvas Header */}
            <div className="border-b border-neon-cyan/20 bg-dark-surface p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={currentScene.title}
                  onChange={(e) => updateScene(currentScene.id, { title: e.target.value })}
                  className="text-2xl font-bold bg-transparent text-neon-cyan border-b border-neon-cyan/30 focus:outline-none focus:border-neon-cyan"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={currentScene.panelLayout}
                  onChange={(e) =>
                    updateScene(currentScene.id, {
                      panelLayout: e.target.value as ComposerScene['panelLayout'],
                      panels: Array(
                        e.target.value === 'full' ? 1 : parseInt(e.target.value)
                      )
                        .fill(null)
                        .map((_, i) => currentScene.panels[i] || {
                          id: `panel-${i}`,
                          position: i,
                          characters: [],
                          setting: '',
                          mood: '',
                          dialogue: '',
                          action: '',
                          timeOfDay: '',
                          imagePrompt: '',
                        }),
                    })
                  }
                  className="px-3 py-1 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-200 focus:outline-none"
                >
                  <option value="1">1 Panel</option>
                  <option value="2">2 Panels</option>
                  <option value="3">3 Panels</option>
                  <option value="4">4 Panels</option>
                  <option value="full">Full Page</option>
                </select>
                <button
                  onClick={() => {
                    deleteScene(currentScene.id)
                    setCurrentScene(null)
                  }}
                  className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-neon-pink" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-8">
              <ComposerCanvas
                scene={currentScene}
                characters={characters}
                chapters={chapters}
                styleGuide={styleGuide}
                onUpdateScene={(updates) => updateScene(currentScene.id, updates)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Wand2 className="w-16 h-16 text-neon-magenta/30 mb-6" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">Panel Composer</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Create scenes, drag in characters, set the mood, and generate AI-ready prompts
              that keep your art style and character designs consistent.
            </p>
            <button
              onClick={handleNewScene}
              className="px-6 py-3 bg-neon-cyan text-dark-bg font-semibold rounded-lg hover:bg-neon-cyan/80 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Scene
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ComposerCanvas({
  scene,
  characters,
  chapters,
  styleGuide,
  onUpdateScene,
}: {
  scene: ComposerScene
  characters: CharacterNode[]
  chapters: Chapter[]
  styleGuide: { artStyle: string; colorPalette: string[]; characterStyle: string; environmentStyle: string }
  onUpdateScene: (updates: Partial<ComposerScene>) => void
}) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [chapterContent, setChapterContent] = useState<string>('')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sceneSetting, setSceneSetting] = useState('')
  const [sceneMood, setSceneMood] = useState('')
  const [sceneTimeOfDay, setSceneTimeOfDay] = useState('')

  const handleChapterSelect = async (chapterId: string) => {
    if (!chapterId) {
      setSelectedChapter(null)
      setChapterContent('')
      return
    }
    try {
      const res = await axios.get(`/api/chapters/${chapterId}`)
      setSelectedChapter(res.data)
      setChapterContent(res.data.content || '')
      onUpdateScene({ chapterId })
    } catch (error) {
      console.error('Failed to load chapter:', error)
    }
  }

  const updatePanel = (panelIndex: number, updates: Partial<ComposerPanel>) => {
    const newPanels = [...scene.panels]
    newPanels[panelIndex] = { ...newPanels[panelIndex], ...updates }
    onUpdateScene({ panels: newPanels })
  }

  const addCharacterToPanel = (panelIndex: number, charId: string) => {
    const char = characters.find((c) => c.id === charId)
    if (!char) return
    const panel = scene.panels[panelIndex]
    if (panel.characters.find((c) => c.id === charId)) return
    updatePanel(panelIndex, { characters: [...panel.characters, char] })
  }

  const removeCharacterFromPanel = (panelIndex: number, charId: string) => {
    const panel = scene.panels[panelIndex]
    updatePanel(panelIndex, {
      characters: panel.characters.filter((c) => c.id !== charId),
    })
  }

  const generatePrompt = () => {
    setGeneratingPrompt(true)

    const prompts: string[] = scene.panels.map((panel, i) => {
      const charDescriptions = panel.characters
        .map((char) => {
          const eplInfo = char.eplScores
            ? Object.entries(char.eplScores)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : ''
          return [
            `- ${char.name}`,
            char.fighterType?.length ? `  Fighter Type: ${char.fighterType.join(', ')}` : '',
            char.affiliations?.length ? `  Affiliation: ${char.affiliations.join(', ')}` : '',
            char.specialAbilities?.length ? `  Abilities: ${char.specialAbilities.join(', ')}` : '',
            eplInfo ? `  EPL: ${eplInfo}` : '',
            char.age ? `  Age: ${char.age}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        })
        .join('\n')

      return [
        `=== PANEL ${i + 1} of ${scene.panels.length} ===`,
        '',
        `ART STYLE: ${scene.artStyle || styleGuide.artStyle}`,
        `CHARACTER STYLE: ${styleGuide.characterStyle}`,
        `ENVIRONMENT STYLE: ${styleGuide.environmentStyle}`,
        `COLOR PALETTE: ${(scene.colorPalette || styleGuide.colorPalette).join(', ')}`,
        `RENDERING: Full color manga panel`,
        '',
        panel.setting || sceneSetting
          ? `SETTING: ${panel.setting || sceneSetting}`
          : '',
        panel.mood || sceneMood ? `MOOD: ${panel.mood || sceneMood}` : '',
        panel.timeOfDay || sceneTimeOfDay
          ? `TIME OF DAY: ${panel.timeOfDay || sceneTimeOfDay}`
          : '',
        '',
        charDescriptions ? `CHARACTERS IN SCENE:\n${charDescriptions}` : '',
        '',
        panel.action ? `ACTION: ${panel.action}` : '',
        panel.dialogue ? `DIALOGUE: "${panel.dialogue}"` : '',
        '',
        selectedChapter ? `SOURCE CHAPTER: ${selectedChapter.title}` : '',
        selectedChapter?.book ? `BOOK: ${selectedChapter.book}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })

    const fullPrompt = [
      `MANGA PANEL GENERATION — "${scene.title}"`,
      `${'='.repeat(50)}`,
      '',
      `STYLE GUIDE:`,
      `  Art Style: ${scene.artStyle || styleGuide.artStyle}`,
      `  Character Style: ${styleGuide.characterStyle}`,
      `  Environment Style: ${styleGuide.environmentStyle}`,
      `  Color: Full color (not black and white)`,
      `  Color Palette: ${(scene.colorPalette || styleGuide.colorPalette).join(', ')}`,
      '',
      `SCENE CONTEXT:`,
      sceneSetting ? `  Setting: ${sceneSetting}` : '',
      sceneMood ? `  Mood/Atmosphere: ${sceneMood}` : '',
      sceneTimeOfDay ? `  Time of Day: ${sceneTimeOfDay}` : '',
      selectedChapter ? `  Chapter: ${selectedChapter.title}` : '',
      '',
      `LAYOUT: ${scene.panelLayout === 'full' ? 'Full page' : `${scene.panelLayout}-panel layout`}`,
      '',
      ...prompts,
      '',
      chapterContent
        ? `RELEVANT CHAPTER TEXT:\n${chapterContent.substring(0, 2000)}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')

    onUpdateScene({ generatedPrompts: [...scene.generatedPrompts, fullPrompt] })
    setGeneratingPrompt(false)
  }

  const handleCopyPrompt = async () => {
    if (scene.generatedPrompts.length === 0) return
    try {
      await navigator.clipboard.writeText(
        scene.generatedPrompts[scene.generatedPrompts.length - 1]
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea')
      el.value = scene.generatedPrompts[scene.generatedPrompts.length - 1]
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Scene Settings */}
      <div className="bg-dark-surface border border-neon-cyan/20 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-neon-cyan flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Scene Settings
        </h3>

        <div>
          <label className="text-sm text-gray-400">Chapter Source</label>
          <select
            value={scene.chapterId || ''}
            onChange={(e) => handleChapterSelect(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-200 focus:outline-none focus:border-neon-cyan"
          >
            <option value="">Select a chapter for context...</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} {ch.book ? `(${ch.book})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400">Setting / Location</label>
            <input
              type="text"
              value={sceneSetting}
              onChange={(e) => setSceneSetting(e.target.value)}
              placeholder="The Lows arena, rooftop..."
              className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-200 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Mood / Atmosphere</label>
            <input
              type="text"
              value={sceneMood}
              onChange={(e) => setSceneMood(e.target.value)}
              placeholder="Tense, triumphant, desperate..."
              className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-200 focus:outline-none focus:border-neon-cyan"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Time of Day</label>
            <input
              type="text"
              value={sceneTimeOfDay}
              onChange={(e) => setSceneTimeOfDay(e.target.value)}
              placeholder="Night, dome-light, golden hour..."
              className="w-full mt-1 px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-sm text-gray-200 focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>

        {chapterContent && (
          <div>
            <label className="text-sm text-gray-400">Chapter Preview</label>
            <div className="mt-1 p-3 bg-dark-bg border border-gray-700 rounded max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-400 whitespace-pre-wrap">
                {chapterContent.substring(0, 500)}
                {chapterContent.length > 500 ? '...' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Panel Grid */}
      <div
        className={`grid gap-6 ${
          scene.panelLayout === '1' || scene.panelLayout === 'full'
            ? 'grid-cols-1 max-w-2xl mx-auto'
            : scene.panelLayout === '2'
            ? 'grid-cols-2'
            : scene.panelLayout === '3'
            ? 'grid-cols-3'
            : 'grid-cols-2'
        }`}
      >
        {scene.panels.map((panel, idx) => (
          <PanelSlot
            key={panel.id}
            panel={panel}
            panelIndex={idx}
            characters={characters}
            onAddCharacter={(charId) => addCharacterToPanel(idx, charId)}
            onRemoveCharacter={(charId) => removeCharacterFromPanel(idx, charId)}
            onUpdatePanel={(updates) => updatePanel(idx, updates)}
          />
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePrompt}
        disabled={generatingPrompt}
        className="w-full px-6 py-4 bg-gradient-to-r from-neon-magenta to-neon-cyan text-dark-bg font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg"
      >
        <Wand2 className="w-5 h-5" />
        {generatingPrompt ? 'Generating...' : 'Generate Panel Prompt'}
      </button>

      {/* Generated Prompt Display */}
      {scene.generatedPrompts.length > 0 && (
        <div className="bg-dark-surface border border-neon-magenta/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neon-magenta flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Generated Prompt
            </h3>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-3 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded text-sm hover:bg-neon-cyan/30 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="bg-dark-bg p-4 rounded border border-gray-700 text-sm text-gray-200 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {scene.generatedPrompts[scene.generatedPrompts.length - 1]}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Paste this prompt into Claude, Midjourney, or your preferred AI image tool.
          </p>
        </div>
      )}
    </div>
  )
}

function PanelSlot({
  panel,
  panelIndex,
  characters,
  onAddCharacter,
  onRemoveCharacter,
  onUpdatePanel,
}: {
  panel: ComposerPanel
  panelIndex: number
  characters: CharacterNode[]
  onAddCharacter: (charId: string) => void
  onRemoveCharacter: (charId: string) => void
  onUpdatePanel: (updates: Partial<ComposerPanel>) => void
}) {
  return (
    <div className="border-2 border-neon-cyan/30 rounded-lg p-4 bg-dark-surface hover:border-neon-cyan/50 transition-colors">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-neon-cyan uppercase">
          Panel {panelIndex + 1}
        </span>
        <span className="text-xs text-gray-500">
          {panel.characters.length} character{panel.characters.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Panel Canvas Area */}
      <div className="aspect-[3/4] bg-dark-bg border border-dashed border-neon-cyan/20 rounded mb-4 flex flex-col items-center justify-center p-3">
        {panel.characters.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {panel.characters.map((char) => (
              <div
                key={char.id}
                className="px-2 py-1 bg-neon-cyan/20 border border-neon-cyan/50 rounded text-xs text-neon-cyan flex items-center gap-1"
              >
                {char.name}
                <button
                  onClick={() => onRemoveCharacter(char.id)}
                  className="text-neon-pink hover:text-white ml-1"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">Add characters below</p>
        )}
      </div>

      {/* Character Selector */}
      <div className="space-y-3">
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAddCharacter(e.target.value)
              e.target.value = ''
            }
          }}
          className="w-full text-sm px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-gray-200 focus:outline-none focus:border-neon-cyan"
        >
          <option value="">+ Add character...</option>
          {characters
            .filter((c) => !panel.characters.find((pc) => pc.id === c.id))
            .map((char) => (
              <option key={char.id} value={char.id}>
                {char.name} {char.fighterType?.[0] ? `(${char.fighterType[0]})` : ''}
              </option>
            ))}
        </select>

        <input
          type="text"
          value={panel.dialogue || ''}
          onChange={(e) => onUpdatePanel({ dialogue: e.target.value })}
          placeholder="Dialogue..."
          className="w-full text-sm px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-gray-200 focus:outline-none focus:border-neon-cyan"
        />

        <input
          type="text"
          value={panel.action || ''}
          onChange={(e) => onUpdatePanel({ action: e.target.value })}
          placeholder="Action / camera angle..."
          className="w-full text-sm px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-gray-200 focus:outline-none focus:border-neon-cyan"
        />

        <input
          type="text"
          value={panel.setting || ''}
          onChange={(e) => onUpdatePanel({ setting: e.target.value })}
          placeholder="Panel-specific setting (optional)..."
          className="w-full text-sm px-3 py-2 bg-dark-elevated border border-neon-cyan/30 rounded text-gray-200 focus:outline-none focus:border-neon-cyan"
        />
      </div>
    </div>
  )
}
