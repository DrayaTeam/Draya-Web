# Auth Module Final Audit

## 1. The two-`AuthService` architecture — is the sync fix solid or fragile?
❌ **Verdict: Fragile (Realistic staleness window still exists).**

Files injecting the core `AuthService` (`src/app/core/auth/auth.service.ts`):
1. `src/app/core/auth/auth.guard.ts`
2. `src/app/core/auth/role.guard.ts`
3. `src/app/shared/directives/has-role/has-role.directive.ts`
4. `src/app/features/auth/services/auth.service.ts` (the feature service itself, injected for sync)

**Assessment of the Sync Mechanism:**
The fix successfully prevents the immediate post-login redirect bug by forcing `coreAuth.loadTokens()` when `login()`, `logout()`, or `refreshToken()` succeeds (since they all call `handleAuthSuccess` or `clearStorage`). However, a massive **staleness window exists on app bootstrap**.

- The `coreAuth` service checks `isTokenExpired()` in its constructor. If expired, it clears `localStorage` tokens.
- The `featureAuth` service reads `draya_user` from `localStorage` in its constructor **without** checking token expiration.
- If a user closes the tab, their token expires, and they reopen the app hours later: `coreAuth` will correctly identify the expired session and clear tokens (`isLoggedIn = false`), but `featureAuth` will load the stale user object and report `isAuthenticated = true`. 
- **Recommendation:** Merge the two services. Having two classes manage the same `localStorage` keys is an anti-pattern. If a merge is not possible immediately, `featureAuth` MUST rely on `coreAuth`'s expiration logic on bootstrap.

## 2. Frontend Rules compliance
❌ **Verdict: Non-compliant (One English hardcoded string introduced).**

Re-checking all code touched since the last audit:
- ✅ `inject()` used everywhere (no constructor DI).
- ✅ No `any` types introduced.
- ✅ Explicit return types on new/modified functions.
- ✅ `takeUntilDestroyed()` present on new subscriptions.
- ✅ No `console.log` or `console.warn` left in the source code (the temporary debug logs were removed).
- ✅ No `!` non-null assertions introduced.
- ❌ **Translation keys:** In `login.component.ts`, a hardcoded English string was introduced during the role-fallback fix: ``detail: `Unrecognized role: ${role}` ``. This violates the `SCREAMING_SNAKE_CASE` rule for `AUTH.` prefix translations.

## 3. Leftover temporary/provisional markers
❌ **Verdict: Markers need cleanup.**

Found the following markers:
1. `src/app/features/auth/services/auth-api.service.ts:39`: `TEMPORARY WORKAROUND: GET /auth/me returns 404...`
   - **Status:** Legitimate limitation. The backend still hasn't fixed this bug for Teachers, so the fallback must remain.
2. `src/app/features/auth/services/auth.service.ts:162`: `// PROVISIONAL: contract not yet confirmed by backend — revisit endpoint shape once delivered` (forgotPassword/resetPassword)
3. `src/app/features/auth/services/auth-api.token.ts:16`: `// PROVISIONAL...`
4. `src/app/features/auth/services/auth-mock-api.service.ts:141`: `// PROVISIONAL...`
   - **Status:** Should be removed. Recon #4 proved that the real API enforces these contracts perfectly. They are no longer provisional.

## 4. Error handling consistency
✅ **Verdict: Consistent.**

All 6 auth pages (login, register variants, forgot/reset password, profile) use the exact same pattern for the `error` block in their subscriptions:
1. They check for specific business codes (`INVALID_CREDENTIALS`, `VALIDATION_FAILED`, etc.) and set inline component errors.
2. They have an `else` block that gracefully falls back to `messageService.add(...)` with `COMMON.ERROR`.
3. The `error.interceptor.ts` safely parses generic network errors into a `HTTP_0` or `HTTP_500` `ApiError` structure, guaranteeing the components will never crash on `err.code` checks, and will correctly trigger their `else` blocks to show the toast message.

## 5. Final verification
❌ **Verdict: Tests failing.**

- ✅ `npm run lint` → Zero warnings.
- ✅ `npm run build --configuration production` → No errors (compiles successfully in 12.5 seconds, proxy does not affect production builds).
- ✅ `environment.ts` is untouched (production still uses direct absolute URL).
- ❌ `ng test` → **6 FAILED, 46 SUCCESS** (52 total).
  - The tests failed because `features/auth/services/auth.service.spec.ts` was not updated to provide the `HttpClient` that the newly injected `core/auth/auth.service.ts` dependency requires. `NG0201: No provider found for _HttpClient.`

---

### Ready to close?
**NO.** The following items block closure:
- [ ] Merge the two `AuthService` singletons (or fix the bootstrap expiration desync).
- [ ] Fix the hardcoded English string `` `Unrecognized role: ${role}` `` in `login.component.ts` by adding a proper key to `ar.json`/`en.json`.
- [ ] Remove the `PROVISIONAL` comments from the password reset endpoints since they are now confirmed.
- [ ] Fix `ng test` by providing `provideHttpClient()` or `HttpClientTestingModule` in the `auth.service.spec.ts`.
