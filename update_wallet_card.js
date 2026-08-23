const fs = require('fs');
const filePathHTML = 'src/app/features/teacher/wallet/components/wallet-balance-card/wallet-balance-card.component.html';
let contentHTML = fs.readFileSync(filePathHTML, 'utf8');

const newDiv = `      <div class="flex items-baseline gap-2">
        <span class="text-5xl font-black text-gray-900 tracking-tight">{{ balance()?.availableEarnedBalance ?? 0 }}</span>
        <span class="text-lg font-medium text-gray-400">{{ 'ADMIN.DASHBOARD.CURRENCY' | translate }}</span>
      </div>
      @if ((balance()?.earnedBalance ?? 0) > (balance()?.availableEarnedBalance ?? 0)) {
        <div class="mt-3 flex items-center gap-3 text-sm">
          <span class="text-gray-500 font-medium">الرصيد الكلي: <span class="text-gray-900">{{ balance()?.earnedBalance }} ج.م</span></span>
          <span class="text-amber-500 font-medium bg-amber-50 px-2 py-1 rounded-[6px] border border-amber-100">
            قيد المراجعة: {{ (balance()?.earnedBalance ?? 0) - (balance()?.availableEarnedBalance ?? 0) }} ج.م
          </span>
        </div>
      }`;

contentHTML = contentHTML.replace(
  `<div class="flex items-baseline gap-2">\r\n        <span class="text-5xl font-black text-gray-900 tracking-tight">{{ balance()?.availableEarnedBalance ?? 0 }}</span>\r\n        <span class="text-lg font-medium text-gray-400">{{ 'ADMIN.DASHBOARD.CURRENCY' | translate }}</span>\r\n      </div>`,
  newDiv
);

// also handle LF instead of CRLF just in case
contentHTML = contentHTML.replace(
  `<div class="flex items-baseline gap-2">\n        <span class="text-5xl font-black text-gray-900 tracking-tight">{{ balance()?.availableEarnedBalance ?? 0 }}</span>\n        <span class="text-lg font-medium text-gray-400">{{ 'ADMIN.DASHBOARD.CURRENCY' | translate }}</span>\n      </div>`,
  newDiv
);

fs.writeFileSync(filePathHTML, contentHTML, 'utf8');