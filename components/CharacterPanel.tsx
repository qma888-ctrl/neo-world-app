'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Character } from '@/lib/types'
import { X, ExternalLink, Save } from 'lucide-react'
import axios from 'axios'

export function CharacterPanel() {
  const { selectedCharacterId, showCharacterPanel, selectCharacter } = useStore()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Character>>({})

  useEffect(() => {
    if (selectedCharacterId && showCharacterPanel) {
      fetchCharacter()
    }
  }, [selectedCharacterId, showCharacterPanel])

  const fetchCharacter = async () => {
    if (!selectedCharacterId) return
    setLoading(true)
    try {
      const response = await axios.get(
        `/api/characters/${selectedCharacterId}`
      )
      setCharacter(response.data)
      setEditData(response.data)
    } catch (error) {
      console.error('Failed to fetch character:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedCharacterId) return
    try {
      const response = await axios.put(
        `/api/characters/${selectedCharacterId}`,
        editData
      )
      setCharacter(response.data)
      setEditing(false)
    } catch (error) {
      console.error('Failed to save character:', error)
    }
  }

  if (!showCharacterPanel || !character) {
    return null
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-dark-elevated border-l border-neon-cyan/30 animate-slideIn overflow-y-auto z-40">
      {/* Header */}
      <div className="sticky top-0 bg-dark-elevated border-b border-neon-cyan/30 p-6 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-cyan mb-2">
            {character.name}
          </h2>
          <p className="text-sm text-gray-400">{character.series}</p>
        </div>
        <button
          onClick={() => selectCharacter(null)}
          className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <section>
          <h3 className="text-lg font-semibold text-neon-magenta mb-4">
            Basic Information
          </h3>
          <div className="space-y-3">
            {character.aliases && character.aliases.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Aliases</p>
                <p className="text-gray-200">{character.aliases.join(', ')}</p>
              </div>
            )}

            {character.age && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Age</p>
                {editing ? (
                  <input
                    type="text"
                    value={editData.age || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, age: e.target.value })
                    }
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-200">{character.age}</p>
                )}
              </div>
            )}

            {character.height && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Height</p>
                {editing ? (
                  <input
                    type="text"
                    value={editData.height || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, height: e.target.value })
                    }
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-200">{character.height}</p>
                )}
              </div>
            )}

            {character.birthday && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Birthday</p>
                <p className="text-gray-200">{character.birthday}</p>
              </div>
            )}

            {character.origin && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Origin</p>
                <p className="text-gray-200">{character.origin}</p>
              </div>
            )}
          </div>
        </section>

        {/* Affiliations & Tags */}
        {character.affiliations && character.affiliations.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Affiliations
            </h3>
            <div className="flex flex-wrap gap-2">
              {character.affiliations.map((aff) => (
                <span
                  key={aff}
                  className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/50 rounded-full text-xs text-neon-cyan"
                >
                  {aff}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Fighter Type */}
        {character.fighterType && character.fighterType.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Fighter Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {character.fighterType.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded-full text-xs text-neon-purple"
                >
                  {type}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Fighting Style */}
        {character.fightingStyle && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Fighting Style
            </h3>
            {editing ? (
              <textarea
                value={editData.fightingStyle || ''}
                onChange={(e) =>
                  setEditData({ ...editData, fightingStyle: e.target.value })
                }
                className="w-full h-20"
              />
            ) : (
              <p className="text-gray-200 text-sm">{character.fightingStyle}</p>
            )}
          </section>
        )}

        {/* Special Abilities */}
        {character.specialAbilities && character.specialAbilities.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Special Abilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {character.specialAbilities.map((ability) => (
                <span
                  key={ability}
                  className="px-3 py-1 bg-neon-green/20 border border-neon-green/50 rounded-full text-xs text-neon-green"
                >
                  {ability}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Personality */}
        {character.personality && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Personality
            </h3>
            <p className="text-gray-200 text-sm">{character.personality}</p>
          </section>
        )}

        {/* Backstory */}
        {character.backstory && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Backstory
            </h3>
            <p className="text-gray-200 text-sm">{character.backstory}</p>
          </section>
        )}

        {/* Weapons */}
        {character.weapons && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Weapons
            </h3>
            <p className="text-gray-200 text-sm">{character.weapons}</p>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-dark-elevated border-t border-neon-cyan/30 p-6 space-y-2">
        {editing && (
          <button
            onClick={handleSave}
            className="w-full bg-neon-cyan text-dark-bg font-semibold py-2 rounded-lg hover:bg-neon-cyan/80 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
        <button
          onClick={() => (editing ? setEditing(false) : setEditing(true))}
          className="w-full border border-neon-cyan text-neon-cyan py-2 rounded-lg hover:bg-neon-cyan/10 transition-colors"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <a
          href={character.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border border-neon-magenta text-neon-magenta py-2 rounded-lg hover:bg-neon-magenta/10 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View in Notion
        </a>
      </div>
    </div>
  )
}
