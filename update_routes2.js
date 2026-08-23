const fs = require('fs');
const filePath = 'src/app/features/teacher/teacher.routes.ts';
let content = fs.readFileSync(filePath, 'utf8');

const newRoute = "\n      {\n        path: 'exams/:id/attempts',\n        loadComponent: () =>\n          import('./exams/exam-attempts/exam-attempts.component').then((m) => m.ExamAttemptsComponent),\n        title: 'نتائج الامتحان — درايَة',\n      },";

const searchStr = "path: 'exams/:id/review',";
const index = content.indexOf(searchStr);

if (index !== -1) {
  const endOfBlock = content.indexOf('},', index) + 2;
  const before = content.substring(0, endOfBlock);
  const after = content.substring(endOfBlock);
  
  content = before + newRoute + after;
  fs.writeFileSync(filePath, content, 'utf8');
} else {
  console.log("Could not find the target route.");
}