const fs = require('fs');
const file = 'src/app/features/teacher/exams/generate-exam/generate-exam.component.html';
let content = fs.readFileSync(file, 'utf8');

const oldTopupClass = 'class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] active:scale-[0.98]"';
const newTopupClass = 'class="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#7C3AED] py-[10px] text-sm font-semibold text-white transition-all hover:bg-[#6D28D9] active:scale-[0.98]"';

content = content.replace(oldTopupClass, newTopupClass);

fs.writeFileSync(file, content);
console.log('Done!');
