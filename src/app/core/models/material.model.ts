// src/app/core/models/material.model.ts
export type MaterialType = 'PDF' | 'Video' | 'Link';

export interface MaterialVersionDto {
  versionId: string;
  versionNumber: number;
  fileUrl: string;
  parseStatus: string;
  uploadedAt: string;
  errorMessage: string | null;
}

export interface ClassroomMaterialDto {
  materialId: string;
  title: string;
  materialType: MaterialType;
  currentVersion: MaterialVersionDto;
  createdAt: string;
}

export interface MaterialStreamDto {
  provider: string;
  videoId: string;
  streamUrl: string;
  expiresAt: string;
}
