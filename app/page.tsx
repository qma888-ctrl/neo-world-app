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
        const [charsRes, worldRes, chaptersRes, seriesRes] = await Promise.all(
          [
            axios.get('/api/characters'),
            axios.get('/api/world'),
            axios.get('/api/chapters'),
            axios.get('/api/series'),
          ]
        )

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
    <div className="flex w-full h-screen bg-dark-bg">
      <Sidebar />
      <NodeGraph />
      <CharacterPanel />
      <WorldRulePanel />
      <ChapterPanel />
    </div>
  )
}
