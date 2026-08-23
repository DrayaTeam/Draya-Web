const fs = require('fs');
const file = 'src/app/features/teacher/exams/generate-exam/generate-exam.component.html';
let content = fs.readFileSync(file, 'utf8');

const newTitle = `<div class="flex items-center gap-4 mb-8">
    <div class="bg-[#7C3AED]/10 text-[#7C3AED] flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
      <i class="pi pi-sparkles text-2xl"></i>
    </div>
    <div>
      <h1 class="m-0 text-3xl font-bold text-[#7C3AED]">توليد امتحان بالذكاء الاصطناعي</h1>
      <p class="m-0 mt-1 text-gray-500">
        قم بتعبئة النموذج التالي وسيقوم الذكاء الاصطناعي بتوليد امتحان مخصص بناءً على المحتوى الخاص بك.
      </p>
    </div>
  </div>`;

content = content.replace(/<div class="mb-8">\s*<h1 class="mb-2 text-2xl font-bold text-gray-900">[^<]+<\/h1>\s*<p class="text-gray-600">\s*[^<]+\s*<\/p>\s*<\/div>/g, newTitle);

const newFormStart = `<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
    <div class="mb-6 border-b border-gray-100 pb-4">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <i class="pi pi-sliders-h text-[#7C3AED]"></i>
        إعدادات ومعايير الامتحان
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        حدد المحتوى والمستوى المطلوب وسنتولى إنشاء الأسئلة نيابة عنك.
      </p>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">`;

content = content.replace(/<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">\s*<form \[formGroup\]="form" \(ngSubmit\)="onSubmit\(\)" class="space-y-8">/g, newFormStart);

fs.writeFileSync(file, content);
console.log('Done with regex!');
