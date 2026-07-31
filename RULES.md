# Frontend Rules — Draya Web (Angular 20)

These are the non-negotiable engineering and coding rules for the **Draya Web** Angular frontend. Every team member and AI agent must follow these rules.

---

## 🏗️ Architecture Rules

### Module & Component Structure
- **Standalone-only**: Use `standalone: true` on every component, directive, and pipe. No `NgModule` unless a third-party library forces it.
- **Feature-based folder structure**: Organize by feature, not by type.
  ```
  src/app/
  ├── core/           # Singleton services, interceptors, guards, models
  ├── shared/         # Shared standalone components, pipes, directives
  ├── features/
  │   ├── auth/
  │   ├── student/
  │   ├── teacher/
  │   └── parent/
  └── layout/         # Shell components (headers, sidebars, footers)
  ```
- **Lazy loading**: Every feature route must use `loadComponent()` or `loadChildren()`. No eagerly loaded feature components.
- **Barrel exports**: Each feature folder must have an `index.ts` re-exporting public API.

### Component Rules
- **Smart vs Dumb split**:
  - Smart (container) components: call services, manage state, handle routing.
  - Dumb (presentational) components: `@Input()` / `@Output()` only, no service injection.
- **`ChangeDetectionStrategy.OnPush`**: Required on **all** dumb/presentational components.
- **`inject()` over constructor injection**: Use `inject()` function for all dependency injection.
  ```typescript
  // ✅ Correct
  private readonly authService = inject(AuthService);
  
  // ❌ Forbidden
  constructor(private authService: AuthService) {}
  ```
- **Signal-first reactivity**: Use Angular signals (`signal()`, `computed()`, `effect()`) for local component state. Reserve `BehaviorSubject` only for cross-component shared state in services.

---

## 📁 File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component | `kebab-case.component.ts` | `student-dashboard.component.ts` |
| Service | `kebab-case.service.ts` | `auth.service.ts` |
| Guard | `kebab-case.guard.ts` | `auth.guard.ts` |
| Interceptor | `kebab-case.interceptor.ts` | `token.interceptor.ts` |
| Pipe | `kebab-case.pipe.ts` | `arabic-date.pipe.ts` |
| Model/Interface | `kebab-case.model.ts` | `user.model.ts` |
| Route config | `*.routes.ts` | `student.routes.ts` |
| Template | same name as component `.html` → `.component.html` _(or inline)_ | `login.component.html` |

---

## 🎨 Styling Rules

### Tailwind CSS v4
- **Tailwind-first**: All styling goes through Tailwind utilities. No custom CSS files per-component unless absolutely necessary.
- **No inline `style=""` attributes**: Never use inline styles. If a dynamic value is needed, use CSS custom properties with `[style]` binding for the variable only.
- **RTL-aware utilities**: Use `rtl:` and `ltr:` Tailwind variants or logical properties (`ms-`, `me-`, `ps-`, `pe-`) instead of `ml-`, `mr-`, `pl-`, `pr-`.
- **PrimeNG theming**: Do NOT override PrimeNG components with scoped `::ng-deep`. Use `theme.css` CSS variables or the `styleClass` input.

### Design System Compliance
- All colors must come from DESIGN.md tokens — no arbitrary color values.
- Font sizes and spacing must use Tailwind's scale.
- All interactive elements must implement the hover/active micro-interaction patterns from DESIGN.md §5.

---

## 🔗 HTTP & API Rules

### Service Layer
- **One service per feature domain**: e.g., `AuthService`, `StudentService`, `ExamService`.
- **All HTTP calls go through services**: Components never call `HttpClient` directly.
- **`HttpClient` with `inject()`**:
  ```typescript
  private readonly http = inject(HttpClient);
  ```
- **Return Observables**: Services return `Observable<T>`, not subscribed results. Components subscribe (or use `async` pipe).
- **Error handling**: Use `catchError` in services. Map backend errors to typed `AppError` objects.
- **Environment URLs**: All base URLs from `environment.ts`. Never hardcode URLs.

### Interceptors
- `TokenInterceptor`: Attaches `Authorization: Bearer <token>` to every request (except auth endpoints).
- `ErrorInterceptor`: Catches `401` → redirect to login, `403` → show permission error, `5xx` → show toast.
- `LoadingInterceptor`: Toggles global loading state.

---

## 🔐 Auth & Guards

- `AuthGuard`: Protects all authenticated routes. Redirects to `/auth/login` if no valid token.
- `RoleGuard`: Validates user role (Student/Teacher/Parent/Admin). Redirects to role dashboard if wrong role accessed.
- **No route without a guard**: Every feature route must declare its guards in the route config.
- Store tokens in `localStorage` with key prefix `draya_`.
- Decode JWT using `jwt-decode` library. Never manually parse token strings.

---

## 🌐 i18n Rules

- **All text strings via `@ngx-translate`**:
  ```html
  <!-- ✅ Correct -->
  <h1>{{ 'STUDENT.DASHBOARD.TITLE' | translate }}</h1>
  
  <!-- ❌ Forbidden -->
  <h1>لوحة الطالب</h1>
  ```
- Translation keys use **SCREAMING_SNAKE_CASE** with feature prefix: `FEATURE.SECTION.KEY`.
- Both `ar.json` and `en.json` must be updated together — never add a key to one without the other.
- Default language: Arabic (`ar`). Fallback: English (`en`).

---

## 📡 State Management

- **No NgRx/Redux for now**: Use Angular Signals + Services pattern.
- **`signal()` for local state** inside components.
- **`computed()` for derived values** — never manually computed in templates.
- **Services as stores**: Services use `signal()` internally and expose read-only `computed()` to consumers.
  ```typescript
  // auth.service.ts
  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  ```

---

## ✅ Code Quality Rules

### TypeScript
- **Strict mode enabled**: `strict: true` in `tsconfig.json`. No `any` allowed — use `unknown` if necessary.
- **Explicit return types**: All functions and methods must have explicit return type annotations.
- **No `!` non-null assertion**: Handle null/undefined explicitly.
- **Interfaces over types** for object shapes. Use `type` for unions and utility types.

### Linting & Formatting
- **ESLint + angular-eslint**: Run `npm run lint` before every commit. Zero warnings allowed.
- **Prettier**: Run `npm run format` before every commit. Config is in `.prettierrc`.
- **Husky pre-commit hook** (to be set up): Automatically runs lint + format on staged files.

### Testing
- **Jasmine + Karma**: Unit tests for all services and complex pipes.
- **Test file naming**: `*.spec.ts` co-located with the source file.
- **Minimum coverage**: 70% for services. Components need at least smoke tests.
- **No `fdescribe` or `fit`**: Never commit focused tests.

---

## 🔄 Git Workflow Rules

### Branch Naming
```
feature/<sprint>/<short-description>     → feature/s1/auth-login
fix/<sprint>/<short-description>         → fix/s1/token-refresh-bug
chore/<description>                      → chore/setup-husky
refactor/<description>                   → refactor/auth-signals
```

### Commit Messages (Conventional Commits)
```
feat(auth): implement JWT login with token refresh
fix(student): resolve exam timer race condition
feat(teacher): add exam creation wizard - step 1
refactor(shared): migrate subject card to signals
chore(deps): upgrade PrimeNG to v20.5.1
test(auth): add login service unit tests
style(student): apply RTL-aware spacing to dashboard cards
docs(readme): update local setup instructions
```

**Commit format**: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`
- Scope = feature name or component name
- Description: imperative tense, no period, ≤72 chars

### PR Rules
- **One feature per PR**: No mega PRs.
- **PR must pass CI**: Lint + Tests must be green before requesting review.
- **At least 1 approval** before merging.
- **Squash merge** into `main` / `develop`.
- **Link Jira/Trello card** in PR description.

---

## 🚫 Forbidden Patterns

| Forbidden | Reason |
|---|---|
| `NgModule` for new features | We're standalone-only |
| `any` type | Defeats TypeScript |
| Inline `style=""` attributes | Use Tailwind |
| Hardcoded Arabic/English strings | Use ngx-translate |
| Direct `HttpClient` in components | Services only |
| `subscribe()` without `takeUntilDestroyed()` | Memory leaks |
| `console.log` in production code | Remove before commit |
| `!` non-null assertion | Handle nullability |
| Nested subscriptions (`subscribe` inside `subscribe`) | Use `switchMap`/`mergeMap` |
| Committing `.env` or secrets | Use environment files |

---

## 📦 Dependency Rules

- **Approved dependencies**: Angular, PrimeNG, Tailwind, ngx-translate, jwt-decode, SignalR, RxJS.
- **Adding new dependency**: Requires team discussion and lead approval before `npm install`.
- **No jQuery**: Ever.
- **No moment.js**: Use Angular's `DatePipe` or native `Intl.DateTimeFormat`.
