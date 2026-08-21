import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamHubService, GenerationProgressDto } from '../../services/exam-hub.service';
import { GenerationStatus } from '../../../../core/models/exam-generation.model';
import { ExamGenerationService } from '../../services/exam-generation.service';

@Component({
  selector: 'draya-generation-tracker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './generation-tracker.component.html',
  styleUrl: './generation-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerationTrackerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examHub = inject(ExamHubService);
  private readonly examGenService = inject(ExamGenerationService);

  readonly generationId = signal<string | null>(null);
  
  // Local state reflecting the progress
  readonly currentStatus = signal<GenerationStatus>(GenerationStatus.Pending);
  readonly errorMessage = signal<string | null>(null);
  
  // Expose the enum to the template
  readonly Status = GenerationStatus;

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Listen to hub progress updates
    effect(() => {
      const progress = this.examHub.progress();
      if (progress) {
        this.handleProgressUpdate(progress);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.generationId.set(id);
      this.startTracking(id);
    } else {
      this.router.navigate(['/teacher/exams/generate']);
    }
  }

  async startTracking(id: string): Promise<void> {
    await this.examHub.connect(id);
    
    // Setup fallback polling just in case SignalR fails or drops
    this.pollingInterval = setInterval(() => {
      this.pollProgress(id);
    }, 5000); // Poll every 5 seconds
  }

  private pollProgress(id: string): void {
    // If the hub is currently connected and we've recently got progress, we don't strictly need to poll, 
    // but polling is harmless and guarantees we don't hang if WebSocket silently drops.
    this.examGenService.getGenerationStatus(id).subscribe({
      next: (progress: GenerationProgressDto) => {
        this.handleProgressUpdate(progress);
      },
      error: (err) => {
        console.error('[Tracker] Polling error:', err);
        // Stop polling if the backend throws a 500 (Internal Server Error) or 404
        // to prevent console spamming if the endpoint isn't fully implemented or crashes.
        if (err?.status === 500 || err?.status === 404) {
          console.warn('[Tracker] Stopping fallback polling due to backend 500/404 error. Relying entirely on SignalR.');
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }
        }
      }
    });
  }

  private handleProgressUpdate(progress: GenerationProgressDto): void {
    this.currentStatus.set(progress.status);

    if (progress.status === GenerationStatus.Completed || progress.status === GenerationStatus.CompletedWithWarning) {
      this.cleanup();
      // Wait a moment for UX before navigating
      setTimeout(() => {
        const resolvedExamId =
          progress.examId || (progress as { ExamId?: string }).ExamId;
        if (resolvedExamId) {
          this.router.navigate(['/teacher/exams', resolvedExamId, 'review']);
        } else {
          this.router.navigate(['/teacher/exams']);
        }
      }, 1500);
    } else if (progress.status === GenerationStatus.DataUnavailable) {
      this.cleanup();
      this.errorMessage.set('السياق غير كافٍ. لم يتمكن الذكاء الاصطناعي من العثور على معلومات كافية في المواد المرفوعة لإنشاء هذا الامتحان.');
    } else if (progress.status === GenerationStatus.Failed) {
      this.cleanup();
      this.errorMessage.set('حدث خطأ في خدمة الذكاء الاصطناعي أثناء إنشاء الامتحان. يرجى المحاولة مرة أخرى.');
    }
  }

  private cleanup(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.examHub.disconnect();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
