# Draya Developer Guidelines & Walkthrough

Welcome to the **Draya** frontend codebase! Draya is an Arabic-first, AI-powered EdTech platform designed for Teachers, Students, and Parents.

This document serves as a comprehensive walkthrough of the project's architecture, conventions, and tools to help you get up to speed and contribute effectively.

---

## 🏗️ Technology Stack

- **Framework:** Angular 20 (Strict Mode, Standalone Components ONLY — no `NgModules`).
- **UI Library:** PrimeNG (v20 LTS) with `tailwindcss-primeui`.
- **Styling:** Tailwind CSS v4 + Scoped SCSS.
- **i18n / Localization:** `@ngx-translate/core` (v18, functional providers).
- **Real-time:** `@microsoft/signalr` (for live Q&A and notifications).
- **Testing:** Jasmine & Karma (Default Angular testing suite).

---

## 🌐 Live Backend API

- **Base API URL:** `http://draya-api.runasp.net/api`
- **SignalR Hub:** `http://draya-api.runasp.net/hubs/notifications`

Configured in `src/environments/environment.ts` and `src/environments/environment.development.ts`.

---

## 📂 Project Architecture

The project strictly follows a **domain-driven folder structure** inside `src/app/`:

### 1. `core/` (The Brains)

Contains singleton services, guards, interceptors, and application-wide configurations. **Never import UI components here.**

- **`api/`**: Base services for HTTP requests (`ApiBaseService`).
- **`auth/`**: `AuthService`, `RoleGuard`, `JwtUtil`, and `AuthInterceptor`. Handles JWT token storage and RBAC.
- **`locale/`**: `LocaleService` manages language switching between Arabic (`ar`) and English (`en`), and toggles HTML `dir` attribute.
- **`signalr/`**: Handles real-time WebSocket connections to the ASP.NET backend.

### 2. `shared/` (The Building Blocks)

Contains reusable, "dumb" components, pipes, and directives.

- **`components/`**: Reusable structures (e.g., `BlobBgComponent`, `PageHeaderComponent`).
- **`ui/`**: Simple UI primitives (e.g., `AlertMessageComponent`, `LoadingSpinnerComponent`).
- **`directives/`**: DOM manipulators.
- **`pipes/`**: Data transformers.

### 3. `layout/` (The Skeleton)

Contains the main structural components that wrap the application content.

- `ShellComponent`: The main authenticated layout wrapper.
- `NavComponent`: Sidebar/Top navigation logic.

### 4. `features/` (The Meat)

Contains the actual business logic and views, strictly separated by domain:

- **`landing/`**: Public landing page and section components.
- **`auth/`**: Login, Registration, Forgot Password.
- **`teacher/`**: `ExamBuilderComponent`, Dashboard.
- **`student/`**: `ExamTakingComponent`, Dashboard.
- **`parent/`**: `ParentReportsComponent`.

---

## 🎨 Styling & Component Rules

### 1. Dedicated Component Triad (Strict Rule)

Every component must consist of three separate files:

1. `component.ts` — Component logic, signals, and `OnPush` change detection.
2. `component.html` — Semantic HTML with Angular `@if` and `@for`.
3. `component.scss` — Scoped SCSS stylesheets using design tokens.

**NEVER use inline `template: \`...\``or inline`styles: [...]`or HTML`style="..."` attributes.**

### 2. Explicit Responsive Grids

For multi-column card sections, declare explicit CSS Grid and Flex rules in `.scss` files with standard media queries (`1024px`, `640px`) to prevent full-width stacking.

### 3. RTL (Right-to-Left) First

Always use **CSS Logical Properties** (`ms-`, `me-`, `ps-`, `pe-`) instead of physical directional properties (`ml-`, `mr-`, `pl-`, `pr-`).

---

## 🌍 Internationalization (i18n)

Translations are stored in `src/assets/i18n/ar.json` and `en.json`.

**HTML usage:**

```html
<h1>{{ 'FEATURE.SECTION.KEY' | translate }}</h1>
```

**TypeScript usage:**

```typescript
private readonly translate = inject(TranslateService);
```

---

## 🛠️ Development Workflow & Rules

### 1. Component Generation

```bash
ng generate component features/my-feature/my-component
```

### 2. Commits & Source Control

We strictly follow **Conventional Commits**:

- `feat(student): add exam timer logic`
- `fix(auth): resolve JWT expiration bug`
- `refactor(shared): improve card grid responsive layout`

### 3. Running the Project

```bash
# Start development server
ng serve

# Build project
ng build

# Run tests
ng test
```
