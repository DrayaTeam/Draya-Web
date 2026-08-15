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
}
