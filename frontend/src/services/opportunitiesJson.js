import { STORAGE_KEYS } from '../constants';

const API_BASE_URL = 'http://localhost:5001';

export const getAuthHeaders = () => {
  try {
    const authData = localStorage.getItem(STORAGE_KEYS.auth);
    if (authData) {
      const { token } = JSON.parse(authData);
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
  } catch {
    // Fallback to old token key for compatibility
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

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
  try {
    const res = await fetch(`${API_BASE_URL}/opportunities`, {
      cache: 'no-store',
      headers: getAuthHeaders()
    })
    if (!res.ok) {
      if (res.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem(STORAGE_KEYS.auth);
        return { error: 'Authentication required. Please log in as faculty for full access, or try refreshing.' }
      }
      return { error: `Failed to fetch opportunities: ${res.status}` }
    }
    const data = await res.json()
    return { data: Array.isArray(data) ? data.map(normalize) : [] }
  } catch (error) {
    return { error: error.message }
  }
}

export async function createOpportunity(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      return { error: 'Failed to create opportunity' }
    }
    const data = await res.json()
    return { data: normalize(data) }
  } catch (error) {
    return { error: error.message }
  }
}

export async function updateOpportunity(id, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      return { error: 'Failed to update opportunity' }
    }
    const data = await res.json()
    return { data: normalize(data) }
  } catch (error) {
    return { error: error.message }
  }
}

export async function deleteOpportunity(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!res.ok) {
      return { error: 'Failed to delete opportunity' }
    }
    return { data: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function getOpportunityById(id) {
  try {
    const response = await getOpportunities();
    if (response?.data) {
      const opp = response.data.find(item => item._id === id || item.id === id);
      return opp ? { data: opp } : { error: 'Opportunity not found' };
    }
    return { error: 'Failed to fetch opportunities' };
  } catch (error) {
    return { error: error.message };
  }
}
