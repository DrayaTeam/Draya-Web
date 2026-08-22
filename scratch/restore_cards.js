const fs = require('fs');

const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
const scssPath = 'src/app/features/teacher/reports/teacher-reports.component.scss';

// We will rewrite the HTML to the Bento layout but with the top 4 cards exactly matching the image.
const htmlContent = `<div class="bento-dashboard" dir="rtl">
  
  <!-- ── Top Header & Filters ── -->
  <header class="bento-header animate-fade-in">
    <div class="header-titles">
      <h1>{{ 'TEACHER.REPORTS.TITLE' | translate }}</h1>
      <p>{{ 'TEACHER.REPORTS.ANALYTICS_OVERVIEW' | translate }}</p>
    </div>

    <div class="header-filters">
      <div class="bento-select-wrapper">
        <p-select 
          [options]="classrooms()" 
          [(ngModel)]="selectedClassroom" 
          (onChange)="onClassroomSelect()"
          optionLabel="name" 
          placeholder="{{ 'TEACHER.REPORTS.SELECT_CLASSROOM' | translate }}"
          styleClass="bento-select">
        </p-select>
      </div>
      
      <div class="bento-select-wrapper relative">
        <p-select 
          [options]="students()" 
          [(ngModel)]="selectedStudent" 
          (onChange)="onStudentSelect()"
          optionLabel="fullName" 
          [disabled]="students().length === 0 && !isLoadingStudents()"
          placeholder="{{ 'TEACHER.REPORTS.SELECT_STUDENT' | translate }}"
          styleClass="bento-select">
          
          <ng-template pTemplate="selectedItem">
            @if (selectedStudent()) {
              <div class="select-item-content">
                <div class="mini-avatar">
                  @if (selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl) {
                    <img [src]="selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl" alt="avatar">
                  } @else {
                    {{ selectedStudent()?.fullName?.charAt(0) }}
                  }
                </div>
                <span>{{ selectedStudent()?.fullName }}</span>
              </div>
            }
          </ng-template>

          <ng-template let-student pTemplate="item">
            <div class="select-item-content">
              <div class="mini-avatar">
                @if (student.profilePictureUrl || student.pictureUrl) {
                  <img [src]="student.profilePictureUrl || student.pictureUrl" alt="avatar">
                } @else {
                  {{ student.fullName.charAt(0) }}
                }
              </div>
              <div class="select-text">
                <span class="name">{{ student.fullName }}</span>
                <span class="status">{{ student.status === 'Active' ? 'نشط' : student.status }}</span>
              </div>
            </div>
          </ng-template>
        </p-select>

        @if (isLoadingStudents()) {
          <div class="spinner-overlay">
            <i class="pi pi-spinner pi-spin"></i>
          </div>
        }
      </div>
    </div>
  </header>

  <!-- ── Main Grid ── -->
  @if (!selectedStudent()) {
    <div class="bento-empty-state animate-fade-in">
      <i class="pi pi-box empty-icon"></i>
      <h3>{{ 'TEACHER.REPORTS.EMPTY_TITLE' | translate }}</h3>
      <p>{{ 'TEACHER.REPORTS.EMPTY_DESC' | translate }}</p>
    </div>
  } @else {
    @if (isLoadingAnalytics()) {
      <div class="bento-skeleton-grid">
        <div class="skeleton-box"></div>
        <div class="skeleton-box"></div>
        <div class="skeleton-box"></div>
        <div class="skeleton-box"></div>
        <div class="skeleton-box span-2"></div>
        <div class="skeleton-box span-2"></div>
      </div>
    } @else if (studentAnalytics()) {
      <div class="bento-grid animate-fade-in">
        
        <!-- Profile Block (As in Image) -->
        <div class="bento-box image-profile-box">
          <div class="img-avatar">
            @if (selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl) {
              <img [src]="selectedStudent()?.profilePictureUrl || selectedStudent()?.pictureUrl" alt="avatar">
            } @else {
              {{ selectedStudent()?.fullName?.charAt(0) }}
            }
          </div>
          <h2>{{ selectedStudent()?.fullName }}</h2>
          <div class="img-tags">
            <span class="img-tag success">نشط</span>
            <span class="img-tag neutral">{{ selectedClassroom()?.name }}</span>
          </div>
        </div>

        <!-- Stat 1: Overall Average (As in Image) -->
        <div class="bento-box image-stat-box">
          <div class="stat-top">
            <span class="stat-title">{{ 'TEACHER.REPORTS.OVERALL_AVERAGE' | translate }}</span>
            <i class="pi pi-chart-line text-blue-500"></i>
          </div>
          <div class="stat-bottom">
            <span class="stat-number">{{ studentAnalytics()?.overallAverage }}</span><span class="stat-unit">%</span>
          </div>
        </div>

        <!-- Stat 2: Highest Score (As in Image) -->
        <div class="bento-box image-stat-box">
          <div class="stat-top">
            <span class="stat-title">{{ 'TEACHER.REPORTS.HIGHEST_SCORE' | translate }}</span>
            <i class="pi pi-arrow-up-right text-emerald-500"></i>
          </div>
          <div class="stat-bottom">
            <span class="stat-number">{{ studentAnalytics()?.highestScore }}</span><span class="stat-unit">%</span>
          </div>
        </div>

        <!-- Stat 3: Completed Exams (As in Image) -->
        <div class="bento-box image-stat-box">
          <div class="stat-top">
            <span class="stat-title">{{ 'TEACHER.REPORTS.COMPLETED_EXAMS' | translate }}</span>
            <i class="pi pi-check-circle text-purple-500"></i>
          </div>
          <div class="stat-bottom">
            <span class="stat-number">{{ studentAnalytics()?.completedExams }}</span>
          </div>
        </div>

        <!-- Subject Proficiency (Spans 2 columns) -->
        <div class="bento-box subjects-box">
          <h3 class="box-title">{{ 'TEACHER.REPORTS.SUBJECT_PROFICIENCY' | translate }}</h3>
          <div class="minimal-bars-list">
            @for (sub of studentAnalytics()?.subjectProficiencies; track sub.subjectName) {
              <div class="minimal-bar-item">
                <div class="bar-labels">
                  <span class="label-name">{{ sub.subjectName }}</span>
                  <span class="label-val">{{ sub.proficiencyPercent }}%</span>
                </div>
                <div class="minimal-track">
                  <div class="minimal-fill" [style.width.%]="sub.proficiencyPercent"></div>
                </div>
              </div>
            }
            @empty {
              <p class="empty-text">{{ 'TEACHER.REPORTS.NO_SUBJECTS' | translate }}</p>
            }
          </div>
        </div>

        <!-- AI Report (Spans 2 columns) -->
        <div class="bento-box ai-box">
          <div class="ai-box-header">
            <h3 class="box-title">
              <i class="pi pi-sparkles text-purple-500 ml-2"></i>
              {{ 'TEACHER.REPORTS.LATEST_REPORT' | translate }}
            </h3>
            @if (latestReport()) {
              <span class="ai-date">{{ latestReport()?.generatedAt | date: 'longDate' }}</span>
            }
          </div>
          
          @if (latestReport()) {
            <div class="ai-content">
              <p>{{ latestReport()?.summaryText }}</p>
            </div>
            <button class="bento-btn primary mt-4" (click)="approveReport()" [disabled]="isApproving()">
              @if (isApproving()) {
                <i class="pi pi-spinner pi-spin"></i>
                <span>{{ 'TEACHER.REPORTS.APPROVING' | translate }}</span>
              } @else {
                <i class="pi pi-send"></i>
                <span>{{ 'TEACHER.REPORTS.APPROVE_SEND' | translate }}</span>
              }
            </button>
          } @else {
            <p class="empty-text">{{ 'TEACHER.REPORTS.NO_LATEST_REPORT' | translate }}</p>
          }
        </div>

        <!-- Weak Topics Table (Spans full width - 4 columns) -->
        <div class="bento-box topics-box">
          <h3 class="box-title text-red-500 mb-4">{{ 'TEACHER.REPORTS.WEAK_TOPICS' | translate }}</h3>
          
          @if (studentAnalytics()?.weakTopics?.length) {
            <div class="bento-table-container">
              <table class="bento-table">
                <thead>
                  <tr>
                    <th>المادة</th>
                    <th>الموضوع</th>
                    <th>مستوى الإتقان</th>
                    <th>أخطاء متكررة شائعة</th>
                  </tr>
                </thead>
                <tbody>
                  @for (topic of studentAnalytics()?.weakTopics; track topic.topicName) {
                    <tr>
                      <td><span class="bento-tag neutral">{{ topic.subjectName }}</span></td>
                      <td class="font-bold text-slate-800">{{ topic.topicName }}</td>
                      <td>
                        <span class="score-badge">{{ topic.proficiencyPercent }}%</span>
                      </td>
                      <td class="text-xs text-slate-500" dir="ltr">
                        @if (topic.exampleIncorrectAnswers.length) {
                          {{ topic.exampleIncorrectAnswers[0] }}
                          @if (topic.exampleIncorrectAnswers.length > 1) {
                            <span class="text-slate-400">, +{{ topic.exampleIncorrectAnswers.length - 1 }}</span>
                          }
                        } @else {
                          -
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="empty-text">{{ 'TEACHER.REPORTS.NO_WEAK_TOPICS_DESC' | translate }}</p>
          }
        </div>

      </div>
    }
  }
</div>
`;
fs.writeFileSync(htmlPath, htmlContent, 'utf8');

const scssContent = `// src/app/features/teacher/reports/teacher-reports.component.scss

.bento-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  font-family: 'Cairo', sans-serif;
}

// ── Animations ──
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

// ── Typography Helpers ──
h1, h2, h3, p { margin: 0; }

// ── Header ──
.bento-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-titles {
    display: flex;
    flex-direction: column;
    gap: 4px;

    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    p {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
    }
  }

  .header-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 480px;

    @media (max-width: 640px) {
      flex-direction: column;
      max-width: 100%;
    }

    .bento-select-wrapper {
      flex: 1;
      width: 100%;
    }
  }
}

// ── PrimeNG Select Customization ──
::ng-deep .bento-select {
  width: 100%;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff !important;
  box-shadow: none !important;
  height: 40px;
  display: flex;
  align-items: center;

  &:hover {
    border-color: #cbd5e1 !important;
  }
  &.p-focus {
    border-color: var(--draya-primary-500) !important;
    box-shadow: 0 0 0 2px rgba(27, 109, 99, 0.1) !important;
  }
}

::ng-deep {
  .p-select-list {
    padding: 6px !important;
  }
  .p-select-option {
    padding: 10px 14px !important;
    margin-bottom: 2px !important;
    border-radius: 8px !important;
  }
}

.select-item-content {
  display: flex;
  align-items: center;
  gap: 10px;

  .mini-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f1f5f9;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    overflow: hidden;
    flex-shrink: 0;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .select-text { display: flex; flex-direction: column; }
  span.name { font-weight: 700; color: #1e293b; font-size: 13px; }
  span.status { font-size: 10px; color: #64748b; }
}

.spinner-overlay {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

// ── Skeletons ──
.bento-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  .skeleton-box {
    background: #f1f5f9;
    border-radius: 20px;
    height: 140px;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    
    &.span-2 { grid-column: span 2; height: 280px; }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.bento-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 24px;
  text-align: center;
  color: #64748b;

  .empty-icon { font-size: 32px; color: #cbd5e1; margin-bottom: 16px; }
  h3 { font-size: 18px; font-weight: 700; color: #334155; margin-bottom: 8px; }
  p { font-size: 14px; }
}

// ── The Bento Grid ──
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.bento-box {
  background: #ffffff;
  border: 1px solid #f1f5f9; // Very subtle border matching the image
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  overflow: hidden;

  .box-title {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 16px;
  }
}

// Box Specifications
.image-profile-box {
  grid-column: span 1;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;

  .img-avatar {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
    color: var(--draya-primary-700);
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  h2 { font-size: 18px; font-weight: 800; color: #0f172a; }

  .img-tags {
    display: flex;
    gap: 8px;

    .img-tag {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      
      &.neutral { background: #f8fafc; color: #475569; }
      &.success { background: #dcfce7; color: #16a34a; }
    }
  }
}

.image-stat-box {
  grid-column: span 1;
  justify-content: space-between;
  min-height: 140px;

  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .stat-title {
      font-size: 15px;
      font-weight: 700;
      color: #64748b;
    }
  }

  .stat-bottom {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    
    .stat-number {
      font-size: 42px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1;
    }

    .stat-unit {
      font-size: 20px;
      font-weight: 700;
      color: #94a3b8;
      margin-inline-start: 4px;
    }
  }
}

.subjects-box {
  grid-column: span 2;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 1024px) {
    grid-column: span 2;
  }
  @media (max-width: 640px) {
    grid-column: span 1;
  }

  .minimal-bars-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .minimal-bar-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .bar-labels {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
        color: #334155;

        .label-val { font-weight: 800; color: #0f172a; }
      }

      .minimal-track {
        width: 100%;
        height: 6px;
        background: #f1f5f9;
        border-radius: 999px;
        overflow: hidden;

        .minimal-fill {
          height: 100%;
          background: var(--draya-primary-600);
          border-radius: 999px;
        }
      }
    }
  }
}

.ai-box {
  grid-column: span 2;
  border: 1px solid #e2e8f0;

  @media (max-width: 1024px) {
    grid-column: span 2;
  }
  @media (max-width: 640px) {
    grid-column: span 1;
  }

  .ai-box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .ai-date {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
    }
  }

  .ai-content {
    flex-grow: 1;
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      font-weight: 500;
    }
  }
}

.topics-box {
  grid-column: span 4;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 1024px) {
    grid-column: span 2;
  }
  @media (max-width: 640px) {
    grid-column: span 1;
  }
}

// ── Shared Utilities ──
.bento-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  
  &.neutral { background: #f1f5f9; color: #475569; }
  &.success { background: #d0fae5; color: #007a55; }
}

.empty-text {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  text-align: center;
  padding: 24px 0;
}

.bento-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: 'Cairo', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: all 150ms ease;

  &.primary {
    background: var(--draya-primary-700);
    color: #ffffff;

    &:hover:not(:disabled) {
      background: var(--draya-primary-800);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// ── Table (Weak Topics) ──
.bento-table-container {
  width: 100%;
  overflow-x: auto;
}

.bento-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;

  th {
    padding: 12px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    border-bottom: 1px solid #f1f5f9;
    white-space: nowrap;
  }

  td {
    padding: 16px;
    font-size: 13px;
    color: #334155;
    border-bottom: 1px solid #f8fafc;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .score-badge {
    display: inline-flex;
    padding: 4px 12px;
    background: #fff1f2;
    color: #e11d48;
    border-radius: 8px;
    font-weight: 800;
    font-size: 12px;
  }
}
`;
fs.writeFileSync(scssPath, scssContent, 'utf8');

console.log('Restored old grid structure with exact top cards from image');
