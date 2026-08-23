const fs = require('fs');
const filePath = 'src/app/features/teacher/services/teacher-exam.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

// import ExamAttemptDto
content = content.replace("GeneratedQuestionDto,", "GeneratedQuestionDto,\n  ExamAttemptDto,");

// add getExamAttempts
const newMethod = "\n  getExamAttempts(examId: string, page = 1, pageSize = 50): Observable<{ items: ExamAttemptDto[]; totalCount: number }> {\n    return this.http.get<{ items: ExamAttemptDto[]; totalCount: number }>(${this.baseUrl}//attempts?page=&pageSize=);\n  }\n";

content = content.replace("export class TeacherExamService {", "export class TeacherExamService {" + newMethod);

fs.writeFileSync(filePath, content, 'utf8');