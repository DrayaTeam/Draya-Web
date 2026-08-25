const fs = require('fs');

// 1. Remove from TS
const tsPath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
let tsContent = fs.readFileSync(tsPath, 'utf8');

// Remove Modal variables
const modalVarsRegex = /\/\/ Modals[\s\S]*?readonly reviewError = signal<string \| null>\(null\);/g;
tsContent = tsContent.replace(modalVarsRegex, '');

// Remove openInteractiveReview function
const openInteractiveReviewRegex =
  /openInteractiveReview\(topic: any\): void \{[\s\S]*?\}\n\n  \}/g;
tsContent = tsContent.replace(openInteractiveReviewRegex, '}'); // Keep the closing bracket of the class

fs.writeFileSync(tsPath, tsContent, 'utf8');

// 2. Remove from HTML & Refine design
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Remove Modal HTML
const modalHtmlRegex = /<!-- Interactive Review Modal -->[\s\S]*?<\/p-dialog>\n/g;
htmlContent = htmlContent.replace(modalHtmlRegex, '');

// Remove the explicit Interactive Review button
const buttonRegex =
  /<div class="mt-4 pt-4 border-t border-slate-100 flex justify-end">[\s\S]*?<\/button>\n\s*<\/div>/g;
htmlContent = htmlContent.replace(buttonRegex, '');

// Refine the Profile Summary Card (remove giant gradient hero)
const oldProfileSummary = `<div class="profile-summary-card animate-fade-in">
          <div class="profile-avatar-large">
            @if (selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl) {
              <img [src]="selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl" alt="avatar">
            } @else {
              {{ selectedStudent()?.fullName?.charAt(0) }}
            }
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ selectedStudent()?.fullName }}</h1>
            <div class="profile-tags">
              <span class="tag-pill bg-primary">{{ selectedClassroom()?.name }}</span>
              <span class="tag-pill bg-success">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                طالب نشط
              </span>
            </div>
          </div>
        </div>`;

const newProfileSummary = `<div class="simple-profile-header animate-fade-in">
          <div class="simple-profile-avatar">
            @if (selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl) {
              <img [src]="selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl" alt="avatar">
            } @else {
              {{ selectedStudent()?.fullName?.charAt(0) }}
            }
          </div>
          <div class="simple-profile-info">
            <h1 class="simple-profile-name">{{ selectedStudent()?.fullName }}</h1>
            <div class="simple-profile-tags">
              <span class="simple-tag-pill bg-gray">{{ selectedClassroom()?.name }}</span>
              <span class="simple-tag-pill bg-green">نشط</span>
            </div>
          </div>
        </div>`;

htmlContent = htmlContent.replace(oldProfileSummary, newProfileSummary);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');

// 3. Remove/Update from SCSS
const scssPath = 'src/app/features/teacher/reports/teacher-reports.component.scss';
let scssContent = fs.readFileSync(scssPath, 'utf8');

// Remove .profile-summary-card block
const profileScssRegex = /\.profile-summary-card \{[\s\S]*?\}\n\n\/\/ ── Middle Cards/g;

const newProfileScss = `.simple-profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  margin-bottom: 24px;

  .simple-profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 800;
    color: var(--draya-primary-700);
    overflow: hidden;
    flex-shrink: 0;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .simple-profile-info {
    display: flex;
    flex-direction: column;

    .simple-profile-name {
      margin: 0 0 4px;
      font-family: 'Cairo', sans-serif;
      font-weight: 800;
      font-size: 20px;
      color: #1e293b;
    }

    .simple-profile-tags {
      display: flex;
      align-items: center;
      gap: 8px;

      .simple-tag-pill {
        display: inline-flex;
        align-items: center;
        padding: 2px 10px;
        border-radius: 6px;
        font-family: 'Cairo', sans-serif;
        font-weight: 700;
        font-size: 11px;
        
        &.bg-gray {
          background: #f1f5f9;
          color: #475569;
        }
        &.bg-green {
          background: #d0fae5;
          color: #007a55;
        }
      }
    }
  }
}

// ── Middle Cards`;

scssContent = scssContent.replace(profileScssRegex, newProfileScss);

// Remove the button SCSS for interactive review
const buttonScssRegex =
  /\.btn-review-topic \{[\s\S]*?\}\n\s*\}\n\s*\}\n\}\n\n\/\/ ── Right Sidebar/g;
scssContent = scssContent.replace(buttonScssRegex, '}\n  }\n}\n\n// ── Right Sidebar');

fs.writeFileSync(scssPath, scssContent, 'utf8');

console.log('Done removing interactive review and refining design.');
