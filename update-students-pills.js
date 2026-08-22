const fs = require('fs');
const file = 'src/app/features/teacher/students/teacher-students/teacher-students.component.html';
let content = fs.readFileSync(file, 'utf8');

// Replace rounded-full with rounded-[12px] on the classroom pills
content = content.replace(/class="classroom-pill rounded-full border px-4 py-2 text-sm font-medium transition-colors"/g, 'class="classroom-pill rounded-[12px] border px-4 py-2 text-sm font-medium transition-colors"');

fs.writeFileSync(file, content);
console.log('Done!');
