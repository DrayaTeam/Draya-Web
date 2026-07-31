# AGENTS.md — Draya Web Frontend

This file defines how AI coding agents (Cursor, Antigravity, Copilot, etc.) should operate in this repository. All agents must read and follow this file before making any changes.

---

## 🤖 Agent Identity & Purpose

You are an AI coding agent working on **Draya Web** — an Angular 20 educational platform for Egyptian secondary school students, teachers, and parents. The platform is RTL-first (Arabic) and uses PrimeNG + Tailwind CSS v4.

---

## 📋 Must-Read Before Every Session

Before writing any code, always read these files in this order:

1. **`DESIGN.md`** — Brand colors, animations, layout patterns, RTL rules
2. **`RULES.md`** — Engineering rules, forbidden patterns, naming conventions
3. **`CONTEXT.md`** — Project context, sprints, features, roles
4. **`src/app/app.routes.ts`** — Current routing structure
5. **Relevant feature folder** — Read existing code before adding new code

---

## 🧠 How to Think About This Codebase

### Tech Stack
- **Framework**: Angular 20 (standalone components, signals, `inject()`)
- **UI Library**: PrimeNG v20 + `tailwindcss-primeui`
- **Styling**: Tailwind CSS v4 (RTL-aware)
- **State**: Angular Signals + Services (no NgRx)
- **HTTP**: Angular `HttpClient` with interceptors
- **Auth**: JWT stored in localStorage, decoded with `jwt-decode`
- **i18n**: `@ngx-translate/core` (Arabic + English)
- **Real-time**: Microsoft SignalR
- **Testing**: Jasmine + Karma

### User Roles
- **Student** (`/student/*`) — Takes exams, views results, subscribes to plans
- **Teacher** (`/teacher/*`) — Creates exams, manages students, views analytics
- **Parent** (`/parent/*`) — Monitors child's progress
- **Admin** (`/admin/*`) — Platform management (future)

---

## ✅ Before Writing Any Code

1. **Check RULES.md** — Verify the pattern you're about to use is not forbidden.
2. **Check existing similar code** — Search the `features/` and `shared/` folders for existing components/services before creating new ones.
3. **Follow the existing file naming convention** — See RULES.md §File Naming.
4. **Use `inject()`** — Not constructor injection.
5. **Use signals** — Not `BehaviorSubject` for local component state.

---

## 🏗️ Component Generation Pattern

When creating a new component, follow this template:

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'draya-<feature>-<name>',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  styles: ``
})
export class <Name>Component {
  // Inject services
  private readonly service = inject(<Name>Service);
  
  // Inputs (new signal-based input API)
  readonly someInput = input<string>('');
  
  // Outputs
  readonly someEvent = output<void>();
  
  // Local state
  private readonly _state = signal<SomeType | null>(null);
  readonly state = this._state.asReadonly();
  
  // Derived state
  readonly derivedValue = computed(() => this._state()?.someField ?? 'default');
}
```

---

## 🔗 Service Generation Pattern

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ExampleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/resource`;

  // State
  private readonly _items = signal<Item[]>([]);
  readonly items = this._items.asReadonly();
  readonly hasItems = computed(() => this._items().length > 0);

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: unknown): never {
    // Handle error
    throw error;
  }
}
```

---

## 📁 Where to Put Things

| What you're creating | Where it goes |
|---|---|
| Auth pages (login, register) | `src/app/features/auth/` |
| Student pages | `src/app/features/student/` |
| Teacher pages | `src/app/features/teacher/` |
| Parent pages | `src/app/features/parent/` |
| Reusable components (button, card, modal) | `src/app/shared/components/` |
| Reusable pipes | `src/app/shared/pipes/` |
| Reusable directives | `src/app/shared/directives/` |
| HTTP services (shared API) | `src/app/core/services/` |
| Interceptors | `src/app/core/interceptors/` |
| Guards | `src/app/core/guards/` |
| Models / interfaces | `src/app/core/models/` |
| Layout shells | `src/app/layout/` |
| Translation files | `src/assets/i18n/` |

---

## 🌍 RTL & i18n Rules for Agents

- Always add `dir="rtl"` consideration for any layout component.
- Use `ms-*`, `me-*`, `ps-*`, `pe-*` Tailwind utilities (margin-start, margin-end, padding-start, padding-end) instead of `ml-`, `mr-`, `pl-`, `pr-`.
- All text goes through `| translate` pipe with a translation key.
- Update both `ar.json` and `en.json` when adding any new string.

---

## 🚫 Things Agents Must NEVER Do

- Create `NgModule` files — standalone only.
- Use `constructor()` for dependency injection — use `inject()`.
- Hardcode Arabic or English text in templates.
- Use `any` type.
- Use `console.log` (use `console.warn` or `console.error` for legitimate cases, comment WHY).
- Call `HttpClient` directly from a component.
- Subscribe without `takeUntilDestroyed()` or `async` pipe.
- Use `::ng-deep` for style overrides.
- Create CSS files per-component for styling (Tailwind only).
- Push code that fails `npm run lint`.

---

## 🎨 Design Rules for Agents

When generating UI, always:
- Apply `active:scale-[0.98]` to all interactive buttons.
- Apply `transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1)` for hover effects.
- Use `--draya-primary-700` (`#1B6D63`) for primary actions.
- Use `--draya-ai-700` (`#7C3AED`) for AI-powered features.
- Never use `overflow-hidden` on page containers (use it only on the root layout shell).
- Apply fade-in entrance animations to modals and alerts.
- Follow the auth split-shell layout pattern for auth pages.

---

## 📝 Commit Message Format

Always generate commit messages in this format:
```
feat(scope): brief description in imperative tense
fix(scope): brief description
refactor(scope): brief description
```

Examples:
```
feat(auth): implement JWT login with refresh token
feat(student): add exam timer with auto-submit
fix(teacher): resolve exam list pagination offset
chore(deps): upgrade PrimeNG to v20.5.1
```

---

## 🧪 Testing Expectations

When creating a service, also generate a `*.spec.ts` file with:
- A `describe` block with the service name
- `beforeEach` using `TestBed.configureTestingModule`
- At least a smoke test (`it('should be created', ...)`)
- Test for each public method

---

## 📚 Key API Information

- **Base URL**: From `environment.ts` → `environment.apiUrl`
- **Auth header**: `Authorization: Bearer <token>`
- **Content-Type**: `application/json`
- **API documentation**: See `CONTEXT.md` → API section
- **Postman collection**: `Draya Platform API.postman_collection.json` (root of project)
