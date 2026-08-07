// src/environments/environment.development.ts
// Development environment configuration for the Draya platform.
// Used automatically by `ng serve` and `ng build --configuration development`.

export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  signalrHubUrl: 'https://localhost:7001/hubs/qa',
  useMockAuthApi: false,
};
