const fs = require('fs');
const htmlPath = 'src/app/features/teacher/reports/teacher-reports.component.html';

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. Top bar icon
htmlContent = htmlContent.replace(
  'h-10 w-10 rounded-lg bg-[var(--draya-neutral-50)] flex items-center justify-center text-[var(--draya-neutral-700)] border border-[var(--draya-neutral-200)]',
  'h-10 w-10 rounded-lg bg-[var(--draya-primary-50)] flex items-center justify-center text-[var(--draya-primary-700)] border border-[var(--draya-primary-100)]',
);

// 2. Classroom badge
htmlContent = htmlContent.replace(
  'px-2.5 py-0.5 bg-[var(--draya-neutral-50)] rounded-md text-xs font-semibold text-[var(--draya-neutral-600)] border border-[var(--draya-neutral-200)]',
  'px-2.5 py-0.5 bg-[var(--draya-primary-50)] rounded-md text-xs font-semibold text-[var(--draya-primary-700)] border border-[var(--draya-primary-100)]',
);

// 3. Stats Icons (change from neutral to primary)
htmlContent = htmlContent.replace(
  /w-10 h-10 rounded-lg bg-\[var\(--draya-neutral-50\)\] text-\[var\(--draya-neutral-500\)\] flex items-center justify-center border border-\[var\(--draya-neutral-200\)\]/g,
  'w-10 h-10 rounded-lg bg-[var(--draya-primary-50)] text-[var(--draya-primary-600)] flex items-center justify-center border border-[var(--draya-primary-100)]',
);

// 4. Progress Bars
htmlContent = htmlContent.replace(
  'h-full rounded-full bg-[var(--draya-neutral-800)]',
  'h-full rounded-full bg-[var(--draya-primary-500)]',
);

// 5. Latest report AI badge
htmlContent = htmlContent.replace(
  'inline-block px-2 py-0.5 bg-[var(--draya-neutral-100)] text-[var(--draya-neutral-600)] rounded text-[10px] font-bold uppercase tracking-wide mb-2 border border-[var(--draya-neutral-200)]',
  'inline-block px-2 py-0.5 bg-[var(--draya-ai-50)] text-[var(--draya-ai-700)] rounded text-[10px] font-bold uppercase tracking-wide mb-2 border border-[var(--draya-ai-100)]',
);

// 6. Approve Report button
htmlContent = htmlContent.replace(
  'w-full py-3 rounded-xl font-bold text-white bg-[var(--draya-neutral-900)] hover:bg-[var(--draya-neutral-800)]',
  'w-full py-3 rounded-xl font-bold text-white bg-[var(--draya-primary-700)] hover:bg-[var(--draya-primary-800)]',
);

// 7. Weak Topics Subject badge
htmlContent = htmlContent.replace(
  /inline-block px-2 py-0.5 bg-\[var\(--draya-neutral-50\)\] text-\[var\(--draya-neutral-600\)\] rounded-md text-xs font-semibold mb-2 border border-\[var\(--draya-neutral-200\)\]/g,
  'inline-block px-2 py-0.5 bg-[var(--draya-primary-50)] text-[var(--draya-primary-700)] rounded-md text-xs font-semibold mb-2 border border-[var(--draya-primary-100)]',
);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Restored primary green colors');
