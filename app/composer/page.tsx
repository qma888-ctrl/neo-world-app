'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ComposerPanel, ComposerScene, CharacterNode, Chapter } from '@/lib/types'
import { ChevronLeft, Plus, Trash2, Copy, Wand2, Check, BookOpen } from 'lucide-react'
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
