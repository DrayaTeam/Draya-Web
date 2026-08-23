const fs = require('fs');
const filePath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/detail: res\?.message \|\| '.*',/g, "detail: res?.message || 'تم اعتماد وإرسال التقرير بنجاح إلى البريد الإلكتروني لولي الأمر.',");
content = content.replace(/error: \(err\) => \{[\s\S]*?console.error/g, "error: (err) => {\n        this.messageService.add({\n          severity: 'error',\n          summary: 'خطأ',\n          detail: err?.error?.message || 'حدث خطأ أثناء إرسال التقرير.'\n        });\n        console.error");
content = content.replace(/summary: '.*?',/g, "summary: 'نجاح',");
// Wait, the error summary was also corrupted. 

fs.writeFileSync(filePath, content, 'utf8');