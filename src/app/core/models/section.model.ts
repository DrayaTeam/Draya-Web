// src/app/core/models/section.model.ts

export interface SectionMaterialDto {
  id: string;
  title: string;
  materialType: 'PDF' | 'Video' | 'Link' | string;
  createdAt: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
  videoDurationInSeconds?: number | null;
}

export interface ClassroomSectionDto {
  id: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  documents: SectionMaterialDto[];
  videos: SectionMaterialDto[];
  exams: any[];
  materials?: SectionMaterialDto[]; // Virtual property for UI convenience
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateSectionRequest {
  title: string;
  description?: string;
  order?: number;
}
