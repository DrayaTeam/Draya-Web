const fs = require('fs');
const filePath = 'src/app/features/teacher/exams/exam-attempts/exam-attempts.component.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("from '../../../../services/teacher-exam.service'", "from '../../services/teacher-exam.service'");
content = content.replace("from '../../../../../core/models/teacher-exam.model'", "from '../../../../core/models/teacher-exam.model'");
content = content.replace("from '../../../../../core/models/student-roster.model'", "from '../../../../core/models/student-roster.model'");

fs.writeFileSync(filePath, content, 'utf8');