// src/environments/environment.prod.ts
// Production build environment configuration.

export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: '/hubs/notifications',
  qaHubUrl: '/hubs/qa',
  useMockTeacherDashboardApi: false,
  useMockAuthApi: false,
  // Flip to true once backend confirms /hubs/notifications is live.
  // Until then, SignalRService skips the notifications hub connection entirely
  // to prevent red 404 negotiate errors in the browser console.
  enableNotificationsHub: false,
};
