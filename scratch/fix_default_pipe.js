const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Regex to remove ` | default: 'some text'`
htmlContent = htmlContent.replace(/\s*\|\s*default:\s*'.*?'/g, '');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Removed default pipe');
