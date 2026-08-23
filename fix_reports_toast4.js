const fs = require('fs');
const filePath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const oldSuccess = "تم اعتماد التقرير بنجاح.";
const newSuccess = "تم اعتماد وإرسال التقرير بنجاح إلى البريد الإلكتروني لولي الأمر.";
content = content.replace(oldSuccess, newSuccess);

fs.writeFileSync(filePath, content, 'utf8');