const fs = require('fs');

// ── 1. Update HTML ──
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const oldGridTopRegex = /<!-- Profile Block -->[\s\S]*?<!-- Subject Proficiency \(Spans 2 columns\) -->/;

const newGridTop = `<!-- Top Banner (Spans 4 columns): Profile + Stats -->
        <div class="bento-box top-banner-box">
          <!-- Profile Section -->
          <div class="banner-profile">
            <div class="profile-avatar-small">
              @if (selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl) {
                <img [src]="selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl" alt="avatar">
              } @else {
                {{ selectedStudent()?.fullName?.charAt(0) }}
              }
            </div>
            <div class="profile-details">
              <h2>{{ selectedStudent()?.fullName }}</h2>
              <div class="profile-tags">
                <span class="bento-tag neutral">{{ selectedClassroom()?.name }}</span>
                <span class="bento-tag success">نشط</span>
              </div>
            </div>
          </div>

          <div class="banner-divider"></div>

          <!-- Stat 1 -->
          <div class="banner-stat">
            <div class="stat-label">
              <i class="pi pi-chart-line text-blue-500"></i>
              <span>{{ 'TEACHER.REPORTS.OVERALL_AVERAGE' | translate }}</span>
            </div>
            <div class="stat-value">
              {{ studentAnalytics()?.overallAverage }}<span class="unit">%</span>
            </div>
          </div>

          <div class="banner-divider"></div>

          <!-- Stat 2 -->
          <div class="banner-stat">
            <div class="stat-label">
              <i class="pi pi-arrow-up-right text-emerald-500"></i>
              <span>{{ 'TEACHER.REPORTS.HIGHEST_SCORE' | translate }}</span>
            </div>
            <div class="stat-value">
              {{ studentAnalytics()?.highestScore }}<span class="unit">%</span>
            </div>
          </div>

          <div class="banner-divider"></div>

          <!-- Stat 3 -->
          <div class="banner-stat">
            <div class="stat-label">
              <i class="pi pi-check-circle text-purple-500"></i>
              <span>{{ 'TEACHER.REPORTS.COMPLETED_EXAMS' | translate }}</span>
            </div>
            <div class="stat-value">
              {{ studentAnalytics()?.completedExams }}
            </div>
          </div>
        </div>

        <!-- Subject Proficiency (Spans 2 columns) -->`;

htmlContent = htmlContent.replace(oldGridTopRegex, newGridTop);
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

// ── 2. Update SCSS ──
const scssPath = 'src/app/features/teacher/reports/teacher-reports.component.scss';
let scssContent = fs.readFileSync(scssPath, 'utf8');

// Remove old .profile-box and .stat-box
const profileBoxRegex = /\.profile-box \{[\s\S]*?\}\n\n\.stat-box \{[\s\S]*?\}\n\n\.subjects-box/g;

const newBannerScss = `.top-banner-box {
  grid-column: span 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  
  @media (max-width: 1024px) {
    grid-column: span 2;
    flex-wrap: wrap;
    gap: 24px;
    padding: 24px;
  }
  @media (max-width: 640px) {
    grid-column: span 1;
    flex-direction: column;
    align-items: flex-start;
  }

  .banner-profile {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1.5;
    min-width: 200px;

    .profile-avatar-small {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f1f5f9;
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

    .profile-details {
      display: flex;
      flex-direction: column;
      gap: 4px;

      h2 {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
      }
      .profile-tags {
        display: flex;
        gap: 6px;
      }
    }
  }

  .banner-divider {
    width: 1px;
    height: 40px;
    background-color: #e2e8f0;
    margin: 0 16px;

    @media (max-width: 1024px) {
      display: none; // Hide on smaller screens where it wraps
    }
  }

  .banner-stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 120px;

    .stat-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: #64748b;

      i { font-size: 14px; }
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;

      .unit { font-size: 16px; color: #94a3b8; margin-inline-start: 4px; }
    }
  }
}

.subjects-box`;

scssContent = scssContent.replace(profileBoxRegex, newBannerScss);
fs.writeFileSync(scssPath, scssContent, 'utf8');

console.log('Fixed top banner layout');
