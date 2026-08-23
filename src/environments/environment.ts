// src/environments/environment.ts
// Production / Default environment configuration for the Draya platform.

export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: false,
  useMockAuthApi: false,
  // Flip to true once backend confirms /hubs/notifications is live.
  enableNotificationsHub: false,
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
