'use client'

import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { Search, Filter, Download, Plus } from 'lucide-react'
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

  const [allAffiliations, setAllAffiliations] = useState<Set<string>>(
    new Set()
  )
  const [allFighterTypes, setAllFighterTypes] = useState<Set<string>>(
    new Set()
  )

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

    const matchesSeries = !selectedSeriesFilter || char.series === selectedSeriesFilter

    const matchesAffiliation =
      !selectedAffiliationFilter ||
      char.affiliations.includes(selectedAffiliationFilter)

    const matchesFighterType =
      !selectedFighterTypeFilter ||
      char.fighterType.includes(selectedFighterTypeFilter)

    return (
      matchesSearch &&
      matchesSeries &&
      matchesAffiliation &&
      matchesFighterType
    )
  })

  return (
    <div className="w-80 bg-dark-surface border-r border-neon-cyan/20 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-neon-cyan/20 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neon-cyan">NEO</h1>
          <div className="flex gap-2">
            <Link
              href="/composer"
              className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
              title="Panel Composer"
            >
              <Plus className="w-5 h-5 text-neon-magenta" />
            </Link>
            <button className="p-2 hover:bg-dark-elevated rounded-lg transition-colors" title="Export">
              <Download className="w-5 h-5 text-neon-green" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-neon-cyan/30 rounded-lg text-sm focus:outline-none focus:border-neon-cyan"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-neon-cyan/20 p-4 space-y-4 overflow-y-auto flex-1 max-h-[40vh]">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Series
          </p>
          <select
            value={selectedSeriesFilter || ''}
            onChange={(e) =>
              setSelectedSeriesFilter(e.target.value || null)
            }
            className="w-full text-sm"
          >
            <option value="">All Series</option>
            {series.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Affiliation
          </p>
          <select
            value={selectedAffiliationFilter || ''}
            onChange={(e) =>
              setSelectedAffiliationFilter(e.target.value || null)
            }
            className="w-full text-sm"
          >
            <option value="">All Affiliations</option>
            {Array.from(allAffiliations).sort().map((aff) => (
              <option key={aff} value={aff}>
                {aff}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Fighter Type
          </p>
          <select
            value={selectedFighterTypeFilter || ''}
            onChange={(e) =>
              setSelectedFighterTypeFilter(e.target.value || null)
            }
            className="w-full text-sm"
          >
            <option value="">All Types</option>
            {Array.from(allFighterTypes).sort().map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Character List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Characters ({filteredCharacters.length})
          </p>

          {filteredCharacters.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No characters match filters
            </p>
          ) : (
            filteredCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => selectCharacter(char.id)}
                className="w-full text-left p-3 rounded-lg bg-dark-elevated hover:bg-dark-elevated/80 border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all group"
              >
                <p className="font-semibold text-neon-cyan group-hover:text-white text-sm">
                  {char.name}
                </p>
                <p className="text-xs text-gray-400">
                  {char.series}
                  {char.fighterType[0] && ` • ${char.fighterType[0]}`}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
