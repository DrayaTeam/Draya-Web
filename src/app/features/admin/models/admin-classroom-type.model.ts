export interface ClassroomTypeDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateClassroomTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateClassroomTypeRequest {
  name: string;
  description?: string;
  isActive: boolean;
}
