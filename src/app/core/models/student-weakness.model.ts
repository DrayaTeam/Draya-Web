// src/app/core/models/student-weakness.model.ts
//
// Confirmed against the live swagger spec (http://draya-api.runasp.net/swagger/v1/swagger.json,
// 2026-08-24) — these are typed contracts now, not guesses. Notably, the backend does NOT
// send subjectName or exampleIncorrectAnswers on either shape, and the percent field is
// named currentProficiencyPercent (not proficiencyPercent) on the wire.

/** GET /api/v1/weaknesses/active — WeaknessDto[] */
export interface WeaknessDto {
  id: string;
  topicId: string;
  topicName: string;
  currentProficiencyPercent: number;
  lastUpdatedAt: string;
}

/** GET /api/v1/weaknesses/resolved — ResolvedWeaknessDto[] */
export interface ResolvedWeaknessDto {
  id: string;
  topicId: string;
  topicName: string;
  currentProficiencyPercent: number;
  previousProficiencyPercent: number;
  delta: number;
  lastUpdatedAt: string;
}

/** GET /api/v1/weaknesses/{id}/history — WeaknessHistoryDto[], the progression log behind one weakness. */
export interface WeaknessHistoryDto {
  historyId: string;
  previousProficiencyPercent: number;
  newProficiencyPercent: number;
  previousIsActive: boolean;
  newIsActive: boolean;
  createdAt: string;
  triggeredByAttemptId?: string | null;
}

/**
 * Normalized view-model the reports UI renders. subjectName has no backend
 * source at all right now (see NOTES_FOR_BACKEND_DEVS.md) and always falls
 * back to a generic label; exampleIncorrectAnswers is likewise never
 * populated from the wire — both are kept as optional so the UI degrades
 * rather than assuming data that doesn't exist.
 */
export interface StudentWeaknessItem {
  readonly id: string;
  readonly topicName: string;
  readonly subjectName: string;
  readonly proficiencyPercent: number;
  readonly delta?: number;
  readonly previousProficiencyPercent?: number;
  readonly exampleIncorrectAnswers?: readonly string[];
}
