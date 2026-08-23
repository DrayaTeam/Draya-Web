const fs = require('fs');
const file = 'src/app/features/teacher/exams/generate-exam/generate-exam.component.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('<h1 class="m-0 text-3xl font-bold text-[#7C3AED]">', '<h1 class="m-0 text-3xl font-bold text-teal-700">');
content = content.replace('<div class="bg-[#7C3AED]/10 text-[#7C3AED] flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">', '<div class="bg-teal-50 text-teal-600 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">');

fs.writeFileSync(file, content);
console.log('Done!');
