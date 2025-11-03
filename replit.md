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

*   **UI/UX**: Mobile-first responsive design adhering to Apple Human Interface Guidelines 2025 for mobile and tablet breakpoints (≤1024 px). Desktop and large-screen interfaces follow a consumer-grade design system with a 24-column layout, card-based composition, and typography optimized for readability.
*   **Accessibility**: Comprehensive ARIA labels, focus management, semantic HTML5, and live regions.
*   **State Management**: Primarily React Hooks (useState, useEffect) and Context API.
*   **Authentication**: Supabase Auth for email/password and OAuth.
*   **Data Management**: Supabase PostgreSQL for structured data, Supabase Storage for file uploads, with custom data-fetching hooks.
*   **Shared UI Components**: Reusable components like `DataList`, `PageHeader`, `Skeleton Components`, and `LoadingState` for consistency.
*   **Custom Business Logic Hooks**: Decouple business logic from UI components via hooks such as `useChatThread`, `useClockStatus`, `useExpenseTemplates`, `useExpenseSubmit`, and `useCalendarIntegration`.
*   **Feature Specifications**: Dashboard, Task Management (Kanban), Expense Tracking, Calendar, Messaging, Staff Management, Invite Codes, Document Upload, Multi-Villa Support, Admin Settings, and User Preferences.
*   **PWA Support**: Full Progressive Web App capabilities including manifest, service worker for offline caching, and theme colours.
*   **Form Enhancements**: Real-time validation, upload progress tracking, and multi-step forms.
*   **iOS-Native Gestures**: Implements swipe-to-delete, pull-to-refresh, haptic feedback, and skeleton loading screens.
*   **Deployment Readiness**: Comprehensive environment configuration, database migrations, and security best practices.
*   **Settings & Preferences Architecture**: Separate admin-level Settings from user-level Preferences.
*   **Customisable Dashboard Widgets**: Drag-and-drop dashboard with 10 widget types, layouts persisting via localStorage using `@dnd-kit`.

## External Dependencies

*   **Supabase**: Backend-as-a-Service (PostgreSQL, Auth, Storage, Edge Functions).
*   **React**: Frontend JavaScript library.
*   **Vite**: Frontend tooling.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **Radix UI**: Unstyled, accessible component primitives.
*   **Hono**: Ultrafast web framework for Supabase Edge Functions.
*   **@dnd-kit**: Drag-and-drop toolkit for React.