// src/app/core/services/student-weakness.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  StudentWeaknessItem,
  WeaknessDto,
  ResolvedWeaknessDto,
  WeaknessHistoryDto,
} from '../models/student-weakness.model';

function normalizeActive(w: WeaknessDto, idx: number): StudentWeaknessItem {
  return {
    id: w.id || `weak_${idx}`,
    topicName: w.topicName || `موضوع ${idx + 1}`,
    // Backend does not send a subject per weakness (see NOTES_FOR_BACKEND_DEVS.md) —
    // this is a placeholder, not a real value.
    subjectName: 'عام',
    proficiencyPercent: Math.max(0, Math.min(100, Math.round(w.currentProficiencyPercent ?? 0))),
  };
}

function normalizeResolved(w: ResolvedWeaknessDto, idx: number): StudentWeaknessItem {
  return {
    id: w.id || `weak_${idx}`,
    topicName: w.topicName || `موضوع ${idx + 1}`,
    subjectName: 'عام',
    proficiencyPercent: Math.max(0, Math.min(100, Math.round(w.currentProficiencyPercent ?? 0))),
    delta: w.delta,
    previousProficiencyPercent: w.previousProficiencyPercent,
  };
}

/**
 * Stateful weakness tracking — replaces the old approach of scraping `weakTopics[]`
 * out of analytics/performance-report responses or fabricating them from wrong
 * exam answers. The backend persists a StudentWeakness row per topic with a live
 * proficiency score and Active/Resolved status, with a full history log exposed
 * via GET /weaknesses/{id}/history (confirmed live 2026-08-24 — previously
 * filed as a gap in BACKEND_ISSUES_REPORT.md item 1).
 */
@Injectable({ providedIn: 'root' })
export class StudentWeaknessService extends ApiBaseService {
  readonly isLoadingActive = signal<boolean>(false);
  readonly isLoadingResolved = signal<boolean>(false);
  readonly activeWeaknesses = signal<readonly StudentWeaknessItem[]>([]);
  readonly resolvedWeaknesses = signal<readonly StudentWeaknessItem[]>([]);

  /** GET /api/v1/weaknesses/active */
  loadActiveWeaknesses(): Observable<readonly StudentWeaknessItem[]> {
    this.isLoadingActive.set(true);
    return this.get<WeaknessDto[]>('/weaknesses/active').pipe(
      map((res) => (Array.isArray(res) ? res : []).map(normalizeActive)),
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

  /** GET /api/v1/weaknesses/resolved */
  loadResolvedWeaknesses(): Observable<readonly StudentWeaknessItem[]> {
    this.isLoadingResolved.set(true);
    return this.get<ResolvedWeaknessDto[]>('/weaknesses/resolved').pipe(
      map((res) => (Array.isArray(res) ? res : []).map(normalizeResolved)),
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

  /** GET /api/v1/weaknesses/{id}/history — the progression log for one weakness (40% -> 60% -> 90%). */
  getWeaknessHistory(weaknessId: string): Observable<WeaknessHistoryDto[]> {
    return this.get<WeaknessHistoryDto[]>(`/weaknesses/${weaknessId}/history`).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([])),
    );
  }
}
