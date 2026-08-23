const fs = require('fs');
const filePath = 'src/app/features/teacher/classrooms/classroom-detail/components/classroom-exams/classroom-exams.component.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = 
          <a
            [routerLink]="['/teacher/exams', exam.id, 'review']"
            class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-[10px] font-medium text-[#1B6D63] transition-colors hover:border-[#1B6D63] hover:bg-[#1B6D63]/5 active:scale-[0.98]">
            <i class="pi pi-pencil text-sm"></i>
            عرض وتعديل
          </a>;

const replacement = 
          <div class="mt-auto flex w-full gap-2">
            <a
              [routerLink]="['/teacher/exams', exam.id, 'review']"
              class="inline-flex w-1/2 items-center justify-center gap-1.5 rounded-[12px] border border-gray-200 bg-gray-50 px-2 py-[10px] text-sm font-medium text-[#1B6D63] transition-colors hover:border-[#1B6D63] hover:bg-[#1B6D63]/5 active:scale-[0.98]">
              <i class="pi pi-pencil text-xs"></i>
              تعديل
            </a>
            <a
              [routerLink]="['/teacher/exams', exam.id, 'attempts']"
              class="inline-flex w-1/2 items-center justify-center gap-1.5 rounded-[12px] border border-gray-200 bg-gray-50 px-2 py-[10px] text-sm font-medium text-[#7C3AED] transition-colors hover:border-[#7C3AED] hover:bg-[#7C3AED]/5 active:scale-[0.98]">
              <i class="pi pi-users text-xs"></i>
              النتائج
            </a>
          </div>;

content = content.replace(target, replacement);

fs.writeFileSync(filePath, content, 'utf8');