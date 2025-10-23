# VillaSaya Design System

A comprehensive design system for the VillaSaya villa management application, ensuring consistency across all mobile and desktop interfaces.

## 📐 Design Tokens

All design tokens are centralized in `/styles/design-tokens.css` and `/utils/theme.ts`.

### Colors

#### Brand Colors
- **Primary**: `#7B5FEB` (Purple)
- **Primary Dark**: `#6B4FDB`
- **Primary Light**: `#9B8DF5`

#### Semantic Colors
- **Success**: `#28C76F` (Green)
- **Warning**: `#FF9F43` (Orange)
- **Error**: `#EA5455` (Red)
- **Info**: `#00CFE8` (Cyan)

#### Neutral Colors
- **Black**: `#1F1F1F`
- **Gray Scale**: `gray-900` through `gray-100`
- **White**: `#FFFFFF`

### Usage in CSS
```css
background-color: var(--vs-primary);
color: var(--vs-text-primary);
```

### Usage in TypeScript
```typescript
import { COLORS } from '@/utils/theme';

const primaryColor = COLORS.primary;
```

## 🎨 Component Library

### Layout Components

#### MobileLayout
Main container for mobile views with status bar.

```tsx
import { MobileLayout } from '@/components/mobile';

<MobileLayout statusBarStyle="gradient" showStatusBar={true}>
  {/* Your content */}
</MobileLayout>
```

**Props:**
- `statusBarStyle`: `'gradient' | 'white' | 'transparent'`
- `showStatusBar`: `boolean`

#### MobileHeader
Standardized header with back button and actions.

```tsx
import { MobileHeader } from '@/components/mobile';

<MobileHeader
  title="Tasks"
  subtitle="Manage your tasks here."
  onBack={() => navigate(-1)}
  rightAction={<NotificationBell />}
  variant="gradient"
  showDecorations={true}
/>
```

**Props:**
- `title`: `string` (required)
- `subtitle`: `string`
- `onBack`: `() => void`
- `rightAction`: `ReactNode`
- `variant`: `'gradient' | 'white'`
- `showDecorations`: `boolean`

### UI Components

#### MobileCard
Reusable card component with consistent styling.

```tsx
import { MobileCard } from '@/components/mobile';

<MobileCard onClick={() => handleClick()} padding="md">
  {/* Card content */}
</MobileCard>
```

**Props:**
- `onClick`: `() => void`
- `padding`: `'none' | 'sm' | 'md' | 'lg'`
- `className`: `string`

#### MobileButton
Consistent button component with variants and states.

```tsx
import { MobileButton } from '@/components/mobile';

<MobileButton
  variant="primary"
  size="lg"
  onClick={handleSubmit}
  loading={isLoading}
  icon={<CheckCircle />}
>
  Submit
</MobileButton>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'success' | 'error' | 'outline'`
- `size`: `'sm' | 'md' | 'lg'`
- `loading`: `boolean`
- `disabled`: `boolean`
- `icon`: `ReactNode`
- `fullWidth`: `boolean`

#### MobileInput
Standardized input field with label and icons.

```tsx
import { MobileInput } from '@/components/mobile';
import { Mail } from 'lucide-react';

<MobileInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  leftIcon={<Mail className="w-5 h-5 text-vs-primary" />}
  error={errors.email}
/>
```

**Props:**
- `label`: `string`
- `error`: `string`
- `leftIcon`: `ReactNode`
- `rightIcon`: `ReactNode`
- All standard HTML input attributes

#### MobileSearchBar
Search input with icon.

```tsx
import { MobileSearchBar } from '@/components/mobile';

<MobileSearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search tasks..."
/>
```

#### FilterChip
Chip component for filters.

```tsx
import { FilterChip } from '@/components/mobile';

<FilterChip
  label="Pending"
  active={filter === 'pending'}
  onClick={() => setFilter('pending')}
  count={10}
  variant="warning"
/>
```

**Props:**
- `label`: `string` (required)
- `active`: `boolean` (required)
- `onClick`: `() => void` (required)
- `count`: `number`
- `variant`: `'primary' | 'success' | 'warning' | 'error'`

#### StatusBadge
Displays status with appropriate color and icon.

```tsx
import { StatusBadge } from '@/components/mobile';

<StatusBadge status="approved" showIcon={true} size="md" />
```

**Props:**
- `status`: `string` (required) - Uses STATUS_CONFIG from theme
- `showIcon`: `boolean`
- `size`: `'sm' | 'md' | 'lg'`

#### IconContainer
Colored background container for icons.

```tsx
import { IconContainer } from '@/components/mobile';
import { Calendar } from 'lucide-react';

<IconContainer size="md" variant="primary">
  <Calendar className="w-5 h-5" />
</IconContainer>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'`
- `variant`: `'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'`

#### StatCard
Display statistics with labels and values.

```tsx
import { StatCard } from '@/components/mobile';

<StatCard
  label="Total"
  value={total}
  color="primary"
  onClick={() => navigate('/details')}
/>
```

**Props:**
- `label`: `string` (required)
- `value`: `string | number` (required)
- `icon`: `ReactNode`
- `color`: `'primary' | 'success' | 'warning' | 'error'`
- `onClick`: `() => void`

#### MobileBottomNav
Bottom navigation bar.

```tsx
import { MobileBottomNav } from '@/components/mobile';

<MobileBottomNav
  activeTab="tasks"
  onTabChange={(tab) => navigate(tab)}
/>
```

## 🎯 CSS Utility Classes

### Gradient Backgrounds
```css
.bg-gradient-primary
.bg-gradient-success
.bg-gradient-warning
.bg-gradient-error
```

### Status Dots
```css
.status-dot
.status-dot-pending
.status-dot-approved
.status-dot-rejected
```

### Mobile Safe Areas
```css
.safe-area-top
.safe-area-bottom
.safe-area-inset
```

### Text Colors
```css
.text-vs-primary
.text-vs-secondary
.text-vs-tertiary
.text-vs-muted
```

### Background Colors
```css
.bg-vs-primary
.bg-vs-secondary
.bg-vs-tertiary
```

### Component Patterns
```css
.mobile-container
.mobile-header
.mobile-card
.mobile-input
.mobile-button
.mobile-button-primary
.mobile-button-secondary
.status-badge
.filter-chip
.filter-chip-active
.filter-chip-inactive
.icon-container
.icon-container-sm
.icon-container-md
.icon-container-lg
.search-input
.divider-vertical
.divider-horizontal
```

## 🔧 Theme Utilities

### Helper Functions

```typescript
import {
  getStatusConfig,
  getPriorityConfig,
  formatCurrency,
  formatDate,
  getCurrentGreeting,
  getStatusTime,
} from '@/utils/theme';

// Get status configuration
const statusConfig = getStatusConfig('approved');
// Returns: { color, bg, label, dotClass }

// Get priority configuration
const priorityConfig = getPriorityConfig('high');
// Returns: { color, bg, icon, label }

// Format currency
const formatted = formatCurrency(1250.50);
// Returns: "$1250.50"

// Format date
const shortDate = formatDate('2024-01-15', 'short');
// Returns: "Jan 15"
const longDate = formatDate('2024-01-15', 'long');
// Returns: "January 15, 2024"

// Get greeting
const greeting = getCurrentGreeting();
// Returns: "Good Morning" | "Good Afternoon" | "Good Evening"

// Get current time
const time = getStatusTime();
// Returns: "08:15"
```

### Status Configuration

The system includes predefined status configurations for:
- **Expenses**: `pending`, `approved`, `rejected`
- **Tasks**: `todo`, `in_progress`, `review`, `done`
- **Staff**: `active`, `inactive`, `clocked_in`, `clocked_out`, `on_leave`

### Priority Configuration

Predefined priorities for tasks:
- `low`, `medium`, `high`, `urgent`

## 📏 Spacing Scale

Based on 4px increments:
- `--vs-space-1`: 4px
- `--vs-space-2`: 8px
- `--vs-space-3`: 12px
- `--vs-space-4`: 16px
- `--vs-space-6`: 24px
- `--vs-space-8`: 32px

## 📝 Typography Scale

- `--vs-text-xs`: 11px
- `--vs-text-sm`: 12px
- `--vs-text-base`: 13px
- `--vs-text-md`: 14px
- `--vs-text-lg`: 15px
- `--vs-text-xl`: 16px
- `--vs-text-2xl`: 18px
- `--vs-text-3xl`: 20px
- `--vs-text-4xl`: 24px
- `--vs-text-5xl`: 28px

## 🎨 Border Radius Scale

- `--vs-radius-sm`: 8px
- `--vs-radius-md`: 12px
- `--vs-radius-lg`: 16px
- `--vs-radius-xl`: 20px
- `--vs-radius-2xl`: 24px
- `--vs-radius-full`: 9999px

## 🌓 Shadows

- `--vs-shadow-sm`: Subtle shadow
- `--vs-shadow-md`: Medium shadow
- `--vs-shadow-lg`: Large shadow
- `--vs-shadow-xl`: Extra large shadow
- `--vs-shadow-2xl`: Maximum shadow

## 📱 Component Heights

- `--vs-input-height`: 56px
- `--vs-input-height-sm`: 48px
- `--vs-button-height`: 56px
- `--vs-button-height-sm`: 48px
- `--vs-mobile-bottom-nav`: 84px

## ⚡ Transitions

- `--vs-transition-fast`: 150ms ease
- `--vs-transition-base`: 200ms ease
- `--vs-transition-slow`: 300ms ease

## 🎯 Best Practices

### 1. Always use design tokens
❌ Bad:
```tsx
<div style={{ color: '#7B5FEB' }}>Text</div>
```

✅ Good:
```tsx
<div className="text-[color:var(--vs-primary)]">Text</div>
// or
import { COLORS } from '@/utils/theme';
<div style={{ color: COLORS.primary }}>Text</div>
```

### 2. Use component library
❌ Bad:
```tsx
<button className="w-full h-14 bg-purple-600 rounded-full">
  Submit
</button>
```

✅ Good:
```tsx
import { MobileButton } from '@/components/mobile';
<MobileButton variant="primary">Submit</MobileButton>
```

### 3. Use status helpers
❌ Bad:
```tsx
const color = status === 'approved' ? 'green' : 'red';
```

✅ Good:
```tsx
import { getStatusConfig } from '@/utils/theme';
const { color, label } = getStatusConfig(status);
```

### 4. Consistent spacing
❌ Bad:
```tsx
<div className="mb-3 mt-4 px-5">
```

✅ Good:
```tsx
<div className="mb-[var(--vs-space-3)] mt-[var(--vs-space-4)] px-[var(--vs-space-5)]">
// or use Tailwind equivalents that match the scale
<div className="mb-3 mt-4 px-5">
```

## 🚀 Migration Guide

When refactoring existing components:

1. **Replace hardcoded colors** with design tokens
2. **Use component library** instead of custom implementations
3. **Apply utility classes** instead of inline styles
4. **Use theme helpers** for formatting and configuration
5. **Ensure responsive design** with mobile-first approach

## 📦 File Structure

```
styles/
  ├── design-tokens.css    # All design tokens
  └── globals.css          # Global styles and utilities

utils/
  └── theme.ts             # Theme constants and helpers

components/
  └── mobile/
      ├── index.ts         # Centralized exports
      ├── MobileLayout.tsx
      ├── MobileHeader.tsx
      ├── MobileCard.tsx
      ├── MobileButton.tsx
      ├── MobileInput.tsx
      ├── MobileSearchBar.tsx
      ├── FilterChip.tsx
      ├── StatusBadge.tsx
      ├── IconContainer.tsx
      ├── StatCard.tsx
      └── MobileBottomNav.tsx
```

## 🎨 Color Reference Chart

| Name | Hex | Usage |
|------|-----|-------|
| Primary | #7B5FEB | Buttons, Links, Active States |
| Success | #28C76F | Success messages, Approved status |
| Warning | #FF9F43 | Warnings, Pending status |
| Error | #EA5455 | Errors, Rejected status |
| Gray-900 | #2E3152 | Dark text, Navigation bar |
| Gray-600 | #6E6B7B | Secondary text |
| Gray-500 | #B9B9C3 | Muted text, Placeholders |
| Gray-300 | #E8E8E8 | Borders, Dividers |
| Gray-100 | #F8F8F8 | Backgrounds |

---

**Version**: 1.0.0
**Last Updated**: 2024
