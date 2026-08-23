const fs = require('fs');
const file = 'src/app/features/teacher/channel/teacher-channel.component.scss';
let content = fs.readFileSync(file, 'utf8');

// We will remove the .classroom-pill block
const regex = /\/\* Classroom Selector Pills[\s\S]*?\.classroom-pill \{[\s\S]*?\}\s*\}/g;
content = content.replace(regex, '');

fs.writeFileSync(file, content);
console.log('Done!');
