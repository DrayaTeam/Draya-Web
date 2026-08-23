const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const modalMarker = '<!-- Interactive Review Modal -->';
const markerIndex = htmlContent.indexOf(modalMarker);

if (markerIndex !== -1) {
    const newModalHtml = `<!-- Interactive Review Modal -->
<p-dialog 
  [(visible)]="showReviewModal" 
  [modal]="true" 
  [draggable]="false"
  [resizable]="false"
  header="المراجعة التفاعلية الذكية"
  [style]="{ width: '90%', maxWidth: '600px' }">
  
  <div class="flex flex-col gap-2 p-2">
    <p class="text-sm font-medium text-[var(--draya-ai-600)] mb-4">{{ reviewModalData().topic }}</p>

    @if (isLoadingReview()) {
      <div class="flex flex-col items-center justify-center py-10 text-[var(--draya-neutral-500)] gap-4">
        <i class="pi pi-spin pi-spinner text-4xl text-[var(--draya-ai-600)]"></i>
        <p class="font-bold text-lg animate-pulse text-[var(--draya-ai-700)]">جاري تحليل الأداء...</p>
      </div>
    } @else if (reviewError()) {
      <div class="bg-red-50 text-red-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-red-200">
        <i class="pi pi-times-circle text-4xl text-red-500"></i>
        <p class="font-bold text-lg">{{ reviewError() }}</p>
      </div>
    } @else if (reviewModalData().data; as review) {
      <div class="flex flex-col gap-6 animate-fade-in-up">
        
        <div class="bg-[var(--draya-neutral-50)] p-5 rounded-2xl border border-[var(--draya-neutral-200)] relative overflow-hidden">
          <div class="absolute top-0 start-0 w-1.5 h-full bg-[var(--draya-primary-500)]"></div>
          <h4 class="text-[var(--draya-neutral-900)] font-bold mb-2 flex items-center gap-2">
            <i class="pi pi-map text-[var(--draya-primary-600)]"></i>
            التوصيات الدراسية
          </h4>
          <p class="text-[var(--draya-neutral-700)] font-medium leading-relaxed whitespace-pre-wrap text-sm">
            {{ review.recommendation }}
          </p>
        </div>

        <div class="bg-gradient-to-br from-[var(--draya-ai-50)] to-white p-5 rounded-2xl border border-[var(--draya-ai-200)] shadow-inner">
          <h4 class="text-[var(--draya-ai-900)] font-bold mb-3 flex items-center gap-2">
            <i class="pi pi-comment text-[var(--draya-ai-600)]"></i>
            الشرح المقترح
          </h4>
          <div class="bg-white p-4 rounded-xl border border-[var(--draya-ai-100)] shadow-sm">
            <p class="text-[var(--draya-ai-800)] font-medium leading-relaxed whitespace-pre-wrap italic border-s-4 border-[var(--draya-ai-400)] ps-3 text-sm">
              {{ review.aiExplanation }}
            </p>
          </div>
        </div>
      </div>
    }
  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-end gap-3 pt-4 border-t border-[var(--draya-neutral-100)] w-full">
      <button 
        class="px-5 py-2.5 rounded-xl font-bold bg-[var(--draya-neutral-100)] text-[var(--draya-neutral-700)] hover:bg-[var(--draya-neutral-200)] transition-colors text-sm"
        (click)="showReviewModal.set(false)">
        إغلاق
      </button>
      <button 
        [disabled]="!!reviewError() || isLoadingReview()"
        class="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[var(--draya-ai-600)] to-[var(--draya-ai-700)] text-white hover:from-[var(--draya-ai-700)] hover:to-[var(--draya-ai-800)] transition-all shadow-md disabled:opacity-50 flex items-center gap-2 text-sm">
        <i class="pi pi-share-alt"></i>
        مشاركة مع الطالب
      </button>
    </div>
  </ng-template>
</p-dialog>
`;
    
    htmlContent = htmlContent.substring(0, markerIndex) + newModalHtml;
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('Fixed modal HTML');
}
