const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
const scssPath = 'src/app/features/teacher/reports/teacher-reports.component.scss';

// 1 & 4. Fix SCSS (Remove shadows and add padding)
let scssContent = fs.readFileSync(scssPath, 'utf8');

// Remove all box-shadows
scssContent = scssContent.replace(/box-shadow:[^;]+;/g, '');

// Increase padding for dropdown options (via PrimeNG styling overrides)
// Check if .p-select-option exists
if (!scssContent.includes('.p-select-option')) {
  scssContent += `
::ng-deep .p-select-option {
    padding: 12px 16px !important;
}
`;
} else {
  // It's not in this file directly, but let's add the override globally for this component just in case
  scssContent += `
::ng-deep {
    .p-select-list {
        padding: 8px !important;
    }
    .p-select-option {
        padding: 12px 16px !important;
        margin-bottom: 4px !important;
        border-radius: 8px !important;
    }
}
`;
}

fs.writeFileSync(scssPath, scssContent, 'utf8');

// 2 & 3. Fix HTML (Remove blobs, add padding to items, add modal back)
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Remove ambient blobs
htmlContent = htmlContent.replace(/<div class="ambient-blob blob-top-right"><\/div>/g, '');
htmlContent = htmlContent.replace(/<div class="ambient-blob blob-bottom-left"><\/div>/g, '');

// Add padding directly to the dropdown item templates to be safe
htmlContent = htmlContent.replace(
  /<div class="select-item-display">/g,
  '<div class="select-item-display px-2 py-1">',
);
htmlContent = htmlContent.replace(
  /<div class="select-item-dropdown">/g,
  '<div class="select-item-dropdown px-3 py-2 w-full">',
);

// Restore the Interactive Review click handler on weakness card
htmlContent = htmlContent.replace(
  '<div class="weakness-card">',
  '<div class="weakness-card cursor-pointer hover:border-[var(--draya-primary-400)] transition-colors" (click)="openInteractiveReview(topic)">',
);

// Add the Interactive Review Modal back to the end of the file (before the last </div>)
const modalHtml = `
  <!-- Interactive Review Modal -->
  <p-dialog 
    [(visible)]="showReviewModal" 
    [modal]="true" 
    [header]="'TEACHER.REPORTS.INTERACTIVE_REVIEW' | translate"
    [style]="{ width: '90vw', maxWidth: '800px' }"
    [draggable]="false"
    [resizable]="false"
    [dismissableMask]="true"
    [showHeader]="false"
    styleClass="bg-white rounded-3xl overflow-hidden border border-slate-200">
    
    <ng-template pTemplate="content">
      <div class="p-6 md:p-8" dir="rtl">
        <div class="flex items-center justify-between mb-8">
          <div>
            <span class="inline-block px-3 py-1 bg-[var(--draya-primary-50)] text-[var(--draya-primary-700)] rounded-lg text-xs font-bold mb-3 border border-[var(--draya-primary-100)]">{{ reviewModalData().topic }}</span>
            <h2 class="text-2xl font-black text-slate-800">{{ 'TEACHER.REPORTS.REVIEW_EXERCISE' | translate }}</h2>
          </div>
          <button (click)="showReviewModal.set(false)" class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors">
            <i class="pi pi-times"></i>
          </button>
        </div>

        @if (isLoadingReview()) {
          <div class="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <div class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <i class="pi pi-spin pi-spinner text-3xl text-[var(--draya-primary-500)]"></i>
            </div>
            <p class="font-bold">جاري تحميل أسئلة المراجعة التفاعلية...</p>
          </div>
        } @else if (reviewError()) {
          <div class="flex flex-col items-center justify-center py-20 text-red-500 gap-4">
            <div class="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <i class="pi pi-exclamation-circle text-3xl text-red-500"></i>
            </div>
            <p class="font-bold text-center text-slate-700 px-4">{{ reviewError() }}</p>
          </div>
        } @else if (reviewModalData().data) {
          <div class="space-y-6">
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <i class="pi pi-question-circle text-slate-400"></i>
                السؤال:
              </h3>
              <p class="text-slate-700 font-medium leading-relaxed">{{ reviewModalData().data?.questionText }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (opt of reviewModalData().data?.options; track opt) {
                <div class="p-4 rounded-xl border-2 border-slate-100 bg-white flex items-center gap-3">
                  <div class="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                  <span class="font-bold text-slate-700">{{ opt }}</span>
                </div>
              }
            </div>
            
            <div class="p-5 bg-[var(--draya-primary-50)] rounded-2xl border border-[var(--draya-primary-100)] mt-6">
              <h3 class="font-bold text-[var(--draya-primary-800)] mb-2 flex items-center gap-2">
                <i class="pi pi-info-circle"></i>
                تلميح للحل:
              </h3>
              <p class="text-[var(--draya-primary-700)] text-sm font-medium">{{ reviewModalData().data?.hintText }}</p>
            </div>
          </div>
        }
      </div>
    </ng-template>
  </p-dialog>
</div>
`;

// Replace the very last </div> in the file with our modal and the closing div
const lastDivIndex = htmlContent.lastIndexOf('</div>');
if (lastDivIndex !== -1) {
  htmlContent = htmlContent.substring(0, lastDivIndex) + modalHtml;
} else {
  htmlContent += modalHtml; // Fallback
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');

console.log('Done fixing HTML and SCSS');
