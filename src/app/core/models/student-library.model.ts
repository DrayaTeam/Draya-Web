// src/app/core/models/student-library.model.ts

export interface LibraryBookChapter {
  id: string;
  title: string;
}

export interface LibraryBookItem {
  readonly id: string;
  readonly title: string;
  readonly subjectName: string;
  readonly subjectTagBgColor: string;
  readonly coverImageUrl: string;
  readonly pagesCount: number;
  readonly totalPages?: number;
  readonly fileSizeMb: number;
  readonly fileFormat: string;
  readonly downloadUrl: string;
  readonly chapters: readonly LibraryBookChapter[];
  readonly materialType?: 'Video' | 'Document' | 'Exam' | string;
  readonly uploadedAt?: string;
}

export interface MaterialVersion {
  versionId: string;
  versionNumber: number;
  fileUrl: string;
  parseStatus?: string;
  uploadedAt?: string;
  errorMessage?: string | null;
}

export interface StudentMaterialItem {
  materialId: string;
  title: string;
  materialType: 'Video' | 'Document' | 'Exam' | string;
  createdAt: string;
  currentVersion?: MaterialVersion;
}

export interface StudentMaterialsPagedResponse {
  items: StudentMaterialItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
