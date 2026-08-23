const fs = require('fs');
const modelPath = 'src/app/core/models/teacher-exam.model.ts';
let content = fs.readFileSync(modelPath, 'utf8');

content += \n\nexport interface ExamAttemptDto {
  id: string;
  studentId: string;
  studentName: string;
  finalScore: number;
  submittedAt: string;
}\n;

fs.writeFileSync(modelPath, content, 'utf8');