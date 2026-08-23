const fs = require('fs');
const modelPath = 'src/app/core/models/teacher-exam.model.ts';
let content = fs.readFileSync(modelPath, 'utf8');

content += "\n\nexport interface ExamAttemptDto {\n  id: string;\n  studentId: string;\n  studentName: string;\n  finalScore: number;\n  submittedAt: string;\n}\n";

fs.writeFileSync(modelPath, content, 'utf8');