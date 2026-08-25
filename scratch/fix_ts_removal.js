const fs = require('fs');
const tsPath = 'src/app/features/teacher/reports/teacher-reports.component.ts';

let tsContent = fs.readFileSync(tsPath, 'utf8');

const startIdx = tsContent.indexOf('openInteractiveReview(topicName: string): void {');
const endIdx = tsContent.lastIndexOf('}'); // the end of the class is at the end of the file

if (startIdx !== -1) {
  // Delete from openInteractiveReview to the end of the class, leaving the final '}'
  tsContent = tsContent.substring(0, startIdx) + '}\n';
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log('Removed methods successfully');
} else {
  console.log('Could not find methods');
}
