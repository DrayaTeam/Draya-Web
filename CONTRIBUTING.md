# Draya Developer Guidelines & Walkthrough

Welcome to the **Draya** frontend codebase! Draya is an Arabic-first, AI-powered EdTech platform designed for Teachers, Students, and Parents. 

This document serves as a comprehensive walkthrough of the project's architecture, conventions, and tools to help you get up to speed and contribute effectively.

---

## 🏗️ Technology Stack

- **Framework:** Angular 20 (Strict Mode, Standalone Components ONLY — no `NgModules`).
- **UI Library:** PrimeNG (v20 LTS).
- **Styling:** Tailwind CSS v4 (Using the modern CSS-first configuration).
- **i18n / Localization:** `@ngx-translate/core` (v18, functional providers).
- **Real-time:** `@microsoft/signalr` (for live Q&A and notifications).
- **Testing:** Jasmine & Karma (Default Angular testing suite).

---

## 📂 Project Architecture

The project strictly follows a **domain-driven folder structure** inside `src/app/`:

### 1. `core/` (The Brains)
Contains singleton services, guards, interceptors, and application-wide configurations. **Never import UI components here.**
- **`api/`**: Base services for HTTP requests.
- **`auth/`**: `AuthService`, `RoleGuard`, `JwtUtil`, and `AuthInterceptor`. Handles JWT token storage and RBAC (Role-Based Access Control).
- **`locale/`**: `LocaleService` manages language switching between Arabic (`ar`) and English (`en`), and automatically toggles the HTML `dir` attribute for RTL/LTR layout.
- **`signalr/`**: Handles real-time WebSocket connections to the ASP.NET backend.

### 2. `shared/` (The Building Blocks)
Contains reusable, "dumb" components, pipes, and directives. These should not have strong dependencies on specific backend APIs.
- **`components/`**: Complex reusable structures (e.g., `PageHeaderComponent`, `StatCardComponent`).
- **`ui/`**: Simple UI primitives (e.g., `AlertMessageComponent`, `LoadingSpinnerComponent`, `EmptyStateComponent`).
- **`directives/`**: DOM manipulators (e.g., `*appHasRole="['teacher']"`, `appConfirmAction`).
- **`pipes/`**: Data transformers (e.g., `safe`, `truncate`, `timeAgo`, `fileSize`).

### 3. `layout/` (The Skeleton)
Contains the main structural components that wrap the application content.
- `ShellComponent`: The main authenticated layout wrapper.
- `NavComponent`: Sidebar/Top navigation logic.

### 4. `features/` (The Meat)
Contains the actual business logic and views, strictly separated by user role. Each feature folder contains its own lazy-loaded routes.
- **`auth/`**: Login, Registration, Forgot Password.
- **`teacher/`**: `ExamBuilderComponent`, Dashboard.
- **`student/`**: `ExamTakingComponent`, Dashboard.
- **`parent/`**: `ParentReportsComponent`.

---

## 🎨 Styling Guidelines

We use **Tailwind v4** and **PrimeNG**.

### 1. Single Source of Truth
Our design tokens and PrimeNG theme are located in `theme.css` at the root of the project. This file is imported directly into `src/styles.scss`. Do not create a separate `tailwind.config.ts`.

### 2. RTL (Right-to-Left) First
Draya is an Arabic-first platform. Always use **CSS Logical Properties** in Tailwind instead of physical directional properties:
- **USE:** `ps-4` (padding-start), `pe-4` (padding-end), `ms-2` (margin-start).
- **DO NOT USE:** `pl-4` (padding-left), `pr-4` (padding-right), `ml-2` (margin-left).

Using logical properties ensures the UI perfectly mirrors itself when switching between Arabic (RTL) and English (LTR).

---

## 🌍 Internationalization (i18n)

Translations are stored in `src/assets/i18n/ar.json` and `en.json`.

**How to use translations in HTML:**
```html
<h1>{{ 'nav.dashboard' | translate }}</h1>
```

**How to use translations in TypeScript:**
```typescript
import { TranslateService } from '@ngx-translate/core';

constructor(private translate: TranslateService) {}

showMessage() {
  const msg = this.translate.instant('common.success');
}
```

---

## 🛠️ Development Workflow & Rules

### 1. Component Generation
Always generate standalone components with external HTML and SCSS files to keep the `.ts` files clean and focused strictly on logic.
```bash
ng generate component features/my-feature/my-component
```

### 2. Role-Based Access Control (RBAC)
To hide/show UI elements based on the current user's role, use the built-in shared directive:
```html
<button *appHasRole="['teacher', 'admin']">Edit Exam</button>
```

To protect routes, use the `roleGuard` in your route definitions:
```typescript
{
  path: 'teacher',
  canActivate: [roleGuard],
  data: { roles: ['teacher'] },
  loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
}
```

### 3. Commits & Source Control
We strictly follow **Conventional Commits**. Your commit messages should look like:
- `feat(student): add exam timer logic`
- `fix(auth): resolve JWT expiration bug`
- `refactor(shared): improve stat card responsive layout`
- `docs: update setup instructions`

### 4. Running the Project
```bash
# Start development server
ng serve

# Run tests
ng test
```

## 🤝 Need Help?
- Check `src/environments/environment.development.ts` to ensure your local backend URLs are pointing to your running ASP.NET Core API.
- For UI components, reference the existing files in `src/app/shared/` to see how we build standard components.
- Refer to the Figma UI/UX prototype linked in the main `README.md` for design specifications.
