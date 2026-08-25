const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// fix selectedStudent()?.id -> selectedStudent()?.studentId
htmlContent = htmlContent.replace(/selectedStudent\(\)\?\.id/g, 'selectedStudent()?.studentId');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Fixed selectedStudent id');
