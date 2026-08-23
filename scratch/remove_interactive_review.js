const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';
const tsPath = 'src/app/features/teacher/reports/teacher-reports.component.ts';

// 1. HTML modifications
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Remove buttons
const buttonsStart = htmlContent.indexOf('<div class="mt-auto pt-5 flex gap-3 border-t border-[var(--draya-neutral-100)]">');
const buttonsEnd = htmlContent.indexOf('</div>', htmlContent.indexOf('</button>', htmlContent.indexOf('</button>', buttonsStart) + 9) + 9) + 6;

if (buttonsStart !== -1 && buttonsEnd !== -1) {
    htmlContent = htmlContent.substring(0, buttonsStart) + htmlContent.substring(buttonsEnd);
}

// Remove modal
const modalMarker = '<!-- Interactive Review Modal -->';
const modalIndex = htmlContent.indexOf(modalMarker);
if (modalIndex !== -1) {
    htmlContent = htmlContent.substring(0, modalIndex);
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Cleaned up HTML');

// 2. TS modifications
let tsContent = fs.readFileSync(tsPath, 'utf8');

// Remove modal states
tsContent = tsContent.replace(/readonly showReviewModal = signal<boolean>\(false\);\s*readonly reviewModalData = signal<\{topic: string; data: InteractiveReviewDto \| null\}>\(\{topic: '', data: null\}\);\s*readonly isLoadingReview = signal<boolean>\(false\);\s*readonly reviewError = signal<string \| null>\(null\);/g, '');
tsContent = tsContent.replace(/\/\/ Modals\s*/g, '');

// Remove methods
const methodsRegex = /openInteractiveReview\(topicName: string\): void \{[\s\S]*?generatePracticeExam\(topicName: string\): void \{[\s\S]*?\}\s*\}\s*approveReport\(\)/g;
tsContent = tsContent.replace(methodsRegex, 'approveReport()');

fs.writeFileSync(tsPath, tsContent, 'utf8');
console.log('Cleaned up TS');
