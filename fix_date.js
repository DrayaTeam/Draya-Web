const fs = require('fs');
const filePath = 'src/app/features/teacher/exams/exam-attempts/exam-attempts.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("enrolledAt: new Date(attempt.submittedAt)", "enrolledAt: attempt.submittedAt");

fs.writeFileSync(filePath, content, 'utf8');