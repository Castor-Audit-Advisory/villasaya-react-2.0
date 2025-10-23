/**
 * Touch Target Audit Tool
 * Apple HIG Compliance: All interactive elements must be at least 44×44pt
 * 
 * Usage: Add <TouchTargetDebugOverlay /> to App.tsx in development mode
 */

import { useEffect, useState } from 'react';

interface TouchTargetIssue {
  element: string;
  width: number;
  height: number;
  selector: string;
  location: string;
}

/**
 * Minimum touch target size per Apple HIG
 */
const MIN_TOUCH_TARGET = 44; // 44pt = 44px at 1x

/**
 * Development overlay that highlights undersized touch targets
 */
export function TouchTargetDebugOverlay() {
  const [issues, setIssues] = useState<TouchTargetIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const findTouchTargetIssues = () => {
      // All potentially interactive elements
      const selectors = [
        'button',
        'a',
        '[role="button"]',
        '[role="link"]',
        '[role="tab"]',
        '[role="checkbox"]',
        '[role="radio"]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        '[onClick]',
        '[onTouchStart]',
      ];

      const foundIssues: TouchTargetIssue[] = [];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el as Element);
          
          // Skip hidden elements
          if (computedStyle.display === 'none' || 
              computedStyle.visibility === 'hidden' ||
              rect.width === 0 || 
              rect.height === 0) {
            return;
          }
          
          // Check if touch target is too small
          if (rect.width < MIN_TOUCH_TARGET || rect.height < MIN_TOUCH_TARGET) {
            // Try to identify element location
            const parent = el.closest('[class*="Mobile"], [class*="mobile"], nav, header, footer');
            const location = parent?.className || 'unknown';
            
            foundIssues.push({
              element: el.tagName.toLowerCase(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              selector: selector,
              location: location.toString().substring(0, 50),
            });
            
            // Add visual indicator
            (el as HTMLElement).style.outline = '2px solid red';
            (el as HTMLElement).style.outlineOffset = '2px';
            (el as HTMLElement).setAttribute('data-touch-target-warning', 'true');
          }
        });
      });
      
      setIssues(foundIssues);
    };

    // Run audit on mount and when DOM changes
    findTouchTargetIssues();
    
    // Re-run when window resizes
    window.addEventListener('resize', findTouchTargetIssues);
    
    // MutationObserver for dynamic content
    const observer = new MutationObserver(findTouchTargetIssues);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('resize', findTouchTargetIssues);
      observer.disconnect();
      
      // Remove visual indicators
      document.querySelectorAll('[data-touch-target-warning]').forEach(el => {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        el.removeAttribute('data-touch-target-warning');
      });
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-24 right-4 z-[100] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET }}
      >
        Touch Targets: {issues.length}
      </button>

      {/* Issues panel */}
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 bg-red-50 border-b-4 border-red-500 p-4 z-[99] max-h-[50vh] overflow-auto">
          <h3 className="font-bold text-red-900 text-lg mb-2">
            Touch Target Issues ({issues.length})
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Apple HIG requires all interactive elements to be at least 44×44pt
          </p>
          
          {issues.length === 0 ? (
            <p className="text-green-700 font-medium">
              ✅ All touch targets meet the 44×44pt minimum!
            </p>
          ) : (
            <div className="space-y-2">
              {issues.slice(0, 20).map((issue, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded border border-red-200 text-sm"
                >
                  <div className="font-medium text-red-900">
                    &lt;{issue.element}&gt; - {issue.width}×{issue.height}px
                  </div>
                  <div className="text-red-600 text-sm mt-1">
                    Selector: {issue.selector}
                  </div>
                  <div className="text-red-600 text-sm">
                    Location: {issue.location}
                  </div>
                  <div className="text-red-800 text-sm mt-1">
                    Gap: {MIN_TOUCH_TARGET - Math.min(issue.width, issue.height)}px
                  </div>
                </div>
              ))}
              {issues.length > 20 && (
                <p className="text-red-600 text-sm italic">
                  ...and {issues.length - 20} more issues
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={() => setIsVisible(false)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded font-medium text-sm"
            style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Console logging version for CI/testing
 */
export function logTouchTargetAudit() {
  const selectors = [
    'button',
    'a',
    '[role="button"]',
    '[onClick]',
  ];

  const issues: TouchTargetIssue[] = [];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      if (rect.width > 0 && rect.height > 0 &&
          (rect.width < MIN_TOUCH_TARGET || rect.height < MIN_TOUCH_TARGET)) {
        issues.push({
          element: el.tagName.toLowerCase(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          selector: selector,
          location: el.className?.toString().substring(0, 50) || 'unknown',
        });
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('TOUCH TARGET AUDIT - Apple HIG Compliance');
  console.log('='.repeat(80) + '\n');
  console.log(`Minimum Size: ${MIN_TOUCH_TARGET}×${MIN_TOUCH_TARGET}pt`);
  console.log(`Issues Found: ${issues.length}\n`);
  
  if (issues.length === 0) {
    console.log('✅ All touch targets meet the 44×44pt minimum!');
  } else {
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. <${issue.element}> - ${issue.width}×${issue.height}px`);
      console.log(`   Selector: ${issue.selector}`);
      console.log(`   Location: ${issue.location}`);
      console.log(`   Gap: ${MIN_TOUCH_TARGET - Math.min(issue.width, issue.height)}px\n`);
    });
  }
  
  console.log('='.repeat(80) + '\n');
  
  return issues;
}
