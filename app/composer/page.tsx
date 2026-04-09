'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ComposerScene } from '@/lib/types'
import { ChevronLeft, Plus, Trash2, Wand2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yyxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
  } = useStore()

  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState(0)

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
    setCurrentScene(newScene.id)
  }

  const currentScene = composerScenes.find((s) => s.id === currentSceneId)

  const handleUpdatePanel = (panelIndex: number, field: string, value: string) => {
    if (!currentScene) return
    const updatedPanels = [...currentScene.panels]
    updatedPanels[panelIndex] = { ...updatedPanels[panelIndex], [field]: value }
    updateScene(currentScene.id, { panels: updatedPanels })
  }

  const generatePrompt = (panelIndex: number) => {
    if (!currentScene) return
    const panel = currentScene.panels[panelIndex]
    const charNames = panel.characters.map((id) => {
      const char = characters.find((c) => c.id === id)
      return char ? char.name : 'Unknown'
    }).join(', ')
    const prompt = `${currentScene.artStyle || 'manga style'}, ${panel.setting}, ${panel.mood} mood, ${panel.timeOfDay}, characters: ${charNames || 'none'}, action: ${panel.action}, dialogue: "${panel.dialogue}", ${currentScene.colorPalette || 'vibrant colors'}`
    handleUpdatePanel(panelIndex, 'imagePrompt', prompt.trim())
  }

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

        {/* Scene List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={handleNewScene}
            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-neon-cyan/50 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Scene
          </button>

          {composerScenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setCurrentScene(scene.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                scene.id === currentSceneId
                  ? 'bg-neon-magenta/20 border-neon-magenta/50 text-white'
                  : 'bg-dark-elevated border-gray-700 text-gray-300 hover:border-neon-cyan/30'
              }`}
            >
              <p className="font-semibold text-sm">{scene.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {scene.panels.length} panels
              </p>
            </button>
          ))}
        </div>

        {/* Chapter Link */}
        <div className="border-t border-neon-cyan/20 p-4">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">{chapters.length} chapters loaded</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentScene ? (
          <>
            {/* Scene Header */}
            <div className="bg-dark-surface border-b border-neon-cyan/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={currentScene.title}
                  onChange={(e) => updateScene(currentScene.id, { title: e.target.value })}
                  className="text-xl font-bold bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan rounded px-2"
                />
                <span className="text-xs text-gray-400">
                  {currentScene.panels.length} panels
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    deleteScene(currentScene.id)
                    setCurrentScene(composerScenes.length > 1 ? composerScenes[0].id : '')
                  }}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel Tabs */}
            <div className="bg-dark-surface border-b border-neon-cyan/20 px-4 flex gap-1">
              {currentScene.panels.map((panel, idx) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(idx)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    idx === activePanel
                      ? 'border-neon-magenta text-neon-magenta'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Panel {idx + 1}
                </button>
              ))}
            </div>

            {/* Panel Editor */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentScene.panels[activePanel] && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">Setting</label>
                      <input
                        type="text"
                        value={currentScene.panels[activePanel].setting}
                        onChange={(e) => handleUpdatePanel(activePanel, 'setting', e.target.value)}
                        placeholder="e.g., Dark alley at night"
                        className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">Mood</label>
                      <input
                        type="text"
                        value={currentScene.panels[activePanel].mood}
                        onChange={(e) => handleUpdatePanel(activePanel, 'mood', e.target.value)}
                        placeholder="e.g., Tense, mysterious"
                        className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">Time of Day</label>
                      <input
                        type="text"
                        value={currentScene.panels[activePanel].timeOfDay}
                        onChange={(e) => handleUpdatePanel(activePanel, 'timeOfDay', e.target.value)}
                        placeholder="e.g., Midnight, golden hour"
                        className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase mb-1">Characters</label>
                      <select
                        multiple
                        value={currentScene.panels[activePanel].characters}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, (o) => o.value)
                          handleUpdatePanel(activePanel, 'characters', selected as any)
                        }}
                        className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none h-20"
                      >
                        {characters.map((char) => (
                          <option key={char.id} value={char.id}>{char.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Action</label>
                    <textarea
                      value={currentScene.panels[activePanel].action}
                      onChange={(e) => handleUpdatePanel(activePanel, 'action', e.target.value)}
                      placeholder="Describe what's happening in this panel..."
                      rows={3}
                      className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Dialogue</label>
                    <textarea
                      value={currentScene.panels[activePanel].dialogue}
                      onChange={(e) => handleUpdatePanel(activePanel, 'dialogue', e.target.value)}
                      placeholder="Character dialogue for this panel..."
                      rows={2}
                      className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none"
                    />
                  </div>

                  {/* Generate Prompt */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs text-gray-400 uppercase">Generated Image Prompt</label>
                      <button
                        onClick={() => generatePrompt(activePanel)}
                        className="flex items-center gap-1 px-3 py-1 bg-neon-magenta/20 border border-neon-magenta/50 rounded text-xs text-neon-magenta hover:bg-neon-magenta/30 transition-colors"
                      >
                        <Wand2 className="w-3 h-3" />
                        Generate
                      </button>
                    </div>
                    <textarea
                      value={currentScene.panels[activePanel].imagePrompt}
                      onChange={(e) => handleUpdatePanel(activePanel, 'imagePrompt', e.target.value)}
                      placeholder="Click Generate to create an image prompt from panel details..."
                      rows={4}
                      className="w-full p-2 bg-dark-elevated border border-gray-600 rounded text-sm text-white focus:border-neon-cyan focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Wand2 className="w-12 h-12 text-neon-magenta/40 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-400 mb-2">No Scene Selected</h2>
              <p className="text-sm text-gray-500 mb-6">Create a new scene or select one from the sidebar</p>
              <button
                onClick={handleNewScene}
                className="px-6 py-2 bg-neon-magenta text-dark-bg font-semibold rounded-lg hover:bg-neon-magenta/80 transition-colors"
              >
                Create First Scene
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

