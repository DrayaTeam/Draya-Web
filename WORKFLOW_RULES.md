# Draya Web — Mandatory Feature Implementation & Verification Workflow

This rule document defines the mandatory, non-negotiable workflow and verification pipeline that must be executed **AFTER ANY FEATURE OR BUG FIX IS IMPLEMENTED** in the Draya codebase.

---

## 1. Architectural & Component Guidelines

Before running verification, ensure all newly created components satisfy:

1. **Strict 3-File Triad:** Separate `.component.ts`, `.component.html`, and `.component.scss` files for EVERY `@Component`. Inline templates (`template: ...`) or inline styles (`styles: [...]`) are **strictly prohibited**.
2. **Standalone & OnPush:** `@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })`.
3. **Modern DI:** Direct `inject()` usage for services, no traditional constructor injection.
4. **Angular Signals:** State managed via Angular Signals (`signal()`, `computed()`, `input()`, `output()`).
5. **Localization:** All user-facing strings must use `@ngx-translate/core` translate pipe (`| translate`) with keys present in both `src/assets/i18n/ar.json` and `src/assets/i18n/en.json`.
6. **RTL First:** Use logical CSS properties (`inset-inline-start`, `margin-inline`, `padding-inline`, `border-inline`) or RTL-aware utility classes.

---

## 2. Standard Post-Implementation Verification Sequence

After writing/editing code, run the following pipeline **in exact chronological order**:

### Step A: Code Linting

Run Angular ESLint to catch syntax, type, and style errors:

```bash
npx ng lint
```

_Rule: 0 errors and 0 warnings allowed._

### Step B: Code Formatting

Format all modified/created files using Prettier:

```bash
npx prettier --write "src/**/*.{ts,html,scss,json}"
```

### Step C: Console Log & Runtime Error Inspection

Inspect browser runtime console outputs and terminal logs during navigation and interaction. Ensure:

- Zero unhandled `console.error` messages.
- Zero unhandled Promise rejections or uncaught exceptions.
- Zero unresolved Angular expression / template binding runtime warnings.

### Step D: Unit Testing

Execute Karma/Jasmine unit tests for isolated component logic and service methods (employing `/unit-testing-test-generate`):

```bash
npx ng test --watch=false
```

_Rule: 100% of test specs must pass._

### Step E: Integration Testing

Verify component-to-service integration, state synchronization, HTTP communication with `provideHttpClientTesting()`, and routing triggers.

### Step F: End-to-End (E2E) Browser Testing (Playwright)

Run Playwright browser automation tests (leveraging skills `/playwright-skill`, `/go-playwright`, `/e2e-testing`, `/e2e-testing-patterns`) against the local dev environment (`http://localhost:4200`):

```bash
npx playwright test e2e/<feature-name>.spec.ts
```

- **Desktop Viewport:** 1440x900 / 1920x1080
- **Mobile Viewport:** 390x844 / 375x667
- Verify real DOM rendering, dynamic signals updates, form submissions, navigation, and visual feedback.

### Step G: Production Build Verification

Compile the full production bundle to ensure zero TypeScript, SCSS budget, or template compilation errors:

```bash
npx ng build --configuration=production
```

_Rule: Must exit with code 0 (`Application bundle generation complete`)._

---

## 3. Feature & Module Documentation Standards

Using skills `/documentation`, `/documentation-generation-doc-generate`, and `/documentation-templates`:
For each completed feature and module, maintain clean and structured documentation in a `README.md` file within the feature/module directory (e.g. `src/app/features/student/exams/README.md` and `src/app/features/student/README.md`):

1. **Feature Overview:** Business goals, user personas, and UX journey.
2. **Component Architecture:** Component hierarchy, signals data flow, inputs, and outputs.
3. **Backend API Contracts:** HTTP endpoints, request/response DTO interfaces, error handling, and mock fallback strategies.
4. **Testing Matrix:** Summary of Unit, Integration, and Playwright E2E test coverage.

---

## 4. Git Staging & Local Commit

Stage only the feature-related files and commit locally:

```bash
git add <feature-related-files>
git commit -m "feat(<module>): <concise, detailed description in Conventional Commits format>"
```

_Rule: Do NOT push automatically. Always keep changes in the local branch until explicitly authorized._

---

## 5. Manual Test Guideline Output

At the end of every feature turn, output a structured **Manual Test Guideline** for the user:

1. **Local Server URLs:** (e.g., `http://localhost:4200/student/exams/exam-1/take`)
2. **Visual Checklist:** Explicit UI elements to inspect (Header, Hero card, Options list, Timer countdown, Badges, Modals).
3. **Interactive Actions:** Specific clicks and steps to test (Select radio options, Next/Prev navigation, Submit exam, Toggle flags, Filters).

---

## 6. User Push Prompt

Always conclude by asking the user explicitly for confirmation before pushing to remote (`git push origin <branch-name>`) or proceeding to the next feature branch.
