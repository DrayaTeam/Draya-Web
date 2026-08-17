// src/environments/environment.prod.ts
// Production build environment configuration.

export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: false,
  useMockAuthApi: false,
};
