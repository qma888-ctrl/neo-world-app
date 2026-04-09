'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { WorldRule } from '@/lib/types'
import { X, ExternalLink, Save } from 'lucide-react'
import axios from 'axios'

export function WorldRulePanel() {
  const { selectedWorldRuleId, showWorldPanel, selectWorldRule } = useStore()
  const [rule, setRule] = useState<WorldRule | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<WorldRule>>({})

  useEffect(() => {
    if (selectedWorldRuleId && showWorldPanel) {
      fetchRule()
    }
  }, [selectedWorldRuleId, showWorldPanel])

  const fetchRule = async () => {
    if (!selectedWorldRuleId) return
    setLoading(true)
    try {
      const response = await axios.get(`/api/world/${selectedWorldRuleId}`)
      setRule(response.data)
      setEditData(response.data)
    } catch (error) {
      console.error('Failed to fetch world rule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedWorldRuleId) return
    try {
      const response = await axios.put(
        `/api/world/${selectedWorldRuleId}`,
        editData
      )
      setRule(response.data)
      setEditing(false)
    } catch (error) {
      console.error('Failed to save world rule:', error)
    }
  }

  if (!showWorldPanel || !rule) {
    return null
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-dark-elevated border-l border-neon-purple/30 animate-slideIn overflow-y-auto z-40">
      {/* Header */}
      <div className="sticky top-0 bg-dark-elevated border-b border-neon-purple/30 p-6 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-purple mb-2">
            {rule.name}
          </h2>
          <p className="text-sm text-gray-400">
            {new Date(rule.created).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => selectWorldRule(null)}
          className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Tags */}
        {rule.tags && rule.tags.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {rule.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded-full text-xs text-neon-purple"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Content */}
        <section>
          <h3 className="text-lg font-semibold text-neon-magenta mb-4">
            Details
          </h3>
          {editing ? (
            <textarea
              value={editData.content || ''}
              onChange={(e) =>
                setEditData({ ...editData, content: e.target.value })
              }
              className="w-full h-64 p-3 bg-dark-surface border border-gray-600 rounded text-gray-100"
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 text-sm whitespace-pre-wrap">
                {rule.content}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-dark-elevated border-t border-neon-purple/30 p-6 space-y-2">
        {editing && (
          <button
            onClick={handleSave}
            className="w-full bg-neon-purple text-dark-bg font-semibold py-2 rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
        <button
          onClick={() => (editing ? setEditing(false) : setEditing(true))}
          className="w-full border border-neon-purple text-neon-purple py-2 rounded-lg hover:bg-neon-purple/10 transition-colors"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <a
          href={rule.pageUrl}
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
