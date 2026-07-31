// src/environments/environment.ts
// Production environment configuration for the Draya platform.
// IMPORTANT: Fill in actual values before deploying to production.
// Do NOT commit real credentials or secrets — use environment injection at CI/CD time.

export const environment = {
  production: true,
  apiBaseUrl: 'https://api.draya.app/api/v1',
  signalrHubUrl: 'https://api.draya.app/hubs/notifications',
};

