const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function normalize(item) {
  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    announcementHeading: item.announcementHeading || '',
    type: item.type || 'Internship',
    description: item.description || '',
    eligibilityCriteria: item.eligibilityCriteria || '',
    lastDate: item.lastDate || '',
    department: item.department || 'Broadcast to All',
    applicationLink: item.applicationLink || '',
    createdBy: item.createdBy || 'unknown',
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
    status: item.status || '',
  }
}

export async function getOpportunities() {
  const res = await fetch(`${API_BASE_URL}/opportunities`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch opportunities')
  const data = await res.json()
  return Array.isArray(data) ? data.map(normalize) : []
}

export async function createOpportunity(payload) {
  const res = await fetch(`${API_BASE_URL}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create opportunity')
  const data = await res.json()
  return normalize(data)
}

export async function updateOpportunity(id, payload) {
  const res = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update opportunity')
  const data = await res.json()
  return normalize(data)
}

export async function deleteOpportunity(id) {
  const res = await fetch(`${API_BASE_URL}/opportunities/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete opportunity')
}
