// Bracket management utility functions and constants

// Sport data configurations
export const sportsData = [
  { value: 'boxing-male', label: 'Boxing (Male)' },
  { value: 'boxing-female', label: 'Boxing (Female)' },
  { value: 'bjj-male', label: 'Brazilian Jiu-Jitsu (Male)' },
  { value: 'bjj-female', label: 'Brazilian Jiu-Jitsu (Female)' },
  { value: 'kickboxing-male', label: 'Kickboxing (Male)' },
  { value: 'kickboxing-female', label: 'Kickboxing (Female)' },
  { value: 'mma-male', label: 'MMA (Male)' },
  { value: 'mma-female', label: 'MMA (Female)' },
  { value: 'muay-thai-male', label: 'Muay Thai (Male)' },
  { value: 'muay-thai-female', label: 'Muay Thai (Female)' },
  { value: 'point-sparring-male', label: 'Point Sparring (Male)' },
  { value: 'point-sparring-female', label: 'Point Sparring (Female)' },
  { value: 'wrestling-male', label: 'Wrestling (Male)' },
  { value: 'wrestling-female', label: 'Wrestling (Female)' },
]

export const disciplineData = [
  { value: 'no-gi', label: 'No gi' },
  { value: 'gi', label: 'Gi' },
]

export const titleData = [
  { value: 'world-championship', label: 'World Championship' },
  { value: 'continental-championship', label: 'Continental Championship' },
  { value: 'national-championship', label: 'National Championship' },
  { value: 'multi-state-championship', label: 'Multi-State Championship' },
  { value: 'state-championship', label: 'State Championship' },
  { value: 'multi-county-championship', label: 'Multi-County Championship' },
  { value: 'tribal-championship', label: 'Tribal Championship' },
  { value: 'county-championship', label: 'County Championship' },
  { value: 'promotion-title', label: 'Promotion Title' },
  { value: 'metro-championship', label: 'Metro Championship' },
  { value: 'city-championship', label: 'City Championship' },
  { value: 'local-championship', label: 'Local Championship' },
]

export const bracketRuleData = [
  {
    value: 'standard-single-elimination',
    label: 'Standard Single Elimination',
  },
  { value: 'iska-single-elimination', label: 'ISKA Single Elimination' },
]

export const bracketStatusData = [
  { value: 'undefined', label: 'Undefined' },
  { value: 'not-ready-yet', label: 'Not Ready Yet' },
  { value: 'open', label: 'Open' },
  {
    value: 'closed-to-new-participants',
    label: 'Closed To New Participants',
  },
  { value: 'started', label: 'Started' },
  { value: 'completed', label: 'Completed' },
]

export const proClassData = [
  { value: 'amateur', label: 'Amateur' },
  { value: 'professional', label: 'Professional' },
]

export const bracketCriteriaData = [
  { value: 'none', label: 'None – N/A' },
  { value: 'novice', label: 'Novice' },
  { value: 'open-a-class', label: 'Open A-Class' },
  { value: 'open-b-class', label: 'Open B-Class' },
  { value: 'open-c-class', label: 'Open C-Class' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

// Youth weight classes (Boys/Girls)
export const youthWeightClasses = [
  {
    value: 'junior-atomweight',
    label: 'Junior Atomweight (50.1 – 55.0)',
    min: 50.1,
    max: 55.0,
  },
  {
    value: 'junior-flyweight',
    label: 'Junior Flyweight (55.1 – 60.0)',
    min: 55.1,
    max: 60.0,
  },
  {
    value: 'junior-bantamweight',
    label: 'Junior Bantamweight (60.1 – 65.0)',
    min: 60.1,
    max: 65.0,
  },
  {
    value: 'junior-featherweight',
    label: 'Junior Featherweight (65.1 – 70.0)',
    min: 65.1,
    max: 70.0,
  },
  {
    value: 'junior-lightweight',
    label: 'Junior Lightweight (70.1 – 75.0)',
    min: 70.1,
    max: 75.0,
  },
  {
    value: 'junior-welterweight',
    label: 'Junior Welterweight (75.1 – 80.0)',
    min: 75.1,
    max: 80.0,
  },
  {
    value: 'junior-middleweight',
    label: 'Junior Middleweight (80.1 – 85.0)',
    min: 80.1,
    max: 85.0,
  },
  {
    value: 'junior-light-heavyweight',
    label: 'Junior Light Heavyweight (85.1 – 90.0)',
    min: 85.1,
    max: 90.0,
  },
  {
    value: 'junior-cruiserweight',
    label: 'Junior Cruiserweight (90.1 – 95.0)',
    min: 90.1,
    max: 95.0,
  },
  {
    value: 'junior-heavyweight',
    label: 'Junior Heavyweight (95.1 – 100.0)',
    min: 95.1,
    max: 100.0,
  },
  {
    value: 'pinweight',
    label: 'Pinweight (100.1 – 104.0)',
    min: 100.1,
    max: 104.0,
  },
  {
    value: 'strawweight-youth',
    label: 'Strawweight (104.1 – 108.0)',
    min: 104.1,
    max: 108.0,
  },
  {
    value: 'atomweight-youth',
    label: 'Atomweight (108.1 – 112.0)',
    min: 108.1,
    max: 112.0,
  },
  {
    value: 'flyweight-youth',
    label: 'Flyweight (112.1 – 117.0)',
    min: 112.1,
    max: 117.0,
  },
  {
    value: 'bantamweight-youth',
    label: 'Bantamweight (117.1 – 122.0)',
    min: 117.1,
    max: 122.0,
  },
  {
    value: 'featherweight-youth',
    label: 'Featherweight (122.1 – 127.0)',
    min: 122.1,
    max: 127.0,
  },
  {
    value: 'lightweight-youth',
    label: 'Lightweight (127.1 – 132.0)',
    min: 127.1,
    max: 132.0,
  },
  {
    value: 'super-lightweight-youth',
    label: 'Super Lightweight (132.1 – 137.0)',
    min: 132.1,
    max: 137.0,
  },
  {
    value: 'light-welterweight-youth',
    label: 'Light Welterweight (137.1 – 142.0)',
    min: 137.1,
    max: 142.0,
  },
  {
    value: 'welterweight-youth',
    label: 'Welterweight (142.1 – 147.0)',
    min: 142.1,
    max: 147.0,
  },
  {
    value: 'super-welterweight-youth',
    label: 'Super Welterweight (147.1 – 153.0)',
    min: 147.1,
    max: 153.0,
  },
  {
    value: 'light-middleweight-youth',
    label: 'Light Middleweight (153.1 – 159.0)',
    min: 153.1,
    max: 159.0,
  },
  {
    value: 'middleweight-youth',
    label: 'Middleweight (159.1 – 165.0)',
    min: 159.1,
    max: 165.0,
  },
  {
    value: 'super-middleweight-youth',
    label: 'Super Middleweight (165.1 – 172.0)',
    min: 165.1,
    max: 172.0,
  },
  {
    value: 'light-heavyweight-youth',
    label: 'Light Heavyweight (172.1 – 179.0)',
    min: 172.1,
    max: 179.0,
  },
  {
    value: 'light-cruiserweight-youth',
    label: 'Light Cruiserweight (179.1 – 186.0)',
    min: 179.1,
    max: 186.0,
  },
  {
    value: 'cruiserweight-youth',
    label: 'Cruiserweight (186.1 – 195.0)',
    min: 186.1,
    max: 195.0,
  },
  {
    value: 'super-cruiserweight-youth',
    label: 'Super Cruiserweight (195.1 – 215.0)',
    min: 195.1,
    max: 215.0,
  },
  {
    value: 'heavyweight-youth',
    label: 'Heavyweight (215.1 – 235.0)',
    min: 215.1,
    max: 235.0,
  },
  {
    value: 'super-heavyweight-youth',
    label: 'Super Heavyweight (235.1 – 999.0)',
    min: 235.1,
    max: 999.0,
  },
]

// Adult weight classes (Men, Senior Men, Women, Senior Women)
export const adultWeightClasses = [
  {
    value: 'strawweight-adult',
    label: 'Strawweight (35.1 – 108.0)',
    min: 35.1,
    max: 108.0,
  },
  {
    value: 'atomweight-adult',
    label: 'Atomweight (108.1 – 112.0)',
    min: 108.1,
    max: 112.0,
  },
  {
    value: 'flyweight-adult',
    label: 'Flyweight (112.1 – 117.0)',
    min: 112.1,
    max: 117.0,
  },
  {
    value: 'bantamweight-adult',
    label: 'Bantamweight (117.1 – 122.0)',
    min: 117.1,
    max: 122.0,
  },
  {
    value: 'featherweight-adult',
    label: 'Featherweight (122.1 – 127.0)',
    min: 122.1,
    max: 127.0,
  },
  {
    value: 'lightweight-adult',
    label: 'Lightweight (127.1 – 132.0)',
    min: 127.1,
    max: 132.0,
  },
  {
    value: 'super-lightweight-adult',
    label: 'Super Lightweight (132.1 – 137.0)',
    min: 132.1,
    max: 137.0,
  },
  {
    value: 'light-welterweight-adult',
    label: 'Light Welterweight (137.1 – 142.0)',
    min: 137.1,
    max: 142.0,
  },
  {
    value: 'welterweight-adult',
    label: 'Welterweight (142.1 – 147.0)',
    min: 142.1,
    max: 147.0,
  },
  {
    value: 'super-welterweight-adult',
    label: 'Super Welterweight (147.1 – 153.0)',
    min: 147.1,
    max: 153.0,
  },
  {
    value: 'light-middleweight-adult',
    label: 'Light Middleweight (153.1 – 159.0)',
    min: 153.1,
    max: 159.0,
  },
  {
    value: 'middleweight-adult',
    label: 'Middleweight (159.1 – 165.0)',
    min: 159.1,
    max: 165.0,
  },
  {
    value: 'super-middleweight-adult',
    label: 'Super Middleweight (165.1 – 172.0)',
    min: 165.1,
    max: 172.0,
  },
  {
    value: 'cruiserweight-adult',
    label: 'Cruiserweight (172.1 – 185.0)',
    min: 172.1,
    max: 185.0,
  },
  {
    value: 'super-cruiserweight-adult',
    label: 'Super Cruiserweight (185.1 – 215.0)',
    min: 185.1,
    max: 215.0,
  },
  {
    value: 'heavyweight-adult',
    label: 'Heavyweight (215.1 – 235.0)',
    min: 215.1,
    max: 235.0,
  },
  {
    value: 'super-heavyweight-adult',
    label: 'Super Heavyweight (235.1 – 999.0)',
    min: 235.1,
    max: 999.0,
  },
]

// Combined weight classes for lookup
export const allWeightClasses = [...youthWeightClasses, ...adultWeightClasses]

// Helper functions for bracket management

// Get age classes based on sport selection
export const getAgeClasses = (sport) => {
  if (!sport) return []

  const isMale = sport.includes('Male') && !sport.includes('Female')
  const isFemale = sport.includes('Female')

  if (isMale) {
    return [
      { value: 'boys', label: 'Boys' },
      { value: 'men', label: 'Men' },
      { value: 'senior-men', label: 'Senior Men' },
    ]
  } else if (isFemale) {
    return [
      { value: 'girls', label: 'Girls' },
      { value: 'women', label: 'Women' },
      { value: 'senior-women', label: 'Senior Women' },
    ]
  }

  return []
}

// Get weight classes based on age class selection
export const getWeightClasses = (ageClass) => {
  if (!ageClass) return []

  if (ageClass === 'boys' || ageClass === 'girls') {
    return youthWeightClasses
  } else if (
    ['men', 'senior-men', 'women', 'senior-women'].includes(ageClass)
  ) {
    return adultWeightClasses
  }

  return []
}

// Get disciplines based on sport selection
export const getDisciplines = (sport) => {
  if (!sport) return []

  if (sport.includes('bjj')) {
    return disciplineData
  }

  return []
}

// Map weight class object to dropdown value
export const mapWeightClassToDisplay = (weightClassValue, weightClassObj) => {
  if (
    !weightClassValue &&
    weightClassObj &&
    weightClassObj.min &&
    weightClassObj.max
  ) {
    const match = allWeightClasses.find(
      (wc) =>
        Math.abs(wc.min - weightClassObj.min) < 0.1 &&
        Math.abs(wc.max - weightClassObj.max) < 0.1
    )
    return match ? match.value : ''
  }
  return weightClassValue || ''
}

// Map old age class format to new format
export const mapAgeClassFromOld = (oldAgeClass) => {
  const ageClassMap = {
    Youth: 'boys',
    Junior: 'boys',
    Adult: 'men',
    Senior: 'senior-men',
  }
  return ageClassMap[oldAgeClass] || oldAgeClass || ''
}

// Convert weight class dropdown value back to API object format
export const getWeightClassObject = (weightClassValue) => {
  if (!weightClassValue) return null

  const match = allWeightClasses.find((wc) => wc.value === weightClassValue)
  return match ? { min: match.min, max: match.max, unit: 'lbs' } : null
}

// Map old sport format to new format
export const mapOldSportToNew = (sport) => {
  if (!sport) return ''

  const sportMapping = {
    kickboxing: 'kickboxing-male',
    boxing: 'boxing-male',
    mma: 'mma-male',
    'muay thai': 'muay-thai-male',
    'brazilian jiu-jitsu': 'bjj-male',
    bjj: 'bjj-male',
    'point sparring': 'point-sparring-male',
    wrestling: 'wrestling-male',
  }

  return sportMapping[sport.toLowerCase()] || sport
}

// Map old age class to new format with sport context
export const mapOldAgeClassToNew = (ageClass, sport) => {
  if (!ageClass) return ''

  const isFemale = sport && sport.includes('female')

  const ageMapping = {
    youth: isFemale ? 'girls' : 'boys',
    junior: isFemale ? 'girls' : 'boys',
    adult: isFemale ? 'women' : 'men',
    senior: isFemale ? 'senior-women' : 'senior-men',
    boys: 'boys',
    girls: 'girls',
    men: 'men',
    women: 'women',
    'senior men': 'senior-men',
    'senior women': 'senior-women',
  }

  return ageMapping[ageClass.toLowerCase()] || ageClass
}

// Map old weight class object to new dropdown value with age class context
export const mapOldWeightClassToNew = (weightClass, ageClass) => {
  if (!weightClass || !weightClass.min || !weightClass.max) return ''

  const isYouth = ageClass === 'boys' || ageClass === 'girls'
  const weightClasses = isYouth ? youthWeightClasses : adultWeightClasses

  const match = weightClasses.find(
    (wc) =>
      Math.abs(wc.min - weightClass.min) < 0.1 &&
      Math.abs(wc.max - weightClass.max) < 0.1
  )

  return match ? match.value : ''
}

// Generate bracket name from title components
export const generateBracketName = (
  ageClass,
  bracketCriteria,
  weightClass,
  ageClassOptions,
  weightClassOptions
) => {
  const parts = []

  // 1. Age Class (with apostrophe for possessive)
  if (ageClass) {
    const ageLabel =
      ageClassOptions.find((a) => a.value === ageClass)?.label || ''
    parts.push(ageLabel)
  }

  // 2. Bracket Criteria
  if (bracketCriteria && bracketCriteria !== 'none') {
    const criteriaLabel =
      bracketCriteriaData.find((c) => c.value === bracketCriteria)?.label || ''
    const cleanCriteria = criteriaLabel.split(' –')[0].split(' - ')[0]
    parts.push(cleanCriteria)
  }

  // 3. Weight Class (with full range)
  if (weightClass) {
    const weightOption = weightClassOptions.find((w) => w.value === weightClass)
    if (weightOption) {
      parts.push(weightOption.label)
    }
  }

  return parts.filter(Boolean).join(' ')
}
