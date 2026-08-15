// src/environments/environment.development.ts
// Development environment configuration for the Draya platform.

export const environment = {
  production: false,
  apiBaseUrl: 'http://draya-api.runasp.net/api/v1',
  signalrHubUrl: 'http://draya-api.runasp.net/hubs/notifications',
  qaHubUrl: 'http://draya-api.runasp.net/hubs/qa',
  useMockTeacherDashboardApi: true,
  useMockAuthApi: false,
};
