// src/app/core/services/student-weakness.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { StudentWeaknessItem, WeaknessDto } from '../models/student-weakness.model';

function normalizeWeakness(w: WeaknessDto, idx: number): StudentWeaknessItem {
  return {
    id: w.id || `weak_${idx}`,
    topicName: w.topicName || `موضوع ${idx + 1}`,
    subjectName: w.subjectName || 'عام',
    proficiencyPercent: Math.round(w.proficiencyPercent ?? 0),
    delta: w.delta,
    previousProficiencyPercent: w.previousProficiencyPercent,
    exampleIncorrectAnswers: w.exampleIncorrectAnswers,
  };
}

/**
 * Stateful weakness tracking — replaces the old approach of scraping `weakTopics[]`
 * out of analytics/performance-report responses or fabricating them from wrong
 * exam answers. The backend now persists a StudentWeakness row per topic with a
 * live proficiency score and Active/Resolved status, with a full history log
 * behind it (see BACKEND_ISSUES_REPORT.md — history isn't exposed via any
 * endpoint yet, so no trend chart can be built from these two lists alone).
 */
@Injectable({ providedIn: 'root' })
export class StudentWeaknessService extends ApiBaseService {
  readonly isLoadingActive = signal<boolean>(false);
  readonly isLoadingResolved = signal<boolean>(false);
  readonly activeWeaknesses = signal<readonly StudentWeaknessItem[]>([]);
  readonly resolvedWeaknesses = signal<readonly StudentWeaknessItem[]>([]);

  /** GET /api/v1/Weaknesses/active */
  loadActiveWeaknesses(): Observable<readonly StudentWeaknessItem[]> {
    this.isLoadingActive.set(true);
    return this.get<WeaknessDto[]>('/Weaknesses/active').pipe(
      map((res) => (Array.isArray(res) ? res : []).map(normalizeWeakness)),
      tap((list) => {
        this.activeWeaknesses.set(list);
        this.isLoadingActive.set(false);
      }),
      catchError(() => {
        this.isLoadingActive.set(false);
        this.activeWeaknesses.set([]);
        return of([]);
      }),
    );
  }

  /** GET /api/v1/Weaknesses/resolved */
  loadResolvedWeaknesses(): Observable<readonly StudentWeaknessItem[]> {
    this.isLoadingResolved.set(true);
    return this.get<WeaknessDto[]>('/Weaknesses/resolved').pipe(
      map((res) => (Array.isArray(res) ? res : []).map(normalizeWeakness)),
      tap((list) => {
        this.resolvedWeaknesses.set(list);
        this.isLoadingResolved.set(false);
      }),
      catchError(() => {
        this.isLoadingResolved.set(false);
        this.resolvedWeaknesses.set([]);
        return of([]);
      }),
    );
  }
}
