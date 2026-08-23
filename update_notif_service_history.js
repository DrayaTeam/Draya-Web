const fs = require('fs');
const filePath = 'src/app/features/teacher/services/teacher-notifications.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { signal, computed }')) {
  content = content.replace("import { Injectable, inject, DestroyRef }", "import { Injectable, inject, DestroyRef, signal, computed }");
  
  const interfaceString = `\nexport interface TeacherNotificationItem {\n  id: string;\n  title: string;\n  message: string;\n  time: Date;\n  read: boolean;\n  type: 'report' | 'risk' | 'material';\n}\n\n@Injectable`;
  
  content = content.replace("@Injectable", interfaceString);
  
  const signals = `
  private reportsConnection: HubConnection | null = null;
  private materialsConnection: HubConnection | null = null;

  private readonly _notifications = signal<TeacherNotificationItem[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter(n => !n.read).length);

  markAllAsRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  addNotification(type: 'report' | 'risk' | 'material', title: string, message: string): void {
    const newNotif: TeacherNotificationItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: new Date(),
      read: false,
      type
    };
    this._notifications.update(list => [newNotif, ...list]);
  }`;

  content = content.replace(
    "private reportsConnection: HubConnection | null = null;\n  private materialsConnection: HubConnection | null = null;",
    signals
  );
  
  content = content.replace(
    "detail: 'تم إنهاء تقرير الأداء للطالب. يمكنك الآن مراجعته.',",
    "detail: 'تم إنهاء تقرير الأداء للطالب. يمكنك الآن مراجعته.',"
  );
  
  content = content.replace(
    "this.messageService.add({",
    "this.addNotification('report', 'تقرير جديد', 'تم إنهاء تقرير الأداء للطالب. يمكنك الآن مراجعته.');\n      this.messageService.add({"
  );
  
  content = content.replace(
    "this.messageService.add({\n        severity: 'error',\n        summary: 'تنبيه: تراجع مستوى طالب'",
    "this.addNotification('risk', 'تراجع مستوى طالب', 'تم رصد تراجع خطير في أداء أحد الطلاب في موضوع: ' + payload.topicName + '.');\n      this.messageService.add({\n        severity: 'error',\n        summary: 'تنبيه: تراجع مستوى طالب'"
  );
  
  content = content.replace(
    "this.messageService.add({\n          severity: 'success',\n          summary: 'معالجة المادة'",
    "this.addNotification('material', 'معالجة المادة', 'تمت معالجة المادة التعليمية بنجاح بنظام الذكاء الاصطناعي.');\n        this.messageService.add({\n          severity: 'success',\n          summary: 'معالجة المادة'"
  );

  content = content.replace(
    "this.messageService.add({\n          severity: 'error',\n          summary: 'فشل معالجة المادة'",
    "this.addNotification('material', 'فشل معالجة المادة', 'حدث خطأ أثناء معالجة المادة التعليمية: ' + payload.message);\n        this.messageService.add({\n          severity: 'error',\n          summary: 'فشل معالجة المادة'"
  );

  fs.writeFileSync(filePath, content, 'utf8');
}