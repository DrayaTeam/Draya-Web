export interface AdminSupervisorDto {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'SuperAdmin';
  isActive: boolean;
  createdAt: string;
  isCurrentUser?: boolean;
}

export interface InviteSupervisorRequest {
  name: string;
  email: string;
  password?: string;
  role?: 'Admin' | 'SuperAdmin';
}
