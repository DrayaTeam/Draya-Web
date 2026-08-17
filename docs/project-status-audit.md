# Project Status & Tech Debt Audit

## Hardcoded Arabic Strings (Pending `ngx-translate` Migration)

### Dashboard Component
- (Previous items recorded during dashboard creation...)

### ClassroomStudentsComponent
- Table Headers: `اسم الطالب`, `تاريخ الانضمام`, `حالة الطالب`, `إجراءات`
- Status Labels: `نشط`
- Empty State: `لا يوجد طلبة مقيدين في هذه المجموعة حتى الآن.`
- Confirmation Dialog: 
  - Message: `هل أنت متأكد من إزالة الطالب ${student.fullName} من هذه المجموعة؟`
  - Header: `تأكيد الإزالة`
  - Accept Label: `نعم، إزالة`
  - Reject Label: `إلغاء`
- Success Toast: `تم بنجاح`, `تمت إزالة الطالب من المجموعة.`
- Error Toast: `خطأ`, `حدث خطأ أثناء إزالة الطالب. يرجى المحاولة مرة أخرى.`

### ClassroomQaComponent & ClassroomQaDetailModalComponent
- Hardcoded Arabic strings throughout templates and TS files (e.g., `'طرح سؤال جديد'`, `'لا توجد أسئلة حالياً.'`, `'مجاب عليه'`, `'تم إضافة الرد بنجاح'`) instead of `ngx-translate` keys.
