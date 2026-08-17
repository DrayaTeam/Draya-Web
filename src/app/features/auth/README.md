# features/auth/

Authentication feature — login, logout, session management.

## What will eventually live here

- **Login page** (`login/`) — Email + password form backed by `AuthService.login()`. Redirects to role dashboard on success.
- **Forgot password** (TBD) — If the backend exposes a reset flow.
- **Session refresh** — Handled silently by `auth.interceptor.ts` (via 401 + `AuthService.refresh()`), not a visible route.

## Draya agents referenced

This feature does not directly call a Draya AI agent, but depends on the **JWT issued by the ASP.NET Core Auth service**, which encodes the user's role (`teacher | student | parent`) so downstream guards can route accordingly.
