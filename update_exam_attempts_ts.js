const fs = require('fs');
const filePath = 'src/app/features/teacher/exams/exam-attempts/exam-attempts.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Add PaginationComponent import
content = content.replace(
  "import { StudentDetailsModalComponent } from '../../classrooms/classroom-detail/components/student-details-modal/student-details-modal.component';",
  "import { StudentDetailsModalComponent } from '../../classrooms/classroom-detail/components/student-details-modal/student-details-modal.component';\nimport { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';"
);

content = content.replace(
  "imports: [CommonModule, RouterLink, TableModule, StudentDetailsModalComponent],",
  "imports: [CommonModule, RouterLink, TableModule, StudentDetailsModalComponent, PaginationComponent],"
);

// Add pagination signals
content = content.replace(
  "readonly totalCount = signal<number>(0);",
  "readonly totalCount = signal<number>(0);\n  readonly pageNumber = signal<number>(1);\n  readonly pageSize = signal<number>(10);"
);

// update loadAttempts method
const oldLoadAttempts = "private loadAttempts(id: string): void {\n    this.isLoading.set(true);\n    this.examService.getExamAttempts(id)\n      .pipe(finalize(() => this.isLoading.set(false)))\n      .subscribe({\n        next: (res) => {\n          this.attempts.set(res.items || []);\n          this.totalCount.set(res.totalCount || 0);\n        },\n        error: () => {\n          this.error.set('حدث خطأ أثناء جلب نتائج الطلاب.');\n        }\n      });\n  }";

const newLoadAttempts = `private loadAttempts(id: string, page: number = 1, pageSize: number = 10): void {
    this.isLoading.set(true);
    this.examService.getExamAttempts(id, page, pageSize)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.attempts.set(res.items || []);
          this.totalCount.set(res.totalCount || 0);
          this.pageNumber.set(page);
          this.pageSize.set(pageSize);
        },
        error: () => {
          this.error.set('حدث خطأ أثناء جلب نتائج الطلاب.');
        }
      });
  }

  onPageChange(page: number): void {
    const id = this.examId();
    if (id) {
      this.loadAttempts(id, page, this.pageSize());
    }
  }

  onPageSizeChange(newSize: number): void {
    const id = this.examId();
    if (id) {
      this.loadAttempts(id, 1, newSize);
    }
  }`;

content = content.replace(oldLoadAttempts, newLoadAttempts);

fs.writeFileSync(filePath, content, 'utf8');