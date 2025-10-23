# VillaSaya - Replit Setup

## Overview

VillaSaya is a comprehensive villa management application built with React, Vite, and Supabase. Its primary purpose is to streamline villa operations for landlords, agents, tenants, and staff, offering features for managing villas, tasks, expenses, staff, calendar events, and messaging. The project aims for an App Store Ready+ with Premium Polish standard, adhering to Apple Human Interface Guidelines on mobile and tablet devices.

## User Preferences

I want iterative development.
I prefer detailed explanations.
Ask before making major changes.
Do not make changes to the `docs/` folder.
Do not make changes to the `.github/` folder.
Do not make changes to the `.replit` file.
Do not make changes to the `replit.nix` file.

## System Architecture

VillaSaya utilises React 18 with TypeScript for the frontend, built with Vite. Styling is managed with Tailwind CSS and custom design tokens, leveraging Radix UI primitives. The backend is powered by Supabase, providing authentication, a PostgreSQL database, and storage. Serverless functions are implemented using Hono within Supabase Edge Functions.

**Key Architectural Decisions:**

* **UI/UX**: Mobile-first responsive design adhering to Apple Human Interface Guidelines 2025, including accessibility, typography (SF Pro, Dynamic Type, 14px min font), and touch targets (44x44pt). Includes iPad optimisation, landscape support, iOS-native spring animations, large title navigation, and bottom sheets.
  **Platform Design Boundary:** Apple HIG applies **only** to mobile and tablet breakpoints (≤1024 px). Desktop and large-screen interfaces follow a **consumer-grade design system** (see *Consumer UI Addendum*), prioritising readability, comfort, and friendly visual hierarchy, while maintaining a structured 24-column layout.
* **Accessibility**: Comprehensive ARIA labels, focus management, semantic HTML5, and live regions.
* **State Management**: Primarily React Hooks (useState, useEffect) and Context API.
* **Authentication**: Supabase Auth for email/password and OAuth.
* **Data Management**: Supabase PostgreSQL for structured data, Supabase Storage for file uploads. Custom data-fetching hooks centralise API interactions.
* **Shared UI Components**: Reusable components like `DataList`, `PageHeader`, `Skeleton Components`, and `LoadingState` streamline UI development and ensure consistency across mobile and desktop views.
* **Custom Business Logic Hooks**: Decouple business logic from UI components via hooks such as `useChatThread`, `useClockStatus`, `useExpenseTemplates`, `useExpenseSubmit`, and `useCalendarIntegration` for improved reusability and testability.
* **Feature Specifications**: Dashboard, Task Management (Kanban), Expense Tracking, Calendar, Messaging, Staff Management (clock in/out, leave), Invite Codes, Document Upload, Multi-Villa Support, Admin Settings (system configuration), User Preferences (theme, notifications, personalisation).
* **PWA Support**: Full Progressive Web App capabilities including manifest, service worker for offline caching, and theme colours.
* **Form Enhancements**: Real-time validation, upload progress tracking, and multi-step forms.
* **iOS-Native Gestures**: Implements swipe-to-delete, pull-to-refresh, haptic feedback, and skeleton loading screens.
* **Deployment Readiness**: Comprehensive environment configuration, database migrations, security best practices (gated dev endpoints), and documentation for production deployment.
* **Consumer-Grade Layout Direction**: 24-column grid, card-based composition, relaxed spacing, and typography optimised for readability on desktop. Designed for mixed mouse/touch input.
* **Settings & Preferences Architecture**: Separate admin-level Settings (system configuration, security, billing, integrations) from user-level Preferences (theme, notifications, display options). Settings via sidebar; Preferences via user menu.
* **Consumer-Friendly DataTable Features**: Simple table component with sorting, column visibility, and saved views persisted to localStorage with SSR guards. Defaults to relaxed spacing; density is an opt-in.
* **Customisable Dashboard Widgets**: Drag-and-drop dashboard with 10 widget types (Quick Stats, Tasks, Expenses Summary, Calendar, Staff Status, Messages, Leave Requests, Expense Chart, Quick Actions, Announcements). Layouts persist via localStorage, use @dnd-kit for smooth interactions, and support configurable sizes.

## External Dependencies

* **Supabase**: Backend-as-a-Service (PostgreSQL, Auth, Storage, Edge Functions).
* **React**: Frontend JavaScript library.
* **Vite**: Frontend tooling.
* **Tailwind CSS**: Utility-first CSS framework.
* **Radix UI**: Unstyled, accessible component primitives.
* **Hono**: Ultrafast web framework for Supabase Edge Functions.
* **@dnd-kit**: Drag-and-drop toolkit for React (Kanban board & dashboard widgets).

---

# Global Agent Behaviour Guidelines

These universal rules apply to all code written or modified in this repository.
They supplement, but do not override, the VillaSaya-specific architecture above.

## Default Agent Reasoning & Capability Baseline

The Agent must always operate as if **High Power Model** mode is enabled, regardless of Replit’s current settings:

* **Full-context reasoning:** Understand repository architecture, dependencies, and design patterns before editing.
* **Autonomous planning:** Use a multi-step plan → implement → verify loop without waiting for approval on minor steps.
* **Cross-file consistency:** When editing one file, check and adjust dependent modules/components/hooks as needed.
* **Error anticipation:** Proactively identify likely build/import/type/runtime errors and resolve them before yielding.
* **Readable, maintainable code:** Prefer clarity and consistency over brevity or “clever” one-liners.
* **Controlled verbosity:** Concise chat messages; **explicit clarity in code** (names, types, brief docstrings where they add value).
* **Efficient resource use:** Avoid unnecessary rebuilds/searches/tests once verification is achieved.
* **Result assurance:** Apply “Testing and Verification” and “Self-Verification” standards rigorously before completion.

This baseline applies whether or not Replit **High Power Model**, **App Testing**, or **Autonomy Level** options are toggled.

## Core Principles

* Resolve the request fully by editing, testing, and validating code within this environment.
* Work autonomously but responsibly — plan, implement, test, and confirm results before yielding.
* Prioritise **correctness, clarity, and minimalism** in every change.
* Preserve existing project structure, naming conventions, and file organisation.
* Do not add new frameworks or dependencies unless explicitly required.

## Coding Standards

* Fix problems at their **root cause**, not via superficial patches.
* Keep diffs small and relevant only to the requested task.
* Follow existing style/formatting (respect `.editorconfig`, `.prettierrc`, `pyproject.toml`, etc.).
* Use descriptive names and concise comments/docstrings where helpful.
* Update documentation only when behaviour changes.
* Do **not** modify or add licence headers.

## Testing and Verification

* **Always test work before marking complete.**
* Run build/test/runtime commands to confirm functionality.
* If tests exist, ensure all pass after your change.
* For apps without automated tests, run key flows manually to confirm correctness.
* Fix configuration or runtime errors that result from your own changes.

## Self-Verification and Completion Assurance

Before stating “Task complete” or equivalent:

1. Ensure the user’s explicit request has been fully satisfied.
2. Review diffs (`git diff` / Replit diff).
3. Sanity-check runtime — app builds and runs without error.
4. Clearly state verification results (e.g. “npm test — all passed”).
5. Do **not** declare success prematurely.
6. Never mark complete if anything remains untested or uncertain.

Incomplete verification = incomplete task.

## Security and Privacy

* You may fix obvious security flaws.
* Never output or log secrets, tokens, or credentials.
* **External API access is permitted when relevant** to the feature. Use secure environment variables and adhere to existing key/config practices.
* When Web Search is enabled, use it only for documentation/reference; do not paste in code with unclear licensing.

## Communication Style

* Be clear, accurate, and professional.
* For small tasks: summarise changes + verification in bullet points.
* For large tasks: outline plan, files touched, testing steps, outcomes.
* Confirm successful build/test before closing.
* Avoid dumping entire large files; reference file paths and snippets.
* State any assumptions made.

## Tool Usage

* Use Replit’s built-in editor, runner, and test tools.
* Avoid unsupported patch utilities.
* Clean up debugging artefacts.
* Don’t rely on undeclared environment variables.

## Design & UX Guidelines

*(Applies to all UI or visual code in this project.)*

### Guiding Principles

* **Clarity & Reuse:** Components must be modular and reusable; avoid duplication.
* **Consistency:** Follow unified design tokens for colour, typography, spacing, and components.
* **Simplicity:** Keep components small and focused; avoid unnecessary logic or style layers.
* **Demo-Oriented:** Support rapid prototyping and feature showcases (streaming, multi-turn, integrations).
* **Visual Quality:** Maintain a premium, polished appearance — consistent padding, spacing, and hover states.

### UI/UX Best Practices

* **Visual Hierarchy:** 4–5 type sizes; `text-xs` for captions, `text-xl` only for hero headings.
* **Colour Usage:** One neutral base (`zinc`, `slate`, or `gray`) plus ≤2 accent colours.
* **Spacing & Layout:** 4px base grid; prefer 8/16/24 for sections; use fixed-height containers with internal scrolling.
* **State Handling:**

  * Skeleton loaders (`animate-pulse`) or shimmer placeholders.
  * Hover/focus states (`hover:bg-*`, `hover:shadow-md`).
* **Accessibility:** Semantic HTML + ARIA; prefer Radix or shadcn/ui components for built-in accessibility.

### Consumer UI Addendum (Desktop & Large-Screen Views)

**Intent:** Desktop and large-screen views should feel like a **consumer-grade web app** — friendly, readable, and comfortable, while maintaining structured alignment through a **24-column grid system**. Mobile and tablet breakpoints continue to follow Apple HIG standards.

* **Layout & Structure:** Desktop ≥1280 px; `max-w-[1280px] md:max-w-[1440px] mx-auto`; `grid grid-cols-24 gap-4 md:gap-6`; 4px base spacing; card-first layouts; relaxed density by default with optional “Compact” toggle.
* **Colour & Hierarchy:** Soft neutrals with clear contrast; brand `#7152F3` as primary accent. Backgrounds `bg-gray-50 / bg-white`; text `text-gray-900 / text-gray-700`; subtle borders `border-gray-200`; gentle elevation `shadow-sm`.
* **Typography:** `["SF Pro Text","Inter","system-ui","Segoe UI","sans-serif"]`; base `text-[16px] leading-7`; headings `text-xl–text-2xl font-semibold`; supportive `text-sm` for meta.
* **Controls & Surfaces:** Buttons `text-base px-4 py-2.5 rounded-lg transition-all`; primary `bg-indigo-600 text-white hover:bg-indigo-500`; secondary `bg-white border border-gray-300 text-gray-800 hover:bg-gray-50`; inputs `h-11 px-4 text-base rounded-lg focus:ring-2`.
* **Tables & Lists:** Readable defaults; row height ≈ `h-12`; cells `px-4 py-3`; soft dividers; zebra optional. Sorting and column visibility included; resizing optional.
* **Badges & Status:** Soft tones; `text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1`.
* **Iconography:** Clear icons (Lucide/Heroicons/Tabler) `w-5 h-5`; filled variants allowed.
* **Interactions & Motion:** `transition-all duration-200`; micro-animations for hover/focus; empty states with short copy; focus rings `focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2`.
* **Dark Mode:** Tailwind `dark:` variants; page `dark:bg-gray-900`; cards `dark:bg-gray-800`; borders `dark:border-gray-700`; text `dark:text-gray-200`; accent `dark:bg-indigo-500 hover:dark:bg-indigo-400`.
* **Accessibility (WCAG 2.1 AA):** Contrast ≥4.5:1 body, ≥3:1 large text; semantic HTML/ARIA; visible focus; `sr-only` for icon-only; `aria-live="polite"`; test with Lighthouse, axe-core, NVDA, VoiceOver.

---

## Planning & Execution Playbook (Agent)

**Purpose:** lift output quality on large edits, multi-file refactors, and new features without needless chatter.

1. **Plan → Implement → Verify loop**

   * *Plan:* outline files to change, key functions, expected outputs.
   * *Implement:* small, verifiable steps.
   * *Verify:* run build/tests/app; state concrete evidence of success (commands + key results).
   * On failure, apply *Failure Recovery & Debugging* before closing.

2. **Quality rubric (state a one-liner for each before completion)**
   **Correctness • Clarity • Consistency • Safety • Performance • Testability • Docs/UX**

3. **Autonomy & approvals**

   * Be proactive for small/medium changes; ask first for **major** edits (schema, dependencies, protected folders).
   * Prefer shipping a working slice, then request acceptance.

4. **Verbosity balance**

   * Chat: concise status + verification summary.
   * Code: verbose for clarity (names, types, minimal comments where they add value).

## Match the Codebase (Agent)

* Read first: `package.json`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `.prettierrc`, `.editorconfig`, `src/components/*`, `src/lib/*`, `supabase/*`, `edge-functions/*`.
* Mirror directory boundaries, import/alias patterns, and barrel usage.
* Reuse Tailwind tokens, CSS vars, Radix/shadcn primitives — don’t invent parallel systems.
* Follow existing fetch hooks, error patterns, and data contracts.
* Avoid gratuitous dependencies.

## Context Understanding (Agent)

* Gather **just enough** repo context to act confidently; avoid excessive file crawling.
* Prefer local repo knowledge over external lookups.
* If ambiguous but safe, document your assumption and proceed; if risky (data loss/schema), pause and ask.

## Code Editing Rules (Agent)

**Guiding principles:** clarity & reuse • consistency • simplicity • demo-friendly • visual quality.
**Output:** small focused diffs; tests/docs updated when behaviour changes; provide a short **What changed / Why / How verified** list.

## Long-Horizon Tasks (Agent)

* **Checkpoint plan** with phases/deliverables.
* **Ship in slices** and include verification evidence each time.
* **Carry context forward** with a brief running log of decisions.

---

## Agent Tool Compatibility Notes

These rules operate harmoniously across all Replit Agent settings.

### App Testing

* If **App Testing** is enabled, incorporate its results into Verification before declaring completion.
* If disabled, run equivalent build/tests per *Testing and Verification*.

### Autonomy Level

* Repository rules take precedence irrespective of autonomy (Low → Max).
* **Low/Medium:** may ask clarifying questions before major edits.
* **High/Max:** may act autonomously on small/medium changes, but **must** respect “ask before major change” boundaries (schema, dependencies, protected folders).

### High Power Model

* Emulate high-power behaviour at all times (see **Default Agent Reasoning & Capability Baseline**).
* Prefer maintainable clarity over dense cleverness.

### Web Search

* Use for documentation/reference only; never paste code of unclear licence.
* Never include secrets or internal identifiers in queries.

### Image Generation

* OK for conceptual UI previews; never a substitute for coded UI.

---

## Failure Recovery & Debugging

If a build, test, or runtime task fails, the Agent must **diagnose and recover** before yielding:

1. **Identify failure type:** build / runtime / test.
2. **Analyse root cause:** read the stack trace; determine if caused by your changes.
3. **Repair & retest:** minimal targeted fix; rerun until resolved.
4. **Document recovery:** summarise error, cause, fix, and verification.
5. **Escalate only** if a major refactor or missing dependency prevents repair.

No silent or partial completions — every failure must be addressed or clearly reported.

---

## Definition of Done

A task is **complete** only when:

* The request is fully implemented and verified.
* Code builds and runs without errors.
* Tests (if present) pass.
* UI changes conform to mobile HIG or consumer desktop rules as appropriate.
* Documentation updated if behaviour changed.
* A concise verification summary is provided.

---

*These rules apply to all code in this repository unless a later project-specific section overrides them.*

---
