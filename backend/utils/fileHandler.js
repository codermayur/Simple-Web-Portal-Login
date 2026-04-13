import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, '../data/opportunities.json')

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, '[]', 'utf-8')
  }
}

export async function readOpportunitiesFile() {
  await ensureDataFile()
  const fileContent = await fs.readFile(DATA_FILE, 'utf-8')
  try {
    const parsed = JSON.parse(fileContent)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function writeOpportunitiesFile(opportunities) {
  await ensureDataFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(opportunities, null, 2), 'utf-8')
}
