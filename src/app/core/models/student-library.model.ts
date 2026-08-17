// src/app/core/models/student-library.model.ts

export type MaterialType = 'Video' | 'PDF' | 'DOCX' | 'PPTX' | 'Image' | 'Document' | string;
export type ParseStatus = 'Pending' | 'Parsed' | 'Failed' | string;

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
  readonly materialType?: MaterialType;
  readonly parseStatus?: ParseStatus;
  readonly uploadedAt?: string;
  readonly streamUrl?: string;
}

export interface MaterialVersion {
  versionId: string;
  versionNumber: number;
  fileUrl: string;
  parseStatus?: ParseStatus;
  uploadedAt?: string;
  errorMessage?: string | null;
}

export interface StudentMaterialItem {
  materialId: string;
  title: string;
  materialType: MaterialType;
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

export interface MaterialStreamResponse {
  provider: string;
  videoId: string;
  streamUrl: string;
  expiresAt: string;
}
