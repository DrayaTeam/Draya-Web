// src/app/core/models/student-weakness.model.ts
//
// GET /api/v1/Weaknesses/active and GET /api/v1/Weaknesses/resolved both return a
// bare `200 OK` with no schema in swagger, so this DTO is modeled tolerantly from
// the backend hand-off docs rather than a typed contract — every field the backend
// hasn't confirmed is optional, and the service normalizes rather than trusting it.
export interface WeaknessDto {
  id?: string;
  topicName: string;
  subjectName?: string;
  /** Current proficiency score (0-100) for this topic, right now. */
  proficiencyPercent: number;
  status?: 'Active' | 'Resolved' | string;
  isActive?: boolean;
  /** Only present on resolved weaknesses per the hand-off doc — improvement since the weakness was first flagged. */
  delta?: number;
  previousProficiencyPercent?: number;
  exampleIncorrectAnswers?: string[];
  lastUpdatedAt?: string;
}

/** Normalized view-model the reports UI renders. */
export interface StudentWeaknessItem {
  readonly id: string;
  readonly topicName: string;
  readonly subjectName: string;
  readonly proficiencyPercent: number;
  readonly delta?: number;
  readonly previousProficiencyPercent?: number;
  readonly exampleIncorrectAnswers?: readonly string[];
}
