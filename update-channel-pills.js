const fs = require('fs');
const file = 'src/app/features/teacher/channel/teacher-channel.component.html';
let content = fs.readFileSync(file, 'utf8');

const newSection = `    <!-- Classroom Subject Selector Pills -->
    <section
      class="classrooms-selector mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center gap-3 border-b border-gray-100 pb-2">
        <div class="text-gray-500">
          <i class="pi pi-users text-lg"></i>
        </div>
        <span class="font-bold text-gray-700">تصفية حسب الصف</span>
        <span class="rounded-full bg-[#1B6D63]/10 px-2 py-0.5 text-xs font-semibold text-[#1B6D63]">
          {{ classrooms().length }} فصل
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        @for (c of classrooms(); track c.classroomId) {
          <button
            type="button"
            class="classroom-pill rounded-[12px] border px-4 py-2 text-sm font-medium transition-colors"
            [ngClass]="
              selectedClassroomId() === c.classroomId
                ? 'border-[#1B6D63] bg-[#1B6D63] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            "
            (click)="selectClassroom(c.classroomId)">
            <span class="pill-text">{{ c.name }}</span>
          </button>
        }
      </div>
    </section>`;

content = content.replace(/<!-- Classroom Subject Selector Pills -->[\s\S]*?<\/section>/, newSection);

fs.writeFileSync(file, content);
console.log('Done!');
