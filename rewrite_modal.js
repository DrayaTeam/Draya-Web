const fs = require('fs');

const html = <draya-teacher-modal
  [title]="student()?.fullName || 'بيانات الطالب'"
  [isOpen]="isOpen()"
  size="lg"
  (modalClosed)="modalClosed.emit()"
>
  @if (isLoading()) {
    <div class="flex flex-col items-center justify-center py-20">
      <i class="pi pi-spinner pi-spin mb-4 text-4xl text-[#1B6D63]"></i>
      <p class="text-gray-500">جاري تحميل بيانات الطالب...</p>
    </div>
  } @else if (error()) {
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <i class="pi pi-exclamation-triangle text-2xl"></i>
      </div>
      <p class="text-gray-600 font-medium">{{ error() }}</p>
    </div>
  } @else if (student()) {
    <!-- Profile Header -->
    <div class="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
      <div class="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-50 shadow-sm">
        @if (student()?.profilePictureUrl || student()?.pictureUrl) {
          <img
            [src]="student()?.profilePictureUrl || student()?.pictureUrl"
            [alt]="student()?.fullName"
            class="h-full w-full object-cover"
          />
        } @else {
          <div class="flex h-full w-full items-center justify-center bg-[#1B6D63]/10 text-2xl font-bold text-[#1B6D63]">
            {{ student()?.fullName?.charAt(0) || 'ط' }}
          </div>
        }
      </div>
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-gray-900">{{ student()?.fullName }}</h2>
        <div class="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            <i class="pi pi-calendar text-xs"></i>
            تاريخ الانضمام: {{ student()?.enrolledAt | date: 'shortDate' }}
          </span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
            [ngClass]="student()?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            <span class="h-2 w-2 rounded-full" [ngClass]="student()?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'"></span>
            {{ student()?.status === 'Active' ? 'نشط' : 'غير نشط' }}
          </span>
        </div>
      </div>
    </div>

    @if (analytics()) {
      <!-- KPIs -->
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="flex flex-col gap-1 rounded-[16px] border border-gray-100 bg-gray-50 p-5">
          <span class="text-sm font-medium text-gray-500">المتوسط العام</span>
          <div class="flex items-baseline gap-1 text-3xl font-bold text-gray-900">
            {{ analytics()!.overallAverage || 0 | number: '1.0-0' }}<span class="text-lg text-gray-500">%</span>
          </div>
        </div>
        <div class="flex flex-col gap-1 rounded-[16px] border border-[#1B6D63]/10 bg-[#1B6D63]/5 p-5">
          <span class="text-sm font-medium text-[#1B6D63]">أعلى درجة</span>
          <div class="flex items-baseline gap-1 text-3xl font-bold text-[#1B6D63]">
            {{ analytics()!.highestScore || 0 | number: '1.0-0' }}<span class="text-lg opacity-70">%</span>
          </div>
        </div>
        <div class="flex flex-col gap-1 rounded-[16px] border border-[#7C3AED]/10 bg-[#7C3AED]/5 p-5">
          <span class="text-sm font-medium text-[#7C3AED]">الامتحانات المكتملة</span>
          <div class="flex items-baseline gap-1 text-3xl font-bold text-[#7C3AED]">
            {{ analytics()!.completedExams || 0 }}
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Weak Topics -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg font-bold text-gray-900">نقاط الضعف</h3>
          
          @if (analytics()!.weakTopics?.length) {
            <div class="flex flex-col gap-3">
              @for (topic of analytics()!.weakTopics; track topic.topicName) {
                <div class="rounded-[12px] border border-red-100 bg-red-50 p-4">
                  <div class="mb-2 flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-gray-900">{{ topic.topicName }}</h4>
                      <p class="text-xs text-gray-500">{{ topic.subjectName }}</p>
                    </div>
                    <span class="rounded-[8px] bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      {{ topic.accuracyPercentage || 0 | number: '1.0-0' }}%
                    </span>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-red-200">
                    <div class="h-full bg-red-500" [style.width]="(topic.accuracyPercentage || 0) + '%'"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex h-32 flex-col items-center justify-center rounded-[12px] border border-dashed border-gray-200 bg-gray-50 text-center">
              <span class="mb-2 text-2xl">🎉</span>
              <p class="text-sm font-medium text-gray-500">لا توجد نقاط ضعف بارزة</p>
            </div>
          }
        </div>

        <!-- Subject Proficiencies -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg font-bold text-gray-900">أداء المواد</h3>
          
          @if (analytics()!.subjectProficiencies?.length) {
            <div class="flex flex-col gap-4">
              @for (subject of analytics()!.subjectProficiencies; track subject.subjectName) {
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-bold text-gray-700">{{ subject.subjectName }}</span>
                    <span class="font-bold text-gray-900">{{ subject.proficiencyPercent || 0 | number: '1.0-0' }}%</span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div class="h-full rounded-full transition-all"
                         [ngClass]="(subject.proficiencyPercent || 0) >= 85 ? 'bg-[#1B6D63]' : (subject.proficiencyPercent || 0) >= 65 ? 'bg-yellow-400' : 'bg-red-500'"
                         [style.width]="(subject.proficiencyPercent || 0) + '%'"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex h-32 flex-col items-center justify-center rounded-[12px] border border-dashed border-gray-200 bg-gray-50 text-center">
              <i class="pi pi-chart-bar mb-2 text-xl text-gray-300"></i>
              <p class="text-sm font-medium text-gray-500">لا توجد بيانات للمواد</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- Empty State / No Analytics -->
      <div class="mt-4 flex flex-col items-center justify-center rounded-[16px] border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <i class="pi pi-chart-line text-2xl text-gray-400"></i>
        </div>
        <h3 class="mb-2 text-lg font-bold text-gray-900">لا توجد تحليلات</h3>
        <p class="text-gray-500">هذا الطالب لم يقم بإجراء أي امتحانات حتى الآن، لذا لا توجد بيانات أداء لعرضها.</p>
      </div>
    }
  }
</draya-teacher-modal>
;
fs.writeFileSync('src/app/features/teacher/classrooms/classroom-detail/components/student-details-modal/student-details-modal.component.html', html, 'utf8');