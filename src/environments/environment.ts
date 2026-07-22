// src/environments/environment.ts
// Production environment configuration for the Draya platform.
// IMPORTANT: Fill in actual values before deploying to production.
// Do NOT commit real credentials or secrets — use environment injection at CI/CD time.

export const environment = {
  production: true,
  // Replace with your actual ASP.NET Core backend base URL (no trailing slash)
  apiBaseUrl: 'https://api.draya.io',
  // Replace with your actual SignalR hub URL (full path to the hub endpoint)
  signalrHubUrl: 'https://api.draya.io/hubs/qa',
};
