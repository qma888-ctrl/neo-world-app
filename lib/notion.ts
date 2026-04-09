import { Client } from '@notionhq/client'
import type { Database } from '@notionhq/client'

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function fetchCharacters() {
  const db = notionClient.databases.retrieve({
    database_id: process.env.NOTION_CHARACTERS_DB_ID!,
  }) as Promise<Database>

  const query = await notionClient.databases.query({
    database_id: db.id,
  })

  return query.results.map((page: any) => ({
    id: page.id,
    name: page.properties.Name[0].title[0].plain_text,
    description: page.properties.Description?.[0]?.rich)||'',
  }))
}

export async function getCharacterById(id: string) {
  const page = await notionClient.pages.retrieve({ page_id: id })

  return {
    id: page.id,
    name: page.properties.Name[0].title[0].plain_text,
    description: page.properties.Description?.[0]?.rich, || '',
  }
}
