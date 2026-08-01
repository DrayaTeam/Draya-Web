// src/environments/environment.development.ts
// Development environment configuration for the Draya platform.
// Used automatically by `ng serve` and `ng build --configuration development`.
// IMPORTANT: Replace placeholder URLs with your local or dev backend addresses.

export const environment = {
  production: false,
  // Replace with your local ASP.NET Core dev server URL (e.g. https://localhost:7001)
  apiBaseUrl: 'https://localhost:7001',
  // Replace with your local SignalR hub URL (e.g. https://localhost:7001/hubs/qa)
  signalrHubUrl: 'https://localhost:7001/hubs/qa',
  useMockAuthApi: true,
};
