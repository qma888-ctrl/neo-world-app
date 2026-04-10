import { Client } from '@notionhq/client'
import {
  Character,
  CharacterNode,
  WorldRule,
  Chapter,
  Series,
} from './types'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Database IDs from env
const CHARS_DB = process.env.NOTION_CHARACTERS_DB_ID!
const WORLD_DB = process.env.NOTION_WORLD_BUILDING_DB_ID!
const CHAPTERS_DB = process.env.NOTION_CHAPTERS_DB_ID!
const SERIES_DB = process.env.NOTION_SERIES_DB_ID!

// ============ CHARACTER FUNCTIONS ============

export async function fetchCharacters(): Promise<CharacterNode[]> {
  try {
    const response = await notion.databases.query({
      database_id: CHARS_DB,
    })

    return response.results
      .map((page: any) => ({
        id: page.id,
        name: getTitleProperty(page.properties['Character Full Name']),
        series: getSelectProperty(page.properties['Series']),
        affiliations: getMultiSelectProperty(page.properties['Affiliations']),
        fighterType: getMultiSelectProperty(page.properties['Fighter Type']),
        age: getTextProperty(page.properties['Age']),
        height: getTextProperty(page.properties['Height']),
        specialty: getTextProperty(page.properties['Genre']),
        eplScores: parseEplScores(getMultiSelectProperty(page.properties["EPL Score's"])),
        specialAbilities: getMultiSelectProperty(page.properties['Special Ability']),
        imageUrl: getFileProperty(page.properties['Character Full Name']),
        pageUrl: page.url,
      }))
      // Filter out archived characters
      .filter((char: CharacterNode) => !char.name.startsWith('[ARCHIVED]'))
  } catch (error) {
    console.error('Error fetching characters:', error)
    return []
  }
}

export async function fetchCharacterById(id: string): Promise<Character | null> {
  try {
    const page = await notion.pages.retrieve({
      page_id: id,
    })

    const blockMap = await notion.blocks.children.list({
      block_id: id,
    })

    const content = blockMap.results
      .map((block: any) => extractBlockText(block))
      .filter(Boolean)
      .join('\n')

    return {
      id: page.id,
      name: getTitleProperty(page.properties['Character Full Name']),
      series: getSelectProperty(page.properties['Series']),
      affiliations: getMultiSelectProperty(page.properties['Affiliations']),
      fighterType: getMultiSelectProperty(page.properties['Fighter Type']),
      eplScores: parseEplScores(getMultiSelectProperty(page.properties["EPL Score's"])),
      aliases: extractAliasesFromContent(content),
      age: getTextProperty(page.properties['Age']),
      height: getTextProperty(page.properties['Height']),
      birthday: getTextProperty(page.properties['Birthday']),
      genre: getTextProperty(page.properties['Genre']),
      origin: getTextProperty(page.properties['Origine']),
      sexuality: getTextProperty(page.properties['Sexuallity']),
      romanticInterests: getTextProperty(
        page.properties['Romantic Interests']
      ),
      family: getTextProperty(page.properties['Family']),
      fightingStyle: getTextProperty(page.properties['Fighting Style']),
      specialAbilities: getMultiSelectProperty(
        page.properties['Special Ability']
      ),
      backstory: extractSectionFromContent(content, 'backstory'),
      personality: extractSectionFromContent(content, 'personality'),
      motivations: extractSectionFromContent(content, 'motivations'),
      weapons: extractSectionFromContent(content, 'weapons'),
      references: extractImagesFromContent(content),
      pageUrl: page.url,
    }
  } catch (error) {
    console.error(`Error fetching character ${id}:`, error)
    return null
  }
}

export async function updateCharacter(
  id: string,
  updates: Partial<Character>
): Promise<boolean> {
  try {
    await notion.pages.update({
      page_id: id,
      properties: {
        ...(updates.age && { Age: { rich_text: [{ text: { content: updates.age } }] } }),
        ...(updates.height && {
          Height: { rich_text: [{ text: { content: updates.height } }] },
        }),
        ...(updates.fightingStyle && {
          'Fighting Style': {
            rich_text: [{ text: { content: updates.fightingStyle } }],
          },
        }),
      },
    })
    return true
  } catch (error) {
    console.error(`Error updating character ${id}:`, error)
    return false
  }
}

// ============ WORLD BUILDING FUNCTIONS ============

export async function fetchWorldRules(): Promise<WorldRule[]> {
  try {
    const response = await notion.databases.query({
      database_id: WORLD_DB,
    })

    return response.results.map((page: any) => ({
      id: page.id,
      name: getTextProperty(page.properties['Name']),
      tags: getMultiSelectProperty(page.properties['Tags']),
      content: '',
      created: page.created_time,
      pageUrl: page.url,
    }))
  } catch (error) {
    console.error('Error fetching world rules:', error)
    return []
  }
}

export async function fetchWorldRuleById(id: string): Promise<WorldRule | null> {
  try {
    const page = await notion.pages.retrieve({
      page_id: id,
    })

    const blockMap = await notion.blocks.children.list({
      block_id: id,
    })

    const content = blockMap.results
      .map((block: any) => extractBlockText(block))
      .filter(Boolean)
      .join('\n')

    return {
      id: page.id,
      name: getTextProperty(page.properties['Name']),
      tags: getMultiSelectProperty(page.properties['Tags']),
      content,
      created: page.created_time,
      pageUrl: page.url,
    }
  } catch (error) {
    console.error(`Error fetching world rule ${id}:`, error)
    return null
  }
}

export async function updateWorldRule(
  id: string,
  updates: Partial<WorldRule>
): Promise<boolean> {
  try {
    await notion.pages.update({
      page_id: id,
      properties: {
        ...(updates.name && {
          Name: { title: [{ text: { content: updates.name } }] },
        }),
      },
    })
    return true
  } catch (error) {
    console.error(`Error updating world rule ${id}:`, error)
    return false
  }
}

// ============ CHAPTER FUNCTIONS ============

export async function fetchChapters(): Promise<Chapter[]> {
  try {
    const response = await notion.databases.query({
      database_id: CHAPTERS_DB,
      filter: {
        property: 'Book',
        select: {
          does_not_equal: 'Archive',
        },
      },
      sorts: [
        {
          property: 'Release Order',
          direction: 'ascending',
        },
      ],
    })

    return response.results.map((page: any) => ({
      id: page.id,
      title: getTitleProperty(page.properties['Episode']),
      series: getSelectProperty(page.properties['Series']),
      book: getSelectProperty(page.properties['Book']),
      status: getStatusProperty(page.properties['Status']),
      drawingStatus: getStatusProperty(page.properties['Drawing status']),
      schedule: getDateProperty(page.properties['Schedule']),
      releaseOrder: getNumberProperty(page.properties['Release Order']),
      characterIds: [],
      pageUrl: page.url,
    }))
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return []
  }
}

export async function fetchChapterById(id: string): Promise<Chapter | null> {
  try {
    const page = await notion.pages.retrieve({
      page_id: id,
    })

    const blockMap = await notion.blocks.children.list({
      block_id: id,
    })

    const content = blockMap.results
      .map((block: any) => extractBlockText(block))
      .filter(Boolean)
      .join('\n')

    return {
      id: page.id,
      title: getTitleProperty(page.properties['Episode']),
      series: getSelectProperty(page.properties['Series']),
      book: getSelectProperty(page.properties['Book']),
      status: getStatusProperty(page.properties['Status']),
      drawingStatus: getStatusProperty(page.properties['Drawing status']),
      schedule: getDateProperty(page.properties['Schedule']),
      releaseOrder: getNumberProperty(page.properties['Release Order']),
      content,
      characterIds: [],
      pageUrl: page.url,
    }
  } catch (error) {
    console.error(`Error fetching chapter ${id}:`, error)
    return null
  }
}

// ============ SERIES FUNCTIONS ============

export async function fetchSeries(): Promise<Series[]> {
  try {
    const response = await notion.databases.query({
      database_id: SERIES_DB,
    })

    return response.results.map((page: any) => ({
      id: page.id,
      name: getTextProperty(page.properties['Name']),
      description: getTextProperty(page.properties['Description']),
      genres: getMultiSelectProperty(page.properties['Genres']),
      status: getStatusProperty(page.properties['Status']),
      platforms: getMultiSelectProperty(page.properties['Platform']),
      mature: getSelectProperty(page.properties['Mature']) === 'Yes',
      pageUrl: page.url,
    }))
  } catch (error) {
    console.error('Error fetching series:', error)
    return []
  }
}

// ============ PROPERTY EXTRACTION HELPERS ============

function getTextProperty(prop: any): string {
  if (!prop || prop.type !== 'rich_text') return ''
  return prop.rich_text.map((t: any) => t.plain_text).join('')
}

function getTitleProperty(prop: any): string {
  if (!prop || prop.type !== 'title') return ''
  return prop.title.map((t: any) => t.plain_text).join('')
}

function getSelectProperty(prop: any): string {
  if (!prop || prop.type !== 'select') return ''
  return prop.select?.name || ''
}

function getStatusProperty(prop: any): string {
  if (!prop || prop.type !== 'status') return ''
  return prop.status?.name || ''
}

function getMultiSelectProperty(prop: any): string[] {
  if (!prop || prop.type !== 'multi_select') return []
  return prop.multi_select.map((s: any) => s.name)
}

function getDateProperty(prop: any): string | undefined {
  if (!prop || prop.type !== 'date') return undefined
  return prop.date?.start
}

function getNumberProperty(prop: any): number | undefined {
  if (!prop || prop.type !== 'number') return undefined
  return prop.number
}

function getFileProperty(prop: any): string | undefined {
  if (!prop) return undefined
  // Check for files in relation or as attachments
  if (prop.type === 'files' && prop.files.length > 0) {
    return prop.files[0].file?.url || prop.files[0].external?.url
  }
  return undefined
}

// ============ CONTENT EXTRACTION HELPERS ============

function extractBlockText(block: any): string {
  let text = ''

  switch (block.type) {
    case 'paragraph':
      text = block.paragraph.rich_text.map((t: any) => t.plain_text).join('')
      break
    case 'heading_1':
      text = block.heading_1.rich_text.map((t: any) => t.plain_text).join('')
      break
    case 'heading_2':
      text = block.heading_2.rich_text.map((t: any) => t.plain_text).join('')
      break
    case 'heading_3':
      text = block.heading_3.rich_text.map((t: any) => t.plain_text).join('')
      break
    case 'bulleted_list_item':
      text = block.bulleted_list_item.rich_text
        .map((t: any) => t.plain_text)
        .join('')
      break
    case 'numbered_list_item':
      text = block.numbered_list_item.rich_text
        .map((t: any) => t.plain_text)
        .join('')
      break
    case 'image':
      text = block.image.caption
        ? block.image.caption.map((t: any) => t.plain_text).join('')
        : ''
      break
  }

  return text.trim()
}

function extractSectionFromContent(
  content: string,
  sectionName: string
): string | undefined {
  const regex = new RegExp(
    `${sectionName}:?\\s*([^\\n]*(?:\\n(?!\\n)[^\\n]*)*)`,
    'im'
  )
  const match = content.match(regex)
  return match ? match[1].trim() : undefined
}

function extractAliasesFromContent(content: string): string[] {
  const aliasMatch = content.match(/aliases?:?\s*([^\n]+)/im)
  if (aliasMatch) {
    return aliasMatch[1]
      .split(/[,;]/)
      .map((a) => a.trim())
      .filter(Boolean)
  }
  return []
}

function extractImagesFromContent(content: string): string[] {
  // Extract image URLs or descriptions from content
  const imageMatches = content.match(/!\[.*?\]\((.*?)\)/g) || []
  return imageMatches.map((m) => m.replace(/!\[.*?\]\((.*?)\)/, '$1'))
}

function parseEplScores(scores: string[]): Record<string, number> {
  const result: Record<string, number> = {}
  scores.forEach((score) => {
    // Format: "Season 1: 91"
    const match = score.match(/^(.+?):\s*(\d+)$/)
    if (match) {
      result[match[1].trim()] = parseInt(match[2], 10)
    }
  })
  return result
}
