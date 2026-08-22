const fs = require('fs');

const arFile = 'src/assets/i18n/ar.json';
let arContent = fs.readFileSync(arFile, 'utf8');
arContent = arContent.replace(/"CHANNEL": "القناة"/, '"CHANNEL": "الاسئلة و النقاش"');
fs.writeFileSync(arFile, arContent);

const htmlFile = 'src/app/features/teacher/channel/teacher-channel.component.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');
htmlContent = htmlContent.replace(/<h1 class="m-0 text-3xl font-bold text-teal-700">قناة التواصل المباشر مع الطلبة<\/h1>/g, '<h1 class="m-0 text-3xl font-bold text-teal-700">الاسئلة و النقاش</h1>');
fs.writeFileSync(htmlFile, htmlContent);

console.log('Done!');
