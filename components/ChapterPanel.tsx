'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Chapter } from '@/lib/types'
import { X, ExternalLink } from 'lucide-react'
import axios from 'axios'

export function ChapterPanel() {
  const { selectedChapterId, showChapterPanel, selectChapter } = useStore()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedChapterId && showChapterPanel) {
      fetchChapter()
    }
  }, [selectedChapterId, showChapterPanel])

  const fetchChapter = async () => {
    if (!selectedChapterId) return
    setLoading(true)
    try {
      const response = await axios.get(`/api/chapters/${selectedChapterId}`)
      setChapter(response.data)
    } catch (error) {
      console.error('Failed to fetch chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!showChapterPanel || !chapter) {
    return null
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-dark-elevated border-l border-neon-green/30 animate-slideIn overflow-y-auto z-40">
      {/* Header */}
      <div className="sticky top-0 bg-dark-elevated border-b border-neon-green/30 p-6 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-neon-green mb-2">
            {chapter.title}
          </h2>
          <p className="text-sm text-gray-400">{chapter.series}</p>
        </div>
        <button
          onClick={() => selectChapter(null)}
          className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Info */}
        <section>
          <h3 className="text-lg font-semibold text-neon-magenta mb-4">
            Status
          </h3>
          <div className="space-y-3">
            {chapter.book && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Book</p>
                <p className="text-gray-200">{chapter.book}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 uppercase">Publication Status</p>
              <span className="inline-block px-3 py-1 bg-neon-green/20 border border-neon-green/50 rounded-full text-xs text-neon-green mt-2">
                {chapter.status}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Drawing Status</p>
              <span className="inline-block px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/50 rounded-full text-xs text-neon-cyan mt-2">
                {chapter.drawingStatus}
              </span>
            </div>

            {chapter.schedule && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Scheduled</p>
                <p className="text-gray-200">
                  {new Date(chapter.schedule).toLocaleDateString()}
                </p>
              </div>
            )}

            {chapter.releaseOrder && (
              <div>
                <p className="text-xs text-gray-400 uppercase">Release Order</p>
                <p className="text-gray-200">#{chapter.releaseOrder}</p>
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        {chapter.content && (
          <section>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">
              Content
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 text-sm whitespace-pre-wrap">
                {chapter.content}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-dark-elevated border-t border-neon-green/30 p-6">
        <a
          href={chapter.pageUrl}
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
