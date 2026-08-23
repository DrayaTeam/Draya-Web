// src/app/features/teacher/dashboard/components/teacher-submissions-chart/teacher-submissions-chart.component.ts
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SubmissionsChartMeta } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-submissions-chart',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-submissions-chart.component.html',
  styleUrl: './teacher-submissions-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherSubmissionsChartComponent {
  readonly chartMeta = input.required<SubmissionsChartMeta>();
  readonly timeRange = input.required<'week' | 'month' | 'quarter'>();
  readonly rangeChange = output<'week' | 'month' | 'quarter'>();

  // ─── SVG Math Logic ────────────────────────────────────────────────────────

  // X range: starts at 60, ends at 560 for 6 points (gap of 100).
  // For dynamic N points, we distribute evenly between X=60 and X=600.
  private getXCoordinates(count: number): number[] {
    if (count <= 1) return [60];
    const xStart = 60;
    const xEnd = 620; // Max width inside grid
    const gap = (xEnd - xStart) / (count - 1);
    return Array.from({ length: count }, (_, i) => xStart + i * gap);
  }

  // Y range: 180 (bottom = 0%) to 20 (top = 100%). Height = 160.
  private getY(percentage: number): number {
    const clamped = Math.max(0, Math.min(100, percentage));
    return 180 - (clamped / 100) * 160;
  }

  // ─── Computed SVG Paths ──────────────────────────────────────────────────

  readonly submissionsPolygon = computed(() => {
    const points = this.chartMeta().chartPoints;
    if (!points || points.length === 0) return '';

    const maxSubmissions = Math.max(1, ...points.map((p) => p.submissionsCount));
    const xs = this.getXCoordinates(points.length);

    // Build path points
    let pointsStr = '';
    points.forEach((p, i) => {
      const percentage = (p.submissionsCount / maxSubmissions) * 100;
      const y = this.getY(percentage);
      pointsStr += `${xs[i]},${y} `;
    });

    // Close the polygon to the bottom
    const firstX = xs[0];
    const lastX = xs[points.length - 1];

    // If only 1 point, draw a flat rectangle to make it visible
    if (points.length === 1) {
      return `60,${this.getY((points[0].submissionsCount / maxSubmissions) * 100)} 620,${this.getY((points[0].submissionsCount / maxSubmissions) * 100)} 620,180 60,180`;
    }

    pointsStr += `${lastX},180 ${firstX},180`;

    return pointsStr;
  });

  readonly submissionsPath = computed(() => {
    const points = this.chartMeta().chartPoints;
    if (!points || points.length === 0) return '';

    const maxSubmissions = Math.max(1, ...points.map((p) => p.submissionsCount));

    if (points.length === 1) {
      const y = this.getY((points[0].submissionsCount / maxSubmissions) * 100);
      return `M 60 ${y} L 620 ${y}`;
    }

    const xs = this.getXCoordinates(points.length);
    let d = '';
    points.forEach((p, i) => {
      const percentage = (p.submissionsCount / maxSubmissions) * 100;
      const y = this.getY(percentage);
      d += i === 0 ? `M ${xs[i]} ${y} ` : `L ${xs[i]} ${y} `;
    });

    return d.trim();
  });

  readonly averagePath = computed(() => {
    const points = this.chartMeta().chartPoints;
    if (!points || points.length === 0) return '';

    const MAX_SCORE = 5;

    if (points.length === 1) {
      const y = this.getY((points[0].averageScore / MAX_SCORE) * 100);
      return `M 60 ${y} L 620 ${y}`;
    }

    const xs = this.getXCoordinates(points.length);
    let d = '';
    points.forEach((p, i) => {
      const percentage = (p.averageScore / MAX_SCORE) * 100;
      const y = this.getY(percentage);
      d += i === 0 ? `M ${xs[i]} ${y} ` : `L ${xs[i]} ${y} `;
    });

    return d.trim();
  });

  readonly submissionCircles = computed(() => {
    const points = this.chartMeta().chartPoints;
    if (!points || points.length === 0) return [];

    const maxSubmissions = Math.max(1, ...points.map((p) => p.submissionsCount));
    const xs = this.getXCoordinates(points.length);

    return points.map((p, i) => {
      const percentage = (p.submissionsCount / maxSubmissions) * 100;
      return { x: xs[i], y: this.getY(percentage) };
    });
  });

  readonly averageCircles = computed(() => {
    const points = this.chartMeta().chartPoints;
    if (!points || points.length === 0) return [];

    const MAX_SCORE = 5;
    const xs = this.getXCoordinates(points.length);

    return points.map((p, i) => {
      const percentage = (p.averageScore / MAX_SCORE) * 100;
      return { x: xs[i], y: this.getY(percentage) };
    });
  });
}
