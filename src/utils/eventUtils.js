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
