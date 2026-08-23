const fs = require('fs');
const filePath = 'src/app/features/teacher/teacher-layout.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('TeacherNotificationsService')) {
  content = content.replace(
    "import { LocaleService } from '../../core/locale/locale.service';",
    "import { LocaleService } from '../../core/locale/locale.service';\nimport { TeacherNotificationsService } from './services/teacher-notifications.service';"
  );
  
  content = content.replace(
    "readonly localeService = inject(LocaleService);",
    "readonly localeService = inject(LocaleService);\n  readonly notificationsService = inject(TeacherNotificationsService);\n\n  constructor() {\n    this.notificationsService.startConnections();\n  }"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
}