export function getOpportunityDepartments(opportunity) {
  if (Array.isArray(opportunity.departments) && opportunity.departments.length > 0) {
    return opportunity.departments.map((department) => department.trim()).filter(Boolean)
  }

  if (typeof opportunity.department === 'string') {
    return opportunity.department
      .split(',')
      .map((department) => department.trim())
      .filter(Boolean)
  }

  return []
}

export function matchesDepartmentFilter(opportunity, selectedDepartment) {
  if (selectedDepartment === 'Broadcast to All') return true

  const departments = getOpportunityDepartments(opportunity)
  return departments.includes('Broadcast to All') || departments.includes(selectedDepartment)
}
