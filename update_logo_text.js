const fs = require('fs');
const path = 'src/app/features/teacher/components/teacher-sidebar/teacher-sidebar.component.html';
let content = fs.readFileSync(path, 'utf8');

const oldWord = Buffer.from('2K/Ysdin2YrYpw==', 'base64').toString('utf8'); // درايا
const newWord = Buffer.from('2K/Ysdin2YrYqQ==', 'base64').toString('utf8'); // دراية

content = content.replace(`titleText="${oldWord}"`, `titleText="${newWord}"`);

fs.writeFileSync(path, content, 'utf8');