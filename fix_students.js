const fs = require('fs');
const filePath = 'src/app/features/teacher/classrooms/classroom-detail/components/classroom-students/classroom-students.component.html';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('<ng-template pTemplate="body" let-student>\r\n        <tr>', '<ng-template pTemplate="body" let-student>\r\n        <tr (click)="openStudentDetails(student)" class="cursor-pointer hover:bg-gray-50 transition-colors">');
content = content.replace('<ng-template pTemplate="body" let-student>\n        <tr>', '<ng-template pTemplate="body" let-student>\n        <tr (click)="openStudentDetails(student)" class="cursor-pointer hover:bg-gray-50 transition-colors">');

content = content.replace('(click)="openRemoveModal(student)"', '(click)="openRemoveModal(student, $event)"');

content += '\n<draya-student-details-modal\n  [isOpen]="isDetailsModalOpen()"\n  [student]="selectedStudentForDetails()"\n  (modalClosed)="closeStudentDetails()"\n></draya-student-details-modal>\n';

fs.writeFileSync(filePath, content, 'utf8');