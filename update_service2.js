const fs = require('fs');
const filePath = 'src/app/features/teacher/services/teacher-exam.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

const searchStr = 'return this.http.get<{ items: ExamAttemptDto[]; totalCount: number }>(${this.baseUrl}//attempts?page=&pageSize=);';
const replacement = 'return this.http.get<{ items: ExamAttemptDto[]; totalCount: number }>(`${this.baseUrl}/${examId}/attempts?page=${page}&pageSize=${pageSize}`);';
content = content.replace(searchStr, replacement);

fs.writeFileSync(filePath, content, 'utf8');