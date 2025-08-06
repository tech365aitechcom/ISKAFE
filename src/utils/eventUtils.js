export function getEventStatus(start, end) {
  const now = new Date()
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (now < startDate) {
    return 'Upcoming'
  } else if (now >= startDate && now <= endDate) {
    return 'Live'
  } else {
    return 'Closed'
  }
}

export async function fetchTournamentSettings(eventId) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    
    if (!API_BASE_URL) {
      console.error('API_BASE_URL not configured')
      throw new Error('API base URL not configured')
    }
    
    const url = `${API_BASE_URL}/tournament-setting/${eventId}`
    console.log('Fetching tournament settings from:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${response.statusText}`)
      throw new Error(`Failed to fetch tournament settings: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Tournament settings response:', data)
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.message || 'Failed to fetch tournament settings')
    }
  } catch (error) {
    console.error('Error fetching tournament settings:', error)
    // Return fallback values
    return {
      simpleFees: {
        fighterFee: 75,
        trainerFee: 75,
        currency: '$'
      }
    }
  }
}
