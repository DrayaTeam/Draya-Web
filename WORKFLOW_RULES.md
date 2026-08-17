# Draya Web — Mandatory Feature Implementation & Verification Workflow

This rule document defines the mandatory, non-negotiable verification pipeline that must be executed **AFTER ANY FEATURE OR BUG FIX IS IMPLEMENTED** in the Draya codebase.

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
*Rule: 0 errors and 0 warnings allowed.*

### Step B: Code Formatting
Format all modified/created files using Prettier:
```bash
npx prettier --write "src/**/*.{ts,html,scss,json}"
```

### Step C: Unit & Integration Testing
Execute Karma/Jasmine unit tests for services and components:
```bash
npx ng test --watch=false
```
*Rule: 100% of test specs must pass (TOTAL SUCCESS).*

### Step D: End-to-End (E2E) Browser Testing
Run Playwright browser automation tests to verify real DOM rendering, interactions, viewports, and navigation:
- Desktop viewport (1440x900 / 1920x1080)
- Mobile viewport (375x667 / 390x844)
- Verification of page elements, click events, routing, and visuals.

### Step E: Production Build Verification
Compile the full production bundle to ensure zero TypeScript or Angular template compilation errors:
```bash
npx ng build --configuration=production
```
*Rule: Must exit with code 0 (`Application bundle generation complete`).*

---

## 3. Manual Verification Checklist Output
At the conclusion of every turn, output a structured **Manual Verification Guide** for the user specifying:
1. **Local Server URL:** (e.g., `http://localhost:4200/teacher/dashboard`)
2. **Visual Checklist:** Explicit UI elements to verify (Header, Stat cards, Charts, Responsive Sidebar, Tables).
3. **Interactive Actions:** Key buttons/clicks to test (Time range toggle, Quick Action buttons, Drawer toggle).
