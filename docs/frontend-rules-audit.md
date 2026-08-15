# Frontend Rules Audit: Task 1.2 (Auth Module)

## 1. Translation keys
❌ **Violations found:** All auth translation keys use `camelCase` (e.g., `auth.invalidTokenTitle`, `auth.email`, `app.name`) instead of the required `SCREAMING_SNAKE_CASE` feature prefix (e.g., `AUTH.LOGIN.TITLE`).
- **Files affected:** `src/assets/i18n/ar.json`, `src/assets/i18n/en.json`
- **Templates affected:** All 6 page templates in `src/app/features/auth/pages/` (`login.component.html`, `register-teacher.component.html`, `register-student.component.html`, `forgot-password.component.html`, `reset-password.component.html`, `profile.component.html`)

## 2. `localStorage` key prefix
❌ **Violations found:** Keys omit the required `draya_` prefix.
- **`src/app/features/auth/services/auth.service.ts`**: Uses `access_token`, `refresh_token`, and `user` (lines 33, 46-48, 56-58, 136).
- **`src/app/features/auth/services/auth.service.spec.ts`**: Tests mock/validate against the raw keys (lines 66, 97).

## 3. JWT decoding
✅ **Compliant:** `src/app/core/auth/jwt.util.ts` uses the approved `jwt-decode` library.

## 4. `inject()` vs constructor injection
✅ **Compliant:** All injected dependencies across the auth module use `inject()`. No parameter-based constructor DI was found.

## 5. `takeUntilDestroyed()`
❌ **Violations found:** Missing on every `.subscribe()` call to prevent memory leaks.
- `src/app/features/auth/pages/reset-password/reset-password.component.ts` (lines 44, 79)
- `src/app/features/auth/pages/register-teacher/register-teacher.component.ts` (lines 52, 86)
- `src/app/features/auth/pages/register-student/register-student.component.ts` (lines 54, 88)
- `src/app/features/auth/pages/profile/profile.component.ts` (lines 23, 28)
- `src/app/features/auth/pages/login/login.component.ts` (line 47)
- `src/app/features/auth/pages/forgot-password/forgot-password.component.ts` (line 40)
- `src/app/features/auth/layout/auth-shell/auth-shell.component.ts` (line 98)

## 6. Nested subscriptions
✅ **Compliant:** No instances of `subscribe()` nested inside another `subscribe()` were found.

## 7. `ChangeDetectionStrategy.OnPush`
✅ **Compliant:** Found on every component within `features/auth/`.

## 8. Smart vs dumb component split
❌ **Violations found:** All page components currently mix presentational form markup with direct service injections instead of strict `@Input()`/`@Output()` separation.
- **Affected:** `login.component.ts`, `register-teacher.component.ts`, `register-student.component.ts`, `forgot-password.component.ts`, `reset-password.component.ts`, `profile.component.ts`

## 9. Barrel exports
❌ **Violations found:** Missing `src/app/features/auth/index.ts` to re-export the public API.

## 10. Lazy loading
❌ **Violations found:** `AuthShellComponent` is eagerly loaded via `component: AuthShellComponent` in `src/app/features/auth/auth.routes.ts` (line 7), instead of `loadComponent()`. (Note: `app.routes.ts` correctly lazy-loads the module itself).

## 11. TypeScript strictness
❌ **Violations found:** One usage of `any` and a missing explicit return type.
- **`src/app/features/auth/layout/auth-shell/auth-shell.component.ts`** (line 105): `getRouteAnimationData(outlet: any) {`

## 12. File naming conventions
✅ **Compliant:** All files follow the `kebab-case.<type>.ts` pattern perfectly.

## 13. No inline styles
✅ **Compliant:** No `style=""` attributes were used anywhere in the auth module templates.

## 14. Environment URLs
✅ **Compliant:** Uses `environment.apiBaseUrl` as requested.

## 15. `console.log`
✅ **Compliant:** None found in the committed auth code.

## 16. Commit message format
✅ **Compliant:** Spot-check confirmed correct usage of conventional commits (`feat(auth):`, `fix(auth):`, `chore(auth):`, etc.).

---

## Priority Summary

1. **Smart vs Dumb Split (High effort / High impact):** Affects all 6 page components. Splitting these into strict presentational and smart container components requires the most architectural rework.
2. **Translation Keys (High effort / Widespread):** Affects `ar.json`, `en.json`, and all 6 page templates. Requires systematic find-and-replace to enforce `SCREAMING_SNAKE_CASE`.
3. **`takeUntilDestroyed()` (Medium effort):** Needs to be appended to ~11 `.subscribe()` instances across 7 components to prevent leaks.
4. **`localStorage` keys (Low effort):** Quick string update inside `auth.service.ts` and its spec file.
5. **Minor corrections (Trivial effort):**
   - Add `index.ts` barrel file.
   - Update `auth.routes.ts` to `loadComponent()`.
   - Fix strictness error on `getRouteAnimationData` in `auth-shell.component.ts`.
