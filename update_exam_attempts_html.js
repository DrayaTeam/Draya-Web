const fs = require('fs');
const filePath = 'src/app/features/teacher/exams/exam-attempts/exam-attempts.component.html';
let content = fs.readFileSync(filePath, 'utf8');

// replace <p-table [value]="attempts()" [paginator]="true" [rows]="10" responsiveLayout="scroll" styleClass="p-datatable-sm modern-table">
const oldTable = '<p-table [value]="attempts()" [paginator]="true" [rows]="10" responsiveLayout="scroll" styleClass="p-datatable-sm modern-table">';
const newTable = '<p-table [value]="attempts()" responsiveLayout="scroll" styleClass="p-datatable-sm modern-table">';
content = content.replace(oldTable, newTable);

// Add the pagination element below </p-table>
const paginationHTML = `
      <!-- Pagination Controls -->
      @if (totalCount() > 0) {
        <div class="mt-8 flex justify-center w-full py-4">
          <draya-pagination
            [totalItems]="totalCount()"
            [pageSize]="pageSize()"
            [currentPage]="pageNumber()"
            (pageChanged)="onPageChange($event)"
            (pageSizeChanged)="onPageSizeChange($event)">
          </draya-pagination>
        </div>
      }`;

content = content.replace("</p-table>", "</p-table>" + paginationHTML);

fs.writeFileSync(filePath, content, 'utf8');