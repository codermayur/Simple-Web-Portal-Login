import express from 'express'
import { readOpportunitiesFile, writeOpportunitiesFile } from '../utils/fileHandler.js'

const router = express.Router()

function nowIso() {
  return new Date().toISOString()
}

function computeStatus(lastDate) {
  const today = new Date().toISOString().slice(0, 10)
  return lastDate < today ? 'archived' : 'active'
}

router.get('/', async (_req, res) => {
  try {
    const opportunities = await readOpportunitiesFile()
    res.json(opportunities)
  } catch (error) {
    res.status(500).json({ message: 'Failed to read opportunities', error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {}
    if (!payload.announcementHeading || !payload.lastDate || !payload.applicationLink) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const opportunities = await readOpportunitiesFile()
    const newOpportunity = {
      _id: crypto.randomUUID(),
      announcementHeading: payload.announcementHeading,
      type: payload.type || 'Internship',
      description: payload.description || '',
      eligibilityCriteria: payload.eligibilityCriteria || '',
      lastDate: payload.lastDate,
      department: payload.department || 'Broadcast to All',
      applicationLink: payload.applicationLink,
      createdBy: payload.createdBy || 'unknown',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      status: payload.status || computeStatus(payload.lastDate),
    }

    opportunities.push(newOpportunity)
    await writeOpportunitiesFile(opportunities)
    return res.status(201).json(newOpportunity)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create opportunity', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const payload = req.body || {}
    const opportunities = await readOpportunitiesFile()
    const index = opportunities.findIndex((item) => item._id === id)

    if (index === -1) return res.status(404).json({ message: 'Opportunity not found' })

    const current = opportunities[index]
    const next = {
      ...current,
      ...payload,
      _id: current._id,
      updatedAt: nowIso(),
    }
    if (next.lastDate) {
      next.status = computeStatus(next.lastDate)
    }

    opportunities[index] = next
    await writeOpportunitiesFile(opportunities)
    return res.json(next)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update opportunity', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const opportunities = await readOpportunitiesFile()
    const filtered = opportunities.filter((item) => item._id !== id)
    if (filtered.length === opportunities.length) {
      return res.status(404).json({ message: 'Opportunity not found' })
    }
    await writeOpportunitiesFile(filtered)
    return res.status(204).send()
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete opportunity', error: error.message })
  }
})

export default router
