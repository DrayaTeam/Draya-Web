// src/environments/environment.ts
// Production / Default environment configuration for the Draya platform.

export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: false,
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
