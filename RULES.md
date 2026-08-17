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
  │   ├── landing/    # Landing page and section components
  │   ├── auth/
  │   ├── student/
  │   ├── teacher/
  │   └── parent/
  └── layout/         # Shell components (headers, sidebars, footers)
  ```
- **Strict File Triad Separation**: Every component MUST have its own 3 dedicated files:
  1. `<name>.component.ts` (Component logic, signals, inputs, lifecycle)
  2. `<name>.component.html` (Semantic HTML template with native `@if` and `@for`)
  3. `<name>.component.scss` (Scoped SCSS stylesheet with design system tokens and responsive rules)
  - **Forbidden**: Inline `template: \`...\``or inline`styles: [...]`in`.ts` files.
- **Lazy loading**: Every feature route must use `loadComponent()` or `loadChildren()`. No eagerly loaded feature components.
- **Barrel exports**: Each feature folder must have an `index.ts` re-exporting public API.

### Component Rules

- **Smart vs Dumb split**:
  - Smart (container) components: call services, manage state, handle routing.
  - Dumb (presentational) components: `@Input()` / `@Output()` (or `input()` / `output()`) only, no service injection.
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

| Type               | Convention                  | Example                            |
| ------------------ | --------------------------- | ---------------------------------- |
| Component Logic    | `kebab-case.component.ts`   | `student-dashboard.component.ts`   |
| Component Template | `kebab-case.component.html` | `student-dashboard.component.html` |
| Component Styles   | `kebab-case.component.scss` | `student-dashboard.component.scss` |
| Service            | `kebab-case.service.ts`     | `auth.service.ts`                  |
| Guard              | `kebab-case.guard.ts`       | `auth.guard.ts`                    |
| Interceptor        | `kebab-case.interceptor.ts` | `token.interceptor.ts`             |
| Pipe               | `kebab-case.pipe.ts`        | `arabic-date.pipe.ts`              |
| Model/Interface    | `kebab-case.model.ts`       | `user.model.ts`                    |
| Route config       | `*.routes.ts`               | `student.routes.ts`                |

---

## 🎨 Styling & Layout Rules

### Layout & Responsive Grids

- **Explicit Layout Declarations**: Major layout structures (multi-column card grids, split headers, sticky bars) must define explicit CSS Grid or Flexbox rules in their component `.scss` stylesheet with explicit media query breakpoints (`1024px`, `768px`, `640px`):
  ```scss
  .card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    width: 100%;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
  ```
- **Section Containers**: Max-width constraints must always center page content: `max-width: 1280px; margin: 0 auto; width: 100%;`.
- **No Unwanted Block Overrides**: Do not apply `:host { display: block }` or `host: { class: 'block' }` indiscriminately if it breaks flex/grid document flow.

### Tailwind CSS v4

- **Tailwind utilities**: Utility classes combined with scoped SCSS classes.
- **No inline `style=""` or `[style.xxx]` bindings**: All styling belongs in `.scss` or Tailwind classes.
- **RTL-aware utilities**: Use `rtl:` and `ltr:` Tailwind variants or logical properties (`ms-`, `me-`, `ps-`, `pe-`) instead of `ml-`, `mr-`, `pl-`, `pr-`.
- **PrimeNG theming**: Do NOT override PrimeNG components with scoped `::ng-deep`. Use `theme.css` CSS variables or the `styleClass` input.

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

---

## 🚫 Forbidden Patterns

| Forbidden                                        | Reason                                                  |
| ------------------------------------------------ | ------------------------------------------------------- |
| Inline `template: \`...\``in`@Component`         | Breaks clean separation of concerns and maintainability |
| Inline `styles: [...]` in `@Component`           | Use scoped `.component.scss` files                      |
| Inline `style="..."` or `[style.xxx]` attributes | Violates design system and breaks theme consistency     |
| `NgModule` for new features                      | We're standalone-only                                   |
| `any` type                                       | Defeats TypeScript strict checking                      |
| Hardcoded Arabic/English strings                 | Use ngx-translate                                       |
| Direct `HttpClient` in components                | Services only                                           |
| `subscribe()` without `takeUntilDestroyed()`     | Memory leaks                                            |
| `console.log` in production code                 | Remove before commit                                    |
| `!` non-null assertion                           | Handle nullability explicitly                           |
| Nested subscriptions                             | Use `switchMap`/`mergeMap`                              |
| Committing `.env` or secrets                     | Use environment files                                   |

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
feat(scope): imperative description
fix(scope): imperative description
refactor(scope): imperative description
```
