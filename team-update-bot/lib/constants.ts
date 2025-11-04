export const TEAM_MEMBERS = ['ilan', 'midlaj', 'hysam', 'alan'] as const
export type TeamMember = typeof TEAM_MEMBERS[number]

export const MEMBER_COLORS = {
  ilan: 'bg-blue-500',
  midlaj: 'bg-green-500', 
  hysam: 'bg-purple-500',
  alan: 'bg-orange-500'
} as const

export const MEMBER_DISPLAY_NAMES = {
  ilan: 'Ilan',
  midlaj: 'Midlaj',
  hysam: 'Hysam', 
  alan: 'Alan'
} as const
