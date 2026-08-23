const fs = require('fs');
const filePathTS = 'src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.ts';
let contentTS = fs.readFileSync(filePathTS, 'utf8');

contentTS = contentTS.replace(
  "import { TeacherNotificationsService } from '../../../../services/teacher-notifications.service';",
  "import { TeacherNotificationsService } from '../../../services/teacher-notifications.service';"
);

fs.writeFileSync(filePathTS, contentTS, 'utf8');