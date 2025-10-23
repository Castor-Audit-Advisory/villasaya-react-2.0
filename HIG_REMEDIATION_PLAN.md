# Apple HIG Compliance Remediation Plan
## VillaSaya Application - Implementation Roadmap

**Version:** 1.0  
**Date:** October 19, 2025  
**Target Compliance:** 95/100 (App Store Ready)  
**Current Compliance:** 68/100

---

## Overview

This remediation plan addresses all non-conformances identified in the HIG Compliance Review. Tasks are organized by priority (Critical → High → Medium → Low) and include specific implementation guidance, code examples, and acceptance criteria.

**Total Estimated Effort:** 200-280 hours  
**Timeline:** 6-8 weeks (with 2-3 developers)

---

## Phase 1: CRITICAL Issues (MUST FIX)
**Priority:** P0 - Blocking  
**Timeline:** Weeks 1-3  
**Effort:** 80-120 hours

### Task 1.1: Implement Comprehensive Accessibility Support
**Severity:** CRITICAL  
**Current Score:** 35/100 → **Target:** 90/100  
**Effort:** 40-60 hours  
**Owner:** Frontend Team

#### Subtasks:

##### 1.1.1: Add ARIA Labels to All Interactive Elements
**Files to Update:** All components in `src/components/`

**Implementation:**

```tsx
// BEFORE: src/components/mobile/MobileCard.tsx
<div onClick={onClick} className="mobile-card">
  {children}
</div>

// AFTER: Add proper ARIA attributes
<div 
  onClick={onClick}
  className="mobile-card"
  role="button"
  tabIndex={onClick ? 0 : undefined}
  aria-label={ariaLabel}
  onKeyDown={(e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  }}
>
  {children}
</div>
```

**Components Requiring Updates (Priority Order):**
1. ✅ `MobileBottomNav.tsx` - Already has some ARIA (expand)
2. ❌ `MobileButton.tsx` - Add `aria-busy` for loading state
3. ❌ `MobileInput.tsx` - Link label with `aria-describedby` for errors
4. ❌ `MobileCard.tsx` - Add role="button" when clickable
5. ❌ All modal/dialog components - Focus trap + `aria-modal`
6. ❌ `FilterChip.tsx` - Add `aria-pressed` for toggle state
7. ❌ `StatusBadge.tsx` - Add `aria-label` for screen readers
8. ❌ All icon-only buttons - Require `aria-label` prop

**Acceptance Criteria:**
- [ ] All interactive elements have `aria-label` or `aria-labelledby`
- [ ] All form inputs linked to labels via `aria-describedby`
- [ ] All custom buttons support keyboard navigation (Enter/Space)
- [ ] Tab order is logical throughout app
- [ ] VoiceOver announces all elements correctly (iOS Safari test)

##### 1.1.2: Implement Focus Management
**Files:** Create `src/hooks/useFocusTrap.ts`, update all modal/dialog components

**Implementation:**

```tsx
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
}

// Usage in Dialog component
export function Dialog({ isOpen, onClose, children }) {
  const trapRef = useFocusTrap(isOpen);

  return (
    <div 
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {children}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Focus trapped in modals/dialogs when open
- [ ] Escape key closes all modals
- [ ] Focus returns to trigger element on modal close
- [ ] No focus on hidden elements

##### 1.1.3: Add Semantic HTML Landmarks
**Files:** `App.tsx`, all page-level components

**Implementation:**

```tsx
// BEFORE: Generic divs everywhere
<div className="app">
  <div className="content">...</div>
  <div className="bottom-nav">...</div>
</div>

// AFTER: Semantic landmarks
<div className="app">
  <header role="banner">
    {/* App header */}
  </header>
  
  <nav role="navigation" aria-label="Main navigation">
    <MobileBottomNav />
  </nav>
  
  <main role="main" id="main-content">
    {/* Page content */}
  </main>
  
  <aside role="complementary" aria-label="Villa switcher">
    <VillaSwitcher />
  </aside>
</div>

// Add skip navigation link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

**Files to Update:**
- `src/App.tsx` - Main app structure
- `src/components/DashboardLayout.tsx` - Desktop layout
- `src/components/mobile/MobileLayout.tsx` - Mobile wrapper
- All page components - Wrap in `<main>` or `<article>`

**Acceptance Criteria:**
- [ ] All pages have proper landmark regions
- [ ] Skip navigation link functional
- [ ] Screen readers can navigate by landmarks
- [ ] Heading hierarchy is logical (h1 → h2 → h3)

##### 1.1.4: Add Live Regions for Dynamic Content
**Files:** Components with dynamic updates (notifications, status changes)

**Implementation:**

```tsx
// For toast notifications
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// For critical alerts
<div 
  role="alert" 
  aria-live="assertive" 
  aria-atomic="true"
>
  {errorMessage}
</div>

// For loading states
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>
```

**Components Requiring Updates:**
- Toast/notification system (Sonner)
- Expense approval feedback
- Task status updates
- Loading states

**Acceptance Criteria:**
- [ ] Screen readers announce status updates
- [ ] Important alerts interrupt screen reader
- [ ] Loading states communicated clearly

---

### Task 1.2: Fix Typography Issues
**Severity:** CRITICAL  
**Current Score:** 45/100 → **Target:** 95/100  
**Effort:** 30-40 hours  
**Owner:** Design + Frontend Team

#### Subtasks:

##### 1.2.1: Replace Inter Font with SF Pro
**Files:** `src/styles/globals.css`, `index.html`

**Implementation:**

```css
/* BEFORE: src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

body {
  font-family: 'Inter', -apple-system, ...;
}

/* AFTER: Use system font stack */
/* Remove Google Fonts import entirely */

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 
               'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* For larger text (20pt+), use Display variant */
h1, h2, h3 {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
               'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; /* SF Pro Display works best at semibold */
}

/* For body text, use Text variant (default) */
```

**Additional Considerations:**
- SF Pro is available on all Apple devices by default
- For web on non-Apple devices, fallback to system fonts (Segoe UI on Windows, Roboto on Android)
- No external font loading = better performance

**Acceptance Criteria:**
- [ ] All text uses system font stack
- [ ] No web font downloads
- [ ] Proper font variants for headings vs. body
- [ ] Consistent rendering across iOS, macOS, iPadOS

##### 1.2.2: Update Minimum Font Size to 11pt (14.67px)
**Files:** `src/styles/design-tokens.css`

**Implementation:**

```css
/* BEFORE */
:root {
  --vs-text-xs: 0.6875rem;  /* 11px - TOO SMALL */
  --vs-text-sm: 0.75rem;     /* 12px */
  --vs-text-base: 0.8125rem; /* 13px */
  --vs-text-md: 0.875rem;    /* 14px */
  /* ... */
}

/* AFTER */
:root {
  /* Remove xs size entirely */
  --vs-text-sm: 0.875rem;    /* 14px (11pt minimum) */
  --vs-text-base: 1rem;      /* 16px */
  --vs-text-md: 1.125rem;    /* 18px */
  --vs-text-lg: 1.25rem;     /* 20px */
  --vs-text-xl: 1.5rem;      /* 24px */
  --vs-text-2xl: 1.875rem;   /* 30px */
  --vs-text-3xl: 2.25rem;    /* 36px */
}
```

**Find & Replace All Instances:**
```bash
# Find all uses of --vs-text-xs
grep -r "vs-text-xs" src/

# Replace with --vs-text-sm or equivalent
# Manual review required for each instance
```

**Components Using Undersized Text (from review):**
- `MobileInput.tsx` - Error messages (13px)
- `StatusBadge.tsx` - Badge text
- `FilterChip.tsx` - Chip labels
- Various timestamp/metadata displays

**Acceptance Criteria:**
- [ ] No text smaller than 14px anywhere in app
- [ ] All components updated to new scale
- [ ] Visual regression testing passed
- [ ] Readability improved on small screens

##### 1.2.3: Implement Dynamic Type Support
**Files:** `src/styles/globals.css`, create `src/hooks/useDynamicType.ts`

**Implementation:**

```css
/* src/styles/globals.css */

/* Define base size that responds to user preferences */
:root {
  /* Use clamp() to support Dynamic Type with reasonable limits */
  --font-size-base: clamp(1rem, 1rem + 0.5vw, 1.25rem);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Support iOS Dynamic Type categories */
@supports (font: -apple-system-body) {
  body {
    font: -apple-system-body;
  }
  
  h1 {
    font: -apple-system-headline;
  }
  
  h2 {
    font: -apple-system-subheadline;
  }
}

/* Fallback for non-iOS: Use relative units */
body {
  font-size: clamp(14px, 1rem, 20px); /* 14px - 20px range */
}

h1 {
  font-size: clamp(24px, 1.75rem, 36px);
}

h2 {
  font-size: clamp(20px, 1.5rem, 28px);
}

/* All component text should use em/rem instead of px */
```

**Update All Components to Use Relative Units:**

```tsx
// BEFORE: Fixed pixel sizes
<p className="text-[14px]">Label</p>

// AFTER: Relative units
<p className="text-sm">Label</p> // Uses rem from Tailwind

// Or with CSS variable
<p className="text-[length:var(--vs-text-sm)]">Label</p>
```

**Create Hook for JavaScript Access:**

```tsx
// src/hooks/useDynamicType.ts
import { useState, useEffect } from 'react';

export function useDynamicType() {
  const [textSizeCategory, setTextSizeCategory] = useState<string>('medium');

  useEffect(() => {
    // Listen for font size changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const updateSize = () => {
      const rootSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      
      if (rootSize >= 20) setTextSizeCategory('xxLarge');
      else if (rootSize >= 18) setTextSizeCategory('xLarge');
      else if (rootSize >= 16) setTextSizeCategory('large');
      else setTextSizeCategory('medium');
    };

    updateSize();
    mediaQuery.addEventListener('change', updateSize);
    window.addEventListener('resize', updateSize);

    return () => {
      mediaQuery.removeEventListener('change', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return { textSizeCategory };
}
```

**Testing:**
1. iOS Settings → Display & Brightness → Text Size → Adjust slider
2. Verify app text scales appropriately
3. Ensure no layout breaking at largest sizes

**Acceptance Criteria:**
- [ ] All text uses relative units (em/rem)
- [ ] Text scales with iOS accessibility settings
- [ ] Layout remains functional at largest text sizes
- [ ] No text overflow or clipping
- [ ] Tested with all Dynamic Type sizes (XS → XXXL)

---

## Phase 2: HIGH Priority Issues (SHOULD FIX)
**Priority:** P1 - Important  
**Timeline:** Weeks 3-4  
**Effort:** 40-60 hours

### Task 2.1: Fix Bottom Navigation Labels
**Current Score:** 95/100 → **Target:** 100/100  
**Effort:** 4-6 hours

**Implementation:**

```tsx
// src/components/mobile/MobileBottomNav.tsx

export function MobileBottomNav({ activeTab = 'home', onTabChange }: MobileBottomNavProps) {
  return (
    <nav 
      role="navigation"
      aria-label="Main navigation"
      className="bg-gradient-primary fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 z-[var(--vs-z-fixed)]"
      style={{ 
        zIndex: 30,
        height: 'calc(70px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(tab.id)}
          className={`
            flex flex-col items-center justify-center gap-0.5 min-w-[56px] px-2 py-2
            transition-all duration-200
            ${activeTab === tab.id ? 'text-white' : 'text-white/70'}
          `}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <tab.icon
            className={`w-6 h-6 transition-all ${
              activeTab === tab.id ? 'scale-110' : 'scale-100'
            }`}
          />
          <span className={`
            text-[10px] font-medium mt-0.5 transition-opacity
            ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}
          `}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
```

**Visual Changes:**
- Add always-visible text labels below icons
- Active tab: white text + slightly larger icon
- Inactive tabs: 70% opacity
- Smooth transitions between states

**Acceptance Criteria:**
- [ ] All tab labels visible at all times
- [ ] Active state clearly indicated
- [ ] Labels don't cause layout shift
- [ ] Tested on smallest iPhone (390pt width)
- [ ] 34% reduction in navigation errors (user testing)

---

### Task 2.2: Verify and Fix Color Contrast Ratios
**Current Score:** 70/100 → **Target:** 100/100  
**Effort:** 12-16 hours

**Tools Required:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Stark plugin for Figma/browser
- axe DevTools Chrome extension

**Process:**

1. **Audit All Text/Background Combinations:**

Create audit spreadsheet with columns:
- Component
- Text Color (hex)
- Background Color (hex)
- Contrast Ratio
- WCAG AA Pass (4.5:1)
- WCAG AAA Pass (7:1)
- Action Required

2. **Critical Combinations to Test:**

```typescript
// Create test file: src/utils/contrastAudit.ts
const colorTests = [
  { 
    name: 'Primary button text',
    fg: '#FFFFFF', // white text
    bg: '#7B5FEB', // primary purple
    required: 4.5
  },
  {
    name: 'Tertiary text on primary bg',
    fg: '#6E6B7B', // --vs-text-tertiary
    bg: '#F8F8F8', // --vs-bg-primary
    required: 4.5
  },
  {
    name: 'Muted text on white',
    fg: '#B9B9C3', // --vs-text-muted
    bg: '#FFFFFF', // --vs-bg-secondary
    required: 4.5
  },
  {
    name: 'Error text',
    fg: '#EA5455', // --vs-error
    bg: '#FFFFFF',
    required: 3.0 // WCAG allows 3:1 for large text
  },
  // ... add all combinations
];

function calculateContrast(fg: string, bg: string): number {
  // Implementation using color-contrast library
}

colorTests.forEach(test => {
  const ratio = calculateContrast(test.fg, test.bg);
  console.log(`${test.name}: ${ratio}:1 (${ratio >= test.required ? 'PASS' : 'FAIL'})`);
});
```

3. **Fix Failed Combinations:**

```css
/* If --vs-text-muted fails on white background */
/* BEFORE */
--vs-text-muted: #B9B9C3; /* 2.8:1 - FAILS */

/* AFTER: Darken until passing */
--vs-text-muted: #9E9EAA; /* 4.5:1 - PASSES */

/* Test in both light and dark modes */
```

4. **Document All Ratios:**

Update `src/DESIGN_SYSTEM.md`:

```markdown
## Color Contrast Ratios (WCAG AA Compliant)

| Combination | Ratio | Status |
|-------------|-------|--------|
| Primary text on primary bg | 5.2:1 | ✅ PASS |
| Secondary text on white | 7.1:1 | ✅ PASS |
| Muted text on white | 4.6:1 | ✅ PASS |
...
```

**Acceptance Criteria:**
- [ ] All text/background combinations pass WCAG AA (4.5:1)
- [ ] Large text (18pt+) passes WCAG AA (3:1)
- [ ] Dark mode contrast ratios documented and tested
- [ ] Contrast audit document created
- [ ] No contrast-related accessibility violations

---

### Task 2.3: Ensure All Touch Targets Meet 44×44pt
**Effort:** 8-12 hours

**Audit Process:**

1. **Identify All Interactive Elements:**
```bash
# Find all buttons, links, and clickable elements
grep -r "onClick\|<button\|<a " src/components/ > touch-targets.txt
```

2. **Create Touch Target Audit:**

```tsx
// src/utils/touchTargetAudit.tsx
import React from 'react';

export function TouchTargetDebugOverlay() {
  useEffect(() => {
    const interactiveElements = document.querySelectorAll(
      'button, a, [role="button"], [onClick]'
    );
    
    interactiveElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        console.warn('Touch target too small:', {
          element: el,
          width: rect.width,
          height: rect.height
        });
        // Add visual indicator in dev mode
        el.classList.add('touch-target-warning');
      }
    });
  }, []);
  
  return null;
}

// Add to App.tsx in development
{process.env.NODE_ENV === 'development' && <TouchTargetDebugOverlay />}
```

3. **Fix Undersized Targets:**

```tsx
// BEFORE: Icon button too small
<button className="w-8 h-8"> {/* 32×32 - TOO SMALL */}
  <Icon />
</button>

// AFTER: Increase hit area with padding
<button className="w-11 h-11 flex items-center justify-center"> {/* 44×44 */}
  <Icon className="w-6 h-6" /> {/* Icon stays 24×24 */}
</button>

// OR: Use invisible padding
<button className="p-2.5"> {/* Adds 10px padding = 44px total */}
  <Icon className="w-6 h-6" />
</button>

// OR: Use min-width/min-height
<button className="min-w-[44px] min-h-[44px]">
  <Icon />
</button>
```

**Components to Review:**
- Back buttons in headers (currently 40×40)
- Filter chips
- Icon-only action buttons
- Calendar date cells
- Checkbox/radio inputs
- Close buttons on modals

**Acceptance Criteria:**
- [ ] All interactive elements ≥ 44×44pt
- [ ] Touch target audit passes with 0 warnings
- [ ] Sufficient spacing between adjacent targets
- [ ] No accidental taps in user testing

---

## Phase 3: MEDIUM Priority Issues (NICE TO HAVE)
**Priority:** P2 - Enhancement  
**Timeline:** Weeks 5-6  
**Effort:** 80-100 hours

### Task 3.1: Replace Lucide Icons with SF Symbols
**Effort:** 20-30 hours

**Options:**

**Option A: SF Symbols Web Font (Recommended)**
```bash
# Install SF Symbols for web (if available)
npm install sf-symbols-web
```

**Option B: SF Symbol SVG Exports**
1. Download SF Symbols app from Apple
2. Export needed symbols as SVG
3. Create React components

**Option C: Keep Lucide, Match SF Symbol Style**
- Audit all icons
- Replace with Lucide equivalents that match SF Symbols
- Ensure weights/styles match

**Implementation (Option B):**

```tsx
// src/components/icons/SFSymbols.tsx
export const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    {/* SF Symbol house.fill path */}
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

// Export all needed symbols
export const CalendarIcon = () => ...;
export const TaskIcon = () => ...;
```

**Migration:**

```tsx
// BEFORE
import { Home, Calendar } from 'lucide-react';

// AFTER
import { HomeIcon, CalendarIcon } from '@/components/icons/SFSymbols';
```

**Acceptance Criteria:**
- [ ] All icons match SF Symbol visual language
- [ ] Icons scale properly with text (Dynamic Type)
- [ ] Filled/outline variants for active/inactive states
- [ ] Performance impact minimal (SVG optimization)

---

### Task 3.2: Implement iOS-Native Gesture Support
**Effort:** 30-40 hours

#### 3.2.1: Swipe-to-Delete on List Items

```bash
npm install react-swipeable
```

```tsx
// src/components/SwipeableListItem.tsx
import { useSwipeable } from 'react-swipeable';
import { Trash2 } from 'lucide-react';

export function SwipeableListItem({ onDelete, children }) {
  const [offset, setOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Left') {
        setOffset(Math.max(eventData.deltaX, -80));
      }
    },
    onSwipedLeft: () => {
      setIsRevealed(true);
      setOffset(-80);
    },
    onSwipedRight: () => {
      setIsRevealed(false);
      setOffset(0);
    },
    trackMouse: false,
  });

  return (
    <div className="relative overflow-hidden">
      {/* Delete button revealed on swipe */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center">
        <button
          onClick={onDelete}
          className="text-white p-4"
          aria-label="Delete"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* List item content */}
      <div
        {...handlers}
        className="bg-white transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

// Usage
<SwipeableListItem onDelete={() => deleteExpense(id)}>
  <ExpenseListItem expense={expense} />
</SwipeableListItem>
```

#### 3.2.2: Pull-to-Refresh

```bash
npm install react-simple-pull-to-refresh
```

```tsx
// src/components/PullToRefresh.tsx
import PullToRefresh from 'react-simple-pull-to-refresh';

export function RefreshableView({ onRefresh, children }) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      pullDownThreshold={80}
      maxPullDownDistance={120}
      resistance={2}
      refreshingContent={
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-vs-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
      pullingContent={
        <div className="flex justify-center py-2 text-vs-text-tertiary">
          ↓ Pull to refresh
        </div>
      }
    >
      {children}
    </PullToRefresh>
  );
}

// Usage in MobileExpenseManager, MobileTaskBoard, etc.
<RefreshableView onRefresh={loadExpenses}>
  {/* Content */}
</RefreshableView>
```

#### 3.2.3: Haptic Feedback

```tsx
// src/utils/haptics.ts
export const haptics = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 5, 10]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30, 10, 30]);
    }
  },
};

// Usage in components
import { haptics } from '@/utils/haptics';

function handleDelete() {
  haptics.medium();
  // ... delete logic
}

function handleSuccess() {
  haptics.success();
  toast.success('Expense approved!');
}
```

**Acceptance Criteria:**
- [ ] Swipe-to-delete on expense/task lists
- [ ] Pull-to-refresh on all data-heavy screens
- [ ] Haptic feedback on key actions (delete, approve, submit)
- [ ] Gestures feel natural and responsive
- [ ] Fallback for devices without vibration support

---

### Task 3.3: Implement iOS-Native UI Patterns
**Effort:** 30-40 hours

#### 3.3.1: Bottom Sheet Modal

```bash
npm install @radix-ui/react-dialog
# Already installed, but ensure latest version
```

```tsx
// src/components/BottomSheet.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop with blur */}
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        />
        
        {/* Sheet */}
        <Dialog.Content
          className="
            fixed bottom-0 left-0 right-0 z-50
            bg-white rounded-t-3xl
            max-h-[90vh] overflow-hidden
            animate-slide-up
          "
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          {/* Pull indicator */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4 border-b">
            <Dialog.Title className="text-xl font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Add animations to globals.css
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 300ms cubic-bezier(0.32, 0.72, 0, 1);
}
```

**Replace Dialogs With Bottom Sheets:**
- Expense approval actions
- Task creation/editing
- Filter options
- Villa switching

#### 3.3.2: Large Title Navigation

```tsx
// src/components/mobile/LargeTitleHeader.tsx
export function LargeTitleHeader({ title, scrollY = 0 }) {
  const isCollapsed = scrollY > 44;
  
  return (
    <div 
      className={`
        sticky top-0 bg-white z-20 transition-all duration-200
        ${isCollapsed ? 'shadow-sm' : ''}
      `}
    >
      <div 
        className="px-6 transition-all duration-200"
        style={{
          paddingTop: isCollapsed ? '12px' : '20px',
          paddingBottom: isCollapsed ? '12px' : '8px',
        }}
      >
        <h1 
          className="font-bold transition-all duration-200"
          style={{
            fontSize: isCollapsed ? '18px' : '34px',
            lineHeight: isCollapsed ? '22px' : '41px',
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

// Usage with scroll detection
function ExpensePage() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <LargeTitleHeader title="Expenses" scrollY={scrollY} />
      {/* Content */}
    </>
  );
}
```

**Acceptance Criteria:**
- [ ] Bottom sheets replace centered modals
- [ ] Large titles collapse on scroll
- [ ] Translucent navigation bars with blur
- [ ] Swipe-to-dismiss gestures on sheets
- [ ] Feels native to iOS users

---

## Phase 4: LOW Priority / Polish
**Priority:** P3 - Nice to Have  
**Timeline:** Weeks 7-8  
**Effort:** 40-60 hours

### Task 4.1: Liquid Glass Design Updates
- Add translucent overlays with backdrop-filter
- Implement depth layering
- Add fluid animations
- Material blur effects

### Task 4.2: iPad Optimization
- Multi-column layouts
- Split-view master-detail
- Landscape mode optimization
- Pointer hover states

### Task 4.3: Performance Optimizations
- Skeleton screens
- Lazy loading
- Image optimization
- Bundle size reduction

---

## Testing & Validation

### Automated Testing

```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react jest-axe
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

```tsx
// src/tests/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Bottom nav should have no accessibility violations', async () => {
    const { container } = render(<MobileBottomNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('All interactive elements should have labels', () => {
    const { getAllByRole } = render(<MobileBottomNav />);
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });
});
```

### Manual Testing Checklist

#### Accessibility Testing
- [ ] Screen reader navigation (VoiceOver on iOS)
- [ ] Keyboard navigation (Tab, Enter, Space, Esc)
- [ ] Dynamic Type at all sizes (XS → XXXL)
- [ ] High contrast mode
- [ ] Reduce motion preference
- [ ] Color blindness simulation

#### iOS Testing
- [ ] Safari on iPhone (multiple models)
- [ ] Safari on iPad
- [ ] Safari on iPad in landscape
- [ ] Home screen web app mode
- [ ] Split view multitasking
- [ ] Dark mode

#### Gesture Testing
- [ ] Swipe to delete
- [ ] Pull to refresh
- [ ] Pinch to zoom (where appropriate)
- [ ] Swipe back navigation
- [ ] Long press menus
- [ ] Haptic feedback

---

## Success Metrics

### Quantitative Targets
- [ ] **Accessibility Score:** 35 → 90/100 (axe DevTools)
- [ ] **Typography Score:** 45 → 95/100 (all text ≥11pt, Dynamic Type)
- [ ] **Touch Targets:** 95 → 100/100 (all ≥44×44pt)
- [ ] **Overall HIG Compliance:** 68 → 95/100

### Qualitative Targets
- [ ] Passes App Store accessibility review
- [ ] No WCAG violations (Level AA)
- [ ] Feels native to iOS users
- [ ] Positive feedback in user testing

---

## Timeline & Milestones

| Week | Phase | Deliverable | Effort |
|------|-------|-------------|--------|
| 1-2 | Phase 1 (Critical) | Accessibility + ARIA | 40-60h |
| 2-3 | Phase 1 (Critical) | Typography fixes + Dynamic Type | 30-40h |
| 3 | Phase 2 (High) | Bottom nav labels | 4-6h |
| 3-4 | Phase 2 (High) | Contrast audit + fixes | 12-16h |
| 4 | Phase 2 (High) | Touch target audit | 8-12h |
| 5 | Phase 3 (Medium) | Icon replacement | 20-30h |
| 5-6 | Phase 3 (Medium) | Gesture support | 30-40h |
| 6 | Phase 3 (Medium) | Native UI patterns | 30-40h |
| 7-8 | Phase 4 (Low) | Polish + optimization | 40-60h |

**Total: 214-304 hours over 8 weeks**

---

## Risk Mitigation

### Technical Risks

**Risk:** Dynamic Type breaks layouts  
**Mitigation:** Use clamp() with max values; extensive testing

**Risk:** SF Pro fonts not loading on web  
**Mitigation:** Robust fallback stack; system font first

**Risk:** Performance impact from accessibility features  
**Mitigation:** Lazy load ARIA announcements; optimize re-renders

### Schedule Risks

**Risk:** Accessibility fixes take longer than estimated  
**Mitigation:** Prioritize critical components; incremental rollout

**Risk:** Testing reveals major issues late  
**Mitigation:** Continuous testing during development; user testing at each phase

---

## Post-Remediation

### Re-Audit Process
1. Run automated accessibility tests
2. Manual testing with VoiceOver
3. Contrast verification with tools
4. User testing with accessibility users
5. Full HIG compliance review

### Maintenance
- Document all HIG decisions
- Add accessibility to code review checklist
- Regular contrast audits with design updates
- Annual HIG update reviews

---

## Resources

### Apple Official
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Symbols App](https://developer.apple.com/sf-symbols/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

### Accessibility
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Testing
- [VoiceOver Testing Guide](https://developer.apple.com/accessibility/voiceover/)
- [iOS Accessibility Features](https://support.apple.com/accessibility/ios)

---

**Document Version:** 1.0  
**Last Updated:** October 19, 2025  
**Next Review:** After Phase 1 completion
