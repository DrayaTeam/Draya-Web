// src/environments/environment.ts
// Production / Default environment configuration for the Draya platform.

export const environment = {
  production: true,
  apiBaseUrl: 'http://draya-api.runasp.net/api/v1',
  signalrHubUrl: 'http://draya-api.runasp.net/hubs/notifications',
  qaHubUrl: 'http://draya-api.runasp.net/hubs/qa',
  useMockTeacherDashboardApi: false,
  useMockAuthApi: false,
};
