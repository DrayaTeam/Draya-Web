const fs = require('fs');

const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
const scssPath = 'src/app/features/teacher/reports/teacher-reports.component.scss';

// ── 1. Update HTML ──
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldCardsRegex =
  /<!-- Profile Block \(As in Image\) -->[\s\S]*?<!-- Subject Proficiency \(Spans 2 columns\) -->/;

const newHeaderHtml = `<!-- Document Header (Notion Style) -->
        <div class="doc-header-block">
          <div class="doc-title-row">
            <div class="doc-avatar">
              @if (selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl) {
                <img [src]="selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl" alt="avatar">
              } @else {
                {{ selectedStudent()?.fullName?.charAt(0) }}
              }
            </div>
            <div class="doc-name-col">
              <h1>تقرير أداء الطالب: {{ selectedStudent()?.fullName }}</h1>
              <div class="doc-tags">
                <span class="doc-tag success">نشط</span>
                <span class="doc-tag neutral">{{ selectedClassroom()?.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="doc-stats-inline">
            <span class="stat-item">المتوسط العام: <strong>{{ studentAnalytics()?.overallAverage }}%</strong></span>
            <span class="stat-divider">•</span>
            <span class="stat-item">أعلى درجة: <strong>{{ studentAnalytics()?.highestScore }}%</strong></span>
            <span class="stat-divider">•</span>
            <span class="stat-item">الامتحانات المكتملة: <strong>{{ studentAnalytics()?.completedExams }}</strong></span>
          </div>
        </div>

        <!-- Subject Proficiency (Spans 2 columns) -->`;

htmlContent = htmlContent.replace(oldCardsRegex, newHeaderHtml);
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

// ── 2. Update SCSS ──
let scssContent = fs.readFileSync(scssPath, 'utf8');

// Remove old top cards CSS
const oldCardsScssRegex =
  /\/\/ Box Specifications\n\.image-profile-box \{[\s\S]*?\}\n\n\.image-stat-box \{[\s\S]*?\}\n\n\.subjects-box \{/;

const newHeaderScss = `// Box Specifications

.doc-header-block {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 8px 32px 8px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 8px;

  @media (max-width: 1024px) {
    grid-column: span 2;
  }
  @media (max-width: 640px) {
    grid-column: span 1;
  }

  .doc-title-row {
    display: flex;
    align-items: center;
    gap: 16px;

    .doc-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #f1f5f9;
      color: var(--draya-primary-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      flex-shrink: 0;
      overflow: hidden;
      border: 1px solid #e2e8f0;

      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .doc-name-col {
      display: flex;
      flex-direction: column;
      gap: 4px;

      h1 {
        font-size: 28px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.5px;
      }

      .doc-tags {
        display: flex;
        gap: 8px;

        .doc-tag {
          display: inline-flex;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          
          &.neutral { background: #f8fafc; color: #475569; }
          &.success { background: #dcfce7; color: #16a34a; }
        }
      }
    }
  }

  .doc-stats-inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    color: #475569;
    padding-right: 64px; // Align under text, not avatar

    @media (max-width: 640px) {
      padding-right: 0;
    }

    .stat-item {
      strong {
        color: #0f172a;
        font-weight: 900;
        font-size: 18px;
        margin-right: 4px;
      }
    }

    .stat-divider {
      color: #cbd5e1;
      font-size: 16px;
      user-select: none;
    }
  }
}

.subjects-box {`;

scssContent = scssContent.replace(oldCardsScssRegex, newHeaderScss);
fs.writeFileSync(scssPath, scssContent, 'utf8');

console.log('Fixed mixed layout');
