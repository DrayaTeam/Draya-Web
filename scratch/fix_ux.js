const fs = require('fs');

// 1. Fix the TS file (wrong property: topic.topicId -> topic.topicName)
const tsPath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
let tsContent = fs.readFileSync(tsPath, 'utf8');
tsContent = tsContent.replace(
    'this.reportsService.getInteractiveReview(studentId, topic.topicId)',
    'this.reportsService.getInteractiveReview(studentId, topic.topicName)'
);
fs.writeFileSync(tsPath, tsContent, 'utf8');

// 2. Fix the HTML file (Remove card click, add explicit button)
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Remove the full card click
htmlContent = htmlContent.replace(
    '<div class="weakness-card cursor-pointer hover:border-[var(--draya-primary-400)] transition-colors" (click)="openInteractiveReview(topic)">',
    '<div class="weakness-card">'
);

// Add the explicit button inside the card, below the errors or as a footer
const oldErrorsSectionEnd = '</ul>\n                    </div>\n                  }';
const newErrorsSectionEnd = `</ul>
                    </div>
                  }
                  
                  <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <button class="btn-review-topic" (click)="openInteractiveReview(topic)">
                      <i class="pi pi-sparkles"></i>
                      <span>{{ 'TEACHER.REPORTS.INTERACTIVE_REVIEW' | translate }}</span>
                    </button>
                  </div>`;
htmlContent = htmlContent.replace(oldErrorsSectionEnd, newErrorsSectionEnd);
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

// 3. Update the SCSS file for the new button
const scssPath = 'src/app/features/teacher/reports/teacher-reports.component.scss';
let scssContent = fs.readFileSync(scssPath, 'utf8');

const newButtonScss = `
      .btn-review-topic {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 999px;
        color: var(--draya-primary-700);
        font-family: 'Cairo', sans-serif;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        transition: all 150ms ease;

        i {
          font-size: 12px;
          color: var(--draya-primary-500);
        }

        &:hover {
          background: var(--draya-primary-50);
          border-color: var(--draya-primary-200);
          color: var(--draya-primary-800);
          transform: translateY(-1px);
        }

        &:active {
          transform: scale(0.97);
        }
      }
`;

// Insert the new button scss inside the .weakness-card block
const insertPoint = scssContent.indexOf('.weakness-errors {');
if (insertPoint !== -1) {
    scssContent = scssContent.substring(0, insertPoint) + newButtonScss + scssContent.substring(insertPoint);
} else {
    scssContent += newButtonScss; // Fallback
}
fs.writeFileSync(scssPath, scssContent, 'utf8');

console.log('Fixed TS, HTML, and SCSS for weak topics interactive review.');
