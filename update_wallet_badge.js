const fs = require('fs');
const filePathHTML = 'src/app/features/teacher/wallet/components/wallet-balance-card/wallet-balance-card.component.html';
let contentHTML = fs.readFileSync(filePathHTML, 'utf8');

const badgeArabic = Buffer.from('2KXYrNmF2KfZhNmKINin2YTYo9ix2KjYp9it', 'base64').toString('utf8'); // إجمالي الأرباح

contentHTML = contentHTML.replace(
  `{{ 'TEACHER.WALLET.AI_BALANCE.AVAILABLE_FOR_WITHDRAWAL' | translate }}`,
  badgeArabic
);

fs.writeFileSync(filePathHTML, contentHTML, 'utf8');