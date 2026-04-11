'use client'

import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { Search, Download, Plus } from 'lucide-react'
import Link from 'next/link'

export function Sidebar() {
  const {
    characters,
    series,
    searchQuery,
    setSearchQuery,
    selectCharacter,
    selectedSeriesFilter,
    setSelectedSeriesFilter,
    selectedAffiliationFilter,
    setSelectedAffiliationFilter,
    selectedFighterTypeFilter,
    setSelectedFighterTypeFilter,
  } = useStore()

  const [allAffiliations, setAllAffiliations] = useState<Set<string>>(new Set())
  const [allFighterTypes, setAllFighterTypes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const affs = new Set<string>()
    const types = new Set<string>()
    characters.forEach((char) => {
      char.affiliations?.forEach((aff) => affs.add(aff))
      char.fighterType?.forEach((type) => types.add(type))
    })
    setAllAffiliations(affs)
    setAllFighterTypes(types)
  }, [characters])

  const filteredCharacters = characters.filter((char) => {
    const matchesSearch =
      !searchQuery ||
      char.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeries =
      !selectedSeriesFilter || char.series === selectedSeriesFilter
    const matchesAffiliation =
      !selectedAffiliationFilter ||
      char.affiliations.includes(selectedAffiliationFilter)
    const matchesFighterType =
      !selectedFighterTypeFilter ||
      char.fighterType.includes(selectedFighterTypeFilter)
    return (
      matchesSearch && matchesSeries && matchesAffiliation && matchesFighterType
    )
  })

  return (
    <div className="w-full h-full flex flex-col relative z-[1] p-5 pt-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1
          className="text-3xl font-bold text-[#00f0ff]"
          style={{ textShadow: '0 0 14px rgba(0,240,255,0.6)' }}
        >
          NEO
        </h1>
        <div className="flex gap-2">
          <Link
            href="/composer"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Panel Composer"
          >
            <Plus className="w-5 h-5 text-[#ff00ff]" />
          </Link>
          <button
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Export"
          >
            <Download className="w-5 h-5 text-[#39ff14]" />
          </button>
        </div>
      </div>

      {/* Sensory Intake — Search */}
      <div className="zone-sublabel">Sensory Intake</div>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search characters…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm"
        />
      </div>

      {/* Filter Lobe */}
      <div className="zone-sublabel">Filter Lobe</div>
      <div className="space-y-3 mb-5">
        <select
          value={selectedSeriesFilter || ''}
          onChange={(e) => setSelectedSeriesFilter(e.target.value || null)}
          className="w-full text-sm"
        >
          <option value="">All Series</option>
          {series.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={selectedAffiliationFilter || ''}
          onChange={(e) => setSelectedAffiliationFilter(e.target.value || null)}
          className="w-full text-sm"
        >
          <option value="">All Affiliations</option>
          {Array.from(allAffiliations)
            .sort()
            .map((aff) => (
              <option key={aff} value={aff}>
                {aff}
              </option>
            ))}
        </select>
        <select
          value={selectedFighterTypeFilter || ''}
          onChange={(e) =>
            setSelectedFighterTypeFilter(e.target.value || null)
          }
          className="w-full text-sm"
        >
          <option value="">All Types</option>
          {Array.from(allFighterTypes)
            .sort()
            .map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
      </div>

      {/* Hippocampus — Characters */}
      <div className="zone-sublabel">
        Hippocampus · Characters ({filteredCharacters.length})
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredCharacters.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8 font-mono tracking-wider">
            ◌ no signal ◌
          </p>
        ) : (
          filteredCharacters.map((char) => (
            <button
              key={char.id}
              onClick={() => selectCharacter(char.id)}
              className="w-full text-left p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-[#00f0ff]/20 hover:border-[#00f0ff]/60 transition-all group"
              style={{ boxShadow: 'inset 0 0 20px rgba(0,240,255,0.03)' }}
            >
              <p className="font-semibold text-[#00f0ff] group-hover:text-white text-sm">
                {char.name}
              </p>
              <p className="text-xs text-gray-400">
                {char.series}
                {char.fighterType[0] && ` · ${char.fighterType[0]}`}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
