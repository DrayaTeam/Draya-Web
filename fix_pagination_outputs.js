const fs = require('fs');
const filePath = 'src/app/features/teacher/exams/exam-attempts/exam-attempts.component.html';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("(pageChanged)=", "(pageChange)=");
content = content.replace("(pageSizeChanged)=", "(pageSizeChange)=");

fs.writeFileSync(filePath, content, 'utf8');