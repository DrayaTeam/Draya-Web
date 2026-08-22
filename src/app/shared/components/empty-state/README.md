# Shared Empty State Component (`<draya-empty-state>`)

## 1. Feature Overview

The `EmptyStateComponent` is a reusable, accessible UI component designed to eliminate dead ends and apply behavioral UX persuasion principles (Fogg Behavior Model, loss aversion, momentum building) whenever data lists (classrooms, exams, submissions, transactions) are empty.

## 2. Component Architecture

- **Selector:** `draya-empty-state`
- **Pattern:** Strict 3-file triad (`.ts`, `.html`, `.scss`), Standalone, OnPush change detection.
- **Inputs:**
  - `icon`: `'inbox' | 'exam' | 'book' | 'teacher' | 'wallet' | 'search' | 'target' | 'qa'`
  - `titleKey`: i18n translation key or text string
  - `descriptionKey`?: optional i18n description key
  - `primaryActionLabelKey`?: primary CTA text
  - `primaryActionRoute`?: optional navigation link
  - `secondaryActionLabelKey`?: secondary CTA text
  - `secondaryActionRoute`?: optional secondary link
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- **Outputs:**
  - `primaryActionClick`: Emitted when primary button is clicked
  - `secondaryActionClick`: Emitted when secondary button is clicked

## 3. Testing Matrix

- Unit tests: `empty-state.component.spec.ts` covers rendering, custom inputs, and action emissions.
