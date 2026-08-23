const fs = require('fs');
const filePathHTML = 'src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.html';
let contentHTML = fs.readFileSync(filePathHTML, 'utf8');

const notifLabel = Buffer.from('2KfZhNil2LTYudin2LHYp9iq', 'base64').toString('utf8');
const noNotif = Buffer.from('2YTYpyDYqtmI2KzYryDYpdmS2LTYudin2LHYp9iqINit2KfZhNmK2Ksu', 'base64').toString('utf8');

contentHTML = contentHTML.replace('ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ', notifLabel);
contentHTML = contentHTML.replace('ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ', notifLabel);
contentHTML = contentHTML.replace('ظ„ط§ طھظˆط¬ط¯ ط¥ط´ط¹ط§ط±ط§طھ ط­ط§ظ„ظٹط§ظ‹.', noNotif);

fs.writeFileSync(filePathHTML, contentHTML, 'utf8');