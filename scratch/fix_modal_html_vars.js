const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// The modal content we want to replace
const startMarker = '<div class="space-y-6">';
const endMarker = '</div>\n        }';
const startIndex = htmlContent.indexOf(startMarker);
const endIndex = htmlContent.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `
          <div class="space-y-6">
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <i class="pi pi-bolt text-amber-500"></i>
                التوصية:
              </h3>
              <p class="text-slate-700 font-medium leading-relaxed">{{ reviewModalData().data?.recommendation }}</p>
            </div>
            
            <div class="p-5 bg-[var(--draya-primary-50)] rounded-2xl border border-[var(--draya-primary-100)] mt-6">
              <h3 class="font-bold text-[var(--draya-primary-800)] mb-3 flex items-center gap-2">
                <i class="pi pi-sparkles text-[var(--draya-primary-600)]"></i>
                شرح الذكاء الاصطناعي:
              </h3>
              <p class="text-[var(--draya-primary-700)] text-sm font-medium leading-loose">{{ reviewModalData().data?.aiExplanation }}</p>
            </div>
          </div>
`;
  htmlContent = htmlContent.substring(0, startIndex) + newContent + htmlContent.substring(endIndex);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('Fixed modal HTML');
} else {
  console.error('Could not find modal content to replace');
}
