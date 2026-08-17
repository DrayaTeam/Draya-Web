// src/environments/environment.prod.ts
// Production build environment configuration.

export const environment = {
  production: true,
  apiBaseUrl: 'http://draya-api.runasp.net/api/v1',
  signalrHubUrl: 'http://draya-api.runasp.net/hubs/notifications',
  qaHubUrl: 'http://draya-api.runasp.net/hubs/qa',
  useMockTeacherDashboardApi: false,
  useMockAuthApi: false,
};
