// src/app/core/models/student-library.model.ts

export interface LibraryBookItem {
  readonly id: string;
  readonly title: string;
  readonly subjectName: string;
  readonly subjectTagBgColor: string;
  readonly coverImageUrl: string;
  readonly pagesCount: number;
  readonly fileSizeMb: number;
  readonly fileFormat: string;
  readonly downloadUrl: string;
}
