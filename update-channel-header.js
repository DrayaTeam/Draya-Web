const fs = require('fs');
const file = 'src/app/features/teacher/channel/teacher-channel.component.html';
let content = fs.readFileSync(file, 'utf8');

const newHeader = `<header class="channel-header mb-8">
    <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div class="flex items-center gap-4">
        <div class="bg-teal-50 text-teal-600 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
          <i class="pi pi-comments text-2xl"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h1 class="m-0 text-3xl font-bold text-teal-700">قناة التواصل المباشر مع الطلبة</h1>
            <div class="inline-flex items-center gap-1.5 rounded-full bg-[#1B6D63]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1B6D63]">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1B6D63]"></span>
              <span>بث مباشر ومناقشات</span>
            </div>
          </div>
          <p class="m-0 mt-1 text-gray-500">
            أداة تفاعلية سريعة تتيح لك نشر إعلانات هامة، توجيه أسئلة سريعة للطلاب، أو بدء حوار مفتوح للإجابة عن استفساراتهم حول المواد الدراسية.
          </p>
        </div>
      </div>
    </div>
  </header>`;

content = content.replace(/<header class="channel-header mb-6">[\s\S]*?<\/header>/, newHeader);

fs.writeFileSync(file, content);
console.log('Done!');
