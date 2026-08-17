// src/environments/environment.development.ts
// Development environment configuration for the Draya platform.

export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: true,
  useMockAuthApi: false,
};
