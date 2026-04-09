'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Chapter } from '@/lib/types'
import axios from 'axios'
import { X } from 'lucide-react'

export function ChapterPanel({ id }: { id: string }) {
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/chapters/${id}`)
        setChapter(res.data)
      } catch (error) {
        console.error('Failed to fetch chapter:', error)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!chapter) return <div>Not found</div>

  return (
    <div className="text-white">
      <h3>{chapter.title}</h3>
      <p>{chapter.content}</p>
    </div>
  )
}
