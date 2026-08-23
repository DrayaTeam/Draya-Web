const fs = require('fs');
const filePath = 'src/app/features/teacher/exams/exam-attempts/exam-attempts.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("import { PaginationComponent }", "import { DrayaPaginationComponent }");
content = content.replace("PaginationComponent]", "DrayaPaginationComponent]");

fs.writeFileSync(filePath, content, 'utf8');