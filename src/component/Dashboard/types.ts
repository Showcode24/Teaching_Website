export interface Job {
  id: string
  jobTitle: string
  jobDescription: string
  hourlyRate: string
  studyLevel: string
  sessionsPerWeek: string
  location: string
  skillsRequired: string
  status: string
  created_at: string
  appliedTutors?: string[]
  accepted_tutor_id: { id: string } | null
}

