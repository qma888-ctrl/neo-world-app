'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { NodeGraph } from '@/components/NodeGraph'
import { CharacterPanel } from '@/components/CharacterPanel'
import { WorldRulePanel } from '@/components/WorldRulePanel'
import { ChapterPanel } from '@/components/ChapterPanel'
import { useStore } from '@/lib/store'
import axios from 'axios'

export default function Home() {
  const { setCharacters, setWorldRules, setChapters, setSeries } = useStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [charsRes, worldRes, chaptersRes, seriesRes] = await Promise.all([
          axios.get('/api/characters'),
          axios.get('/api/world'),
          axios.get('/api/chapters'),
          axios.get('/api/series'),
        ])
        setCharacters(charsRes.data)
        setWorldRules(worldRes.data)
        setChapters(chaptersRes.data)
        setSeries(seriesRes.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [setCharacters, setWorldRules, setChapters, setSeries])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top banner — lab-notebook heading */}
      <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex items-center justify-between px-6 pt-4">
          <div className="pointer-events-auto">
            <h1
              className="font-mono text-[11px] tracking-[0.4em] text-[#d4b483]"
              style={{ textShadow: '0 0 10px rgba(212,180,131,0.45)' }}
            >
              ◈ NEO // CORTEX MAP ◈
            </h1>
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#d4b483]/60 mt-0.5">
              living archive · breathing world
            </p>
          </div>
        </div>
      </header>

      {/* Main brain-region grid */}
      <div className="flex w-full h-full gap-4 p-4 pt-14">
        {/* FRONTAL CORTEX — sidebar */}
        <div className="brain-zone brain-zone-delay-1 w-80 flex-shrink-0 overflow-hidden">
          <span className="zone-label">Frontal Cortex</span>
          <Sidebar />
        </div>

        {/* NEURAL CORTEX — central node graph */}
        <div className="brain-zone brain-zone-delay-2 neural-cortex flex-1 overflow-hidden">
          <span className="zone-label">Neural Cortex · Synaptic Web</span>
          <NodeGraph />
        </div>
      </div>

      {/* Detail slide-outs */}
      <CharacterPanel />
      <WorldRulePanel />
      <ChapterPanel />
    </div>
  )
}
