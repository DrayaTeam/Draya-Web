const fs = require('fs');
const filePath = 'src/app/features/teacher/teacher.routes.ts';
let content = fs.readFileSync(filePath, 'utf8');

const target = 
      {
        path: 'exams/:id/review',
        loadComponent: () =>
          import('./exams/review-exam/review-exam.component').then((m) => m.ReviewExamComponent),
        title: 'مراجعة الامتحان — درايَة',
      },;

const newRoute = 
      {
        path: 'exams/:id/attempts',
        loadComponent: () =>
          import('./exams/exam-attempts/exam-attempts.component').then((m) => m.ExamAttemptsComponent),
        title: 'نتائج الامتحان — درايَة',
      },;

// We use indexOf and substring to insert it.
const searchStr = "path: 'exams/:id/review',";
const index = content.indexOf(searchStr);

if (index !== -1) {
  // find the end of this block
  const endOfBlock = content.indexOf('},', index) + 2;
  const before = content.substring(0, endOfBlock);
  const after = content.substring(endOfBlock);
  
  content = before + newRoute + after;
  fs.writeFileSync(filePath, content, 'utf8');
} else {
  console.log("Could not find the target route.");
}