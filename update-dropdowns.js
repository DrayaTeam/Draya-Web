const fs = require('fs');
const file = 'src/app/features/teacher/exams/generate-exam/generate-exam.component.html';
let content = fs.readFileSync(file, 'utf8');

const oldOptionClass = "'!rounded-lg !my-1 hover:!bg-[#f0f9f8] hover:!text-[#1B6D63] transition-colors'";
const newOptionClass = "'!rounded-lg !my-1 !py-2.5 !px-4 hover:!bg-[#f0f9f8] hover:!text-[#1B6D63] transition-colors'";

content = content.split(oldOptionClass).join(newOptionClass);

fs.writeFileSync(file, content);
console.log('Done!');
