const fs = require('fs');
let path = 'src/app/features/teacher/classrooms/classroom-detail/classroom-detail.component.html';
let content = fs.readFileSync(path, 'utf8');

// Remove Chat tab button
content = content.replace(/<button\s*class="tab-btn"\s*\[class\.tab-active\]="activeTab\(\) === 3"[\s\S]*?<\/button>/, '');
// Remove Chat tab panel
content = content.replace(/@if \(activeTab\(\) === 3\) \{[\s\S]*?<div class="tab-empty-state">[\s\S]*?<\/div>\s*\}/, '');

// Rename 4 to 3
content = content.replace(/activeTab\(\) === 4/g, 'activeTab() === 3');
content = content.replace(/activeTab\.set\(4\)/g, 'activeTab.set(3)');

fs.writeFileSync(path, content);
console.log("Done");
