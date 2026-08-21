const fs = require('fs');
let path = 'src/app/features/teacher/classrooms/classroom-detail/classroom-detail.component.html';
let content = fs.readFileSync(path, 'utf8');

// Insert tab button
let newTab = `
        <button
          class="tab-btn"
          [class.tab-active]="activeTab() === 4"
          (click)="activeTab.set(4)"
          role="tab">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          الامتحانات
        </button>`;

content = content.replace(/(activeTab\(\) === 3[\s\S]*?<\/svg>[\s\S]*?<\/button>)/, '$1' + newTab);

// Insert tab panel
let newPanel = `
        @if (activeTab() === 4) {
          @if (classroom()?.classroomId) {
            <draya-classroom-exams
              [classroomId]="classroom()!.classroomId"></draya-classroom-exams>
          }
        }`;

content = content.replace(/(activeTab\(\) === 3[\s\S]*?<\/div>\s*})/, '$1' + newPanel);

fs.writeFileSync(path, content);
console.log("Done");
