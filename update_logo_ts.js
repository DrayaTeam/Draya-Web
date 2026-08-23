const fs = require('fs');
const path = 'src/app/shared/components/logo/logo.component.ts';
let content = fs.readFileSync(path, 'utf8');

const defaultWordWithTashkeel = Buffer.from('2K/Ysdin2YrZjtip', 'base64').toString('utf8'); // درايَة
const newWord = Buffer.from('2K/Ysdin2YrYqQ==', 'base64').toString('utf8'); // دراية

content = content.replace(`titleText = input<string>('${defaultWordWithTashkeel}')`, `titleText = input<string>('${newWord}')`);
// Also check for the comment
const commentWord = Buffer.from('2K/Ysdin2YrZjtip', 'base64').toString('utf8');
content = content.replace(`"${commentWord}"`, `"${newWord}"`);

fs.writeFileSync(path, content, 'utf8');