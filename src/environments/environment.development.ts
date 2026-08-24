// src/environments/environment.development.ts
// Development environment configuration for the Draya platform.

export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: true,
  useMockAuthApi: false,
  // Hub is now live on backend
  enableNotificationsHub: true,
  enableQaHub: true,
  examHubUrl: '/hubs/exam-generation',
  enableExamHub: true,
  gradingHubUrl: '/hubs/exam-grading',
  enableGradingHub: true,
  reportsHubUrl: '/hubs/reports',
  enableReportsHub: true,
  materialsHubUrl: '/hubs/materials',
  enableMaterialsHub: true,
};
