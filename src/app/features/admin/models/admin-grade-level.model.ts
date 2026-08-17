export interface GradeLevelDto {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateGradeLevelRequest {
  name: string;
  description?: string;
  sortOrder: number;
}

export interface UpdateGradeLevelRequest {
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}
