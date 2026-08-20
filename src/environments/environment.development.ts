// src/environments/environment.development.ts
// Development environment configuration for the Draya platform.

export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: true,
  useMockAuthApi: false,
  // Flip to true once backend confirms /hubs/notifications is live.
  // Until then, SignalRService skips the notifications hub connection entirely
  // to prevent red 404 negotiate errors in the browser console.
  enableNotificationsHub: false,
  enableQaHub: false,
  examHubUrl: '/hubs/exam-generation',
  enableExamHub: true,
};
