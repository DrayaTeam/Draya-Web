const fs = require('fs');
const tsPath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';

let tsContent = fs.readFileSync(tsPath, 'utf8');
tsContent = tsContent.replace(
  /import { DropdownModule } from 'primeng\/dropdown';/g,
  "import { SelectModule } from 'primeng/select';",
);
tsContent = tsContent.replace(/DropdownModule/g, 'SelectModule');

// fix student.id to student.studentId
tsContent = tsContent.replace(/student\.id/g, 'student.studentId');

// fix subjectId error
// I'll leave subjectId as an empty string since we don't have it on the classroom dto
tsContent = tsContent.replace(
  /const subjectId = this\.selectedClassroom\(\)\?\.subjectId \|\| '';/g,
  "const subjectId = ''; // TODO: get real subjectId if needed",
);

fs.writeFileSync(tsPath, tsContent, 'utf8');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');
htmlContent = htmlContent.replace(/<p-dropdown/g, '<p-select');
htmlContent = htmlContent.replace(/<\/p-dropdown>/g, '</p-select>');

// Also student.id -> student.studentId in the html
htmlContent = htmlContent.replace(/student\.id/g, 'student.studentId');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Fixed component errors');
