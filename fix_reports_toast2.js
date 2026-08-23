const fs = require('fs');
const filePath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const target = pproveReport(): void {
    const report = this.latestReport();
    if (!report?.id) return;

    this.isApproving.set(true);
    this.reportsService.approveReport(report.id).subscribe({
      next: (res: { message?: string } | null) => {
        this.isApproving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: res?.message || 'تم اعتماد التقرير بنجاح.',
        });
      },
      error: (err) => {
        console.error('Failed to approve report', err);
        this.isApproving.set(false);
      },
    });
  };

const replacement = pproveReport(): void {
    const report = this.latestReport();
    if (!report?.id) return;

    this.isApproving.set(true);
    this.reportsService.approveReport(report.id).subscribe({
      next: (res: { message?: string } | null) => {
        this.isApproving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: res?.message || 'تم اعتماد وإرسال التقرير بنجاح إلى البريد الإلكتروني لولي الأمر.',
        });
      },
      error: (err) => {
        console.error('Failed to approve report', err);
        this.isApproving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.message || 'حدث خطأ أثناء إرسال التقرير لولي الأمر.'
        });
      },
    });
  };

content = content.replace(target, replacement);
fs.writeFileSync(filePath, content, 'utf8');