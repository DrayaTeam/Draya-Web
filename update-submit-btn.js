const fs = require('fs');
const file = 'src/app/features/teacher/exams/generate-exam/generate-exam.component.html';
let content = fs.readFileSync(file, 'utf8');

const oldClass = 'class="flex items-center gap-2 rounded-xl bg-[#1B6D63] px-8 py-3 font-medium text-white transition-all hover:bg-[#0f4f49] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"';
const newClass = 'class="flex items-center gap-2 rounded-[12px] bg-[#1B6D63] px-8 py-[10px] font-medium text-white transition-all hover:bg-[#0f4f49] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"';

content = content.replace(oldClass, newClass);

fs.writeFileSync(file, content);
console.log('Done!');
