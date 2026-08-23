const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, '../src/assets/i18n/ar.json');
const enPath = path.join(__dirname, '../src/assets/i18n/en.json');

const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

if (ar.TEACHER && ar.TEACHER.REPORTS) {
    ar.TEACHER.REPORTS.SELECT_STUDENT = "اختر الطالب";
}
if (en.TEACHER && en.TEACHER.REPORTS) {
    en.TEACHER.REPORTS.SELECT_STUDENT = "Select Student";
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log("Added SELECT_STUDENT translation!");
