const fs = require('fs');
let code = fs.readFileSync('src/app/features/student/packages/package-details/package-details.component.ts', 'utf8');

const methods = 
  loadFeedback(classroomId: string): void {
    this.feedbackLoading.set(true);
    this.enrollmentService.getClassroomFeedback(classroomId, 1, 5).subscribe({
      next: (res) => {
        this.feedbackSummary.set(res);
        this.feedbackLoading.set(false);
      },
      error: () => {
        this.feedbackLoading.set(false);
      }
    });
  }

  onSubmitFeedback(): void {
    const pkgId = this.pkg()?.id;
    if (!pkgId) return;

    if (this.feedbackRating < 1 || this.feedbackRating > 5) {
      this.toast.warning('تنبيه', 'يرجى تقييم الباقة من 1 إلى 5.');
      return;
    }

    this.submittingFeedback.set(true);
    this.enrollmentService.submitClassroomFeedback(pkgId, {
      rating: this.feedbackRating,
      comment: this.feedbackComment
    }).subscribe({
      next: (res) => {
        this.submittingFeedback.set(false);
        if (res.success) {
          this.toast.success('نجاح', 'تم إرسال تقييمك بنجاح. شكراً لك!');
          this.feedbackRating = 5;
          this.feedbackComment = '';
          this.loadFeedback(pkgId);
        } else {
          this.toast.error('خطأ', res.message || 'حدث خطأ أثناء إرسال التقييم.');
        }
      },
      error: () => {
        this.submittingFeedback.set(false);
        this.toast.error('خطأ', 'حدث خطأ أثناء الاتصال بالخادم.');
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i + 1);
  }
;

code = code.replace(/}\r?\n?$/, methods + '\n}\n');
fs.writeFileSync('src/app/features/student/packages/package-details/package-details.component.ts', code);
