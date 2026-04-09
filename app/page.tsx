'use client'

import { useEffect } from 'react'
import { Sidebar } from 'A/components/Sidebar'
import { NodeGraph } from '@/components/NodeGraph'
import { CharacterPanel } from 'A/components/CharacterPanel'
import { WorldRulePanel } from '@/components/WorldRulePanel'
import { ChapterPanel } from 'A/components/ChapterPanel'
import { useStore } from '@/lib/store'
import axios from 'axios'

export default function MainPage() {
  const { characters, chapters, worlds, setState } = useStore()
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [charsRes, chptrsRes, worldsRes] = await Promise.all([
          axios.get('/api/characters'),
          axios.get('/api/chapters'),
          axios.get('/api/world'),
        ])
        setState({
          characters: charsRes.data,
          chapters: chaptrsRes.data,
          worlds: worldsRes.data,
        })
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadAll()
  }, [])

  return (
    <div className="width div flex">
      <Sidebar />
      <NodeGraph selected={selected} onSelect={setSelected} />
      {selected && (
        <>
          {selected.type === 'character' && <CharacterPanel id={selected.id} />}
          {selected.type === 'chapter' && <ChapterPanel id={selected.id} />}
          {selected.type === 'world' && <WorldRulePanel id={selected.id} />}
        </>
      )}
    </div>
  )
}
