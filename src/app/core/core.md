# core/

This directory contains **singleton services** that are initialized once at application startup and live for the application's lifetime. Nothing in `core/` is feature-specific.

## What lives here

| Subdirectory    | Responsibility                                                               |
| --------------- | ---------------------------------------------------------------------------- |
| `auth/`         | JWT auth state (AuthService), HTTP interceptors, route guards, JWT utilities |
| `api/`          | Base HttpClient wrapper used by all feature services                         |
| `signalr/`      | SignalR hub connection lifecycle for real-time Q&A                           |
| `interceptors/` | Global HTTP interceptors (error handling)                                    |
| `locale/`       | Language/RTL switching, ngx-translate bootstrap                              |

## Rules

- Services here are `providedIn: 'root'` — never `providedIn: 'any'`.
- No UI components, directives, or pipes belong in `core/`. Those go in `shared/`.
- Do not import from `features/` here — core is a dependency of features, never the other way around.
