const fs = require('fs');
const filePath = 'src/app/features/teacher/reports/teacher-reports.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

const oldSuccess = "تم اعتماد التقرير بنجاح.";
const newSuccess = "تم اعتماد وإرسال التقرير بنجاح إلى البريد الإلكتروني لولي الأمر.";
content = content.replace(oldSuccess, newSuccess);

const oldError = "console.error('Failed to approve report', err);\r\n        this.isApproving.set(false);";
const newError = oldError + "\r\n        this.messageService.add({\r\n          severity: 'error',\r\n          summary: 'خطأ',\r\n          detail: err?.error?.message || 'حدث خطأ أثناء إرسال التقرير لولي الأمر.'\r\n        });";
content = content.replace(oldError, newError);

const oldErrorLnx = "console.error('Failed to approve report', err);\n        this.isApproving.set(false);";
const newErrorLnx = oldErrorLnx + "\n        this.messageService.add({\n          severity: 'error',\n          summary: 'خطأ',\n          detail: err?.error?.message || 'حدث خطأ أثناء إرسال التقرير لولي الأمر.'\n        });";
content = content.replace(oldErrorLnx, newErrorLnx);


fs.writeFileSync(filePath, content, 'utf8');