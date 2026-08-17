# درايَة (Draya) — Design System Guidelines

This document outlines the core visual, interactive, and structural guidelines of the **درايَة (Draya)** platform. It preserves the primary brand identity while providing clear, flexible boundaries for extending layouts, colors, animations, and illustration choices.

---

## 1. Core Color Palette (Non-Negotiable Brand Values)

The primary color scale defines the core visual identity of **درايَة** as a premium educational assistant. These values must remain consistent across all workspaces.

### 🟢 Primary Teal Scale (Core Brand)

- **Primary Accent (`--draya-primary-700`)**: `#1B6D63` — Used for main interactive elements, primary buttons, and headings.
- **Dark Accent (`--draya-primary-900`)**: `#0F4F49` — Used for footers, visual decoration backdrops, and high-emphasis panels.
- **Medium Dark (`--draya-primary-800`)**: `#145A53` — Used for cards hover states and subtle borders.
- **Soft Backgrounds**:
  - `primary50` (`#F5FCFB`)
  - `primary100` (`#DDF5F1`)
  - `primary200` (`#B7E8E1`)

### 🔮 AI Accent Scale (AI-Powered features)

- **AI Highlight (`--draya-ai-700`)**: `#7C3AED` — Used for AI Exam Builder badges, AI reports, and smart analytics metrics.
- **AI Soft (`--draya-ai-50`)**: `#F7F3FF` — Used for background tints behind generated AI blocks.

---

## 2. Flexible Accent System (Allowing Extension)

While the primary brand remains teal and violet (AI), you are encouraged to use a flexible supporting color system when adding new modules, academic subjects, or badges.

### Supporting Academic Subject Colors

Feel free to use contrasting semantic colors to identify different subjects or statuses:

- **Math/Physics**: Blue (`#3B82F6`) or Amber (`#F59E0B`)
- **Chemistry/Biology**: Emerald (`#22C55E`) or Cyan (`#06B6D4`)
- **Humanities**: Pink/Rose (`#EC4899`)
- **Rules for New Colors**:
  1. Always pair a strong foreground accent color with its ultra-light counterpart (opacity `8%` to `12%`) as a card or badge background to guarantee legibility.
  2. Maintain a contrast ratio of at least `4.5:1` for text against any custom background.

---

## 3. Imagery, Blob Shapes, and Illustrations

To make the platform feel organic, modern, and alive, we blend real human photography with abstract layouts, SVG illustrations, and organic blob shapes.

### 🎨 Guidelines for Graphics:

- **Real Photography**: High-quality imagery of students and classrooms should be framed with slight rotations (`rotate-1` or `-rotate-1`), rounded corners (`16px`), and soft borders to feel like floating cards.
- **Vector Illustrations**: You can replace or augment real images with clean vector educational illustrations (flat or isometric) using the brand's teal and soft accents.
- **Organic Blobs (`BlobBg` / SVGs)**:
  - Use overlapping gradient blobs (`linear-gradient(135deg, rgba(27,109,99,0.12) 0%, rgba(124,58,237,0.06) 100%)`) to break up strict grid layouts.
  - Keep blob background shapes behind text layers to add layers of depth without interfering with reading flow.
- **Abstract Patterns (`DecorativeScatter`)**: Use light dot-matrix grids or grid lines to populate empty header spaces.

---

## 4. Layout & Responsive Grid Standards

The platform is designed **RTL-first (Right-to-Left)**.

### Section Containers

- All content sections must be centered with `max-width: 1280px; margin: 0 auto; width: 100%;`.

### Multi-Column Grid Rules (Anti-Stacking Pattern)

- Major card grids (e.g. 3-column features, why cards, pricing plans, testimonials) must define explicit CSS grid columns in their component `.scss` stylesheet:
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
- **Split Hero Layout**: Desktop uses explicit side-by-side flex columns (`50%` / `50%` split with gap) and collapses gracefully to column flow below `1024px`.
- **Minimum Touch Targets**: Make sure all buttons, toggles, and clickable drawer links meet the `44px x 44px` minimum touch target size standard for mobile devices.

---

## 5. Animations & Micro-interactions

Motion should make the platform feel responsive and dynamic, never slow.

### ✨ Preserving Motion:

- **Active Click Scales**: All interactive buttons should scale down slightly on click (`active:scale-[0.98]`) to feel tactile.
- **Hover Transitions**: Apply smooth timing properties (`transition: all 150ms ease-out`) for card hovers, link highlights, and button expansions.
- **Slide-In Drawers**: Sidebar navigation drawers must animate off-screen cleanly using coordinate transitions (`transition: right 0.3s ease-in-out`) rather than raw display toggles.
- **Entrance Animations**: Use soft fade-in/slide-up keyframes (`animate-fade-in` / `translate-y-4` to `translate-y-0`) for modal entries, warning cards, and success checkmarks.

---

## 6. Advanced Visual Design Patterns

These patterns must be enforced across all marketing and pricing elements of the platform:

### 🌟 Premium Recommended Plan Badge (Sparkles Badge)

- **Gradient**: `linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)` (Warm Amber to Ruby Red).
- **Icons**: A rotating gold `Sparkles` icon next to the text.
- **Shadow**: `0 10px 20px -5px rgba(239, 68, 68, 0.4)` (glowing red/orange shadow).
- **Badge Text**: Strictly **"موصى به 🔥"** (Recommended).

### 🧾 Flat Borderless FAQ Accordion Layout

- **Container**: Zero card wrapper boxes; rows are borderless transparent containers separated by a thin horizontal divider: `border-bottom: 1px solid var(--draya-border)`.
- **Chevron Toggle Circular Button**:
  - **Collapsed**: Soft teal circular background (`#F0FAF7`) with primary green `ChevronDown`.
  - **Expanded**: Solid primary green circular background (`var(--draya-primary-700)`) with white `ChevronDown` rotated 180 degrees.
  - **Interaction**: Row button spans full width with `justify-content: space-between` and event propagation stopped cleanly.

### 🫧 Bleeding Background Blobs (Anti-Clipping Pattern)

- **Page Container rule**: Never use `overflow-hidden` on individual page container divs (e.g. dashboard, grades list, exams page). Doing so cuts the blurred background blobs sharply, creating harsh vertical/horizontal edges.
- **Layout Wrapper rule**: Enforce `overflow-x: hidden` exclusively at the outermost root layout shells. This prevents horizontal scrollbars while letting absolute blurred elements bleed past content boundaries and fade out smoothly towards the viewport edges.

---

## 7. Angular Component Architecture

- **Strict File Triad Separation**: Every component must have 3 dedicated files:
  - `<name>.component.ts`
  - `<name>.component.html`
  - `<name>.component.scss`
  - **Forbidden**: Inline `template: \`...\``or inline`styles: [...]`or inline`style="..."` attributes.
- Use **standalone components** (Angular 20) with `ChangeDetectionStrategy.OnPush`.
- Smart components handle service calls; dumb components only receive signals/inputs and emit outputs.
- RTL Support: Set `dir="rtl"` at the root `<html>` element and use logical CSS properties.
