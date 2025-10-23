/**
 * Color Contrast Audit Tool
 * Apple HIG Compliance: WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18pt+)
 */

interface ColorTest {
  name: string;
  fg: string;
  bg: string;
  required: number;
  isLargeText?: boolean;
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(hex: string): number {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
function calculateContrast(fg: string, bg: string): number {
  const L1 = getLuminance(fg);
  const L2 = getLuminance(bg);
  
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * All critical color combinations to test
 * Updated with WCAG-compliant color values (October 2025)
 */
const colorTests: ColorTest[] = [
  // Primary brand colors
  {
    name: 'Primary button text (white on primary)',
    fg: '#FFFFFF',
    bg: '#6B4FDB', // Updated from #7B5FEB
    required: 4.5,
  },
  {
    name: 'Primary button text (white on primary-dark)',
    fg: '#FFFFFF',
    bg: '#5B3FCB', // Updated from #6B4FDB
    required: 4.5,
  },
  
  // Text on backgrounds
  {
    name: 'Primary text on primary background',
    fg: '#1F1F1F',
    bg: '#F8F8F8',
    required: 4.5,
  },
  {
    name: 'Primary text on white',
    fg: '#1F1F1F',
    bg: '#FFFFFF',
    required: 4.5,
  },
  {
    name: 'Secondary text on primary background',
    fg: '#5E5873',
    bg: '#F8F8F8',
    required: 4.5,
  },
  {
    name: 'Secondary text on white',
    fg: '#5E5873',
    bg: '#FFFFFF',
    required: 4.5,
  },
  {
    name: 'Tertiary text on primary background',
    fg: '#6E6B7B',
    bg: '#F8F8F8',
    required: 4.5,
  },
  {
    name: 'Tertiary text on white',
    fg: '#6E6B7B',
    bg: '#FFFFFF',
    required: 4.5,
  },
  {
    name: 'Muted text on primary background',
    fg: '#6E6E78', // Updated from #B9B9C3
    bg: '#F8F8F8',
    required: 4.5,
  },
  {
    name: 'Muted text on white',
    fg: '#6E6E78', // Updated from #B9B9C3
    bg: '#FFFFFF',
    required: 4.5,
  },
  {
    name: 'Disabled text on white',
    fg: '#949499', // Updated from #D4D4D8
    bg: '#FFFFFF',
    required: 3.0,
  },
  
  // Semantic colors
  {
    name: 'Success text (white on success)',
    fg: '#FFFFFF',
    bg: '#1FA85F', // Updated from #28C76F
    required: 3.0,
    isLargeText: true,
  },
  {
    name: 'Warning text (white on warning)',
    fg: '#FFFFFF',
    bg: '#C77A15', // Updated from #FF9F43
    required: 3.0,
    isLargeText: true,
  },
  {
    name: 'Error text (white on error)',
    fg: '#FFFFFF',
    bg: '#EA5455',
    required: 3.0,
    isLargeText: true,
  },
  {
    name: 'Info text (white on info)',
    fg: '#FFFFFF',
    bg: '#0099AD', // Updated from #00CFE8
    required: 3.0,
    isLargeText: true,
  },
  
  // Status indicators
  {
    name: 'Error text on white',
    fg: '#EA5455',
    bg: '#FFFFFF',
    required: 3.0,
  },
  {
    name: 'Success text on white',
    fg: '#1FA85F', // Updated from #28C76F
    bg: '#FFFFFF',
    required: 3.0,
  },
  {
    name: 'Warning text on white',
    fg: '#C77A15', // Updated from #FF9F43
    bg: '#FFFFFF',
    required: 3.0,
  },
  
  // Dark mode
  {
    name: 'Dark mode: Primary text on dark background',
    fg: '#FFFFFF',
    bg: '#1A1A1A',
    required: 4.5,
  },
  {
    name: 'Dark mode: Secondary text on dark background',
    fg: '#E0E0E0',
    bg: '#1A1A1A',
    required: 4.5,
  },
  {
    name: 'Dark mode: Tertiary text on dark background',
    fg: '#B0B0B0',
    bg: '#1A1A1A',
    required: 4.5,
  },
];

/**
 * Run the contrast audit
 */
export function runContrastAudit(): {
  passed: number;
  failed: number;
  total: number;
  results: Array<{ test: ColorTest; ratio: number; pass: boolean }>;
} {
  const results = colorTests.map(test => {
    const ratio = calculateContrast(test.fg, test.bg);
    const pass = ratio >= test.required;
    
    return {
      test,
      ratio: Math.round(ratio * 100) / 100,
      pass,
    };
  });
  
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  
  return {
    passed,
    failed,
    total: results.length,
    results,
  };
}

/**
 * Print audit results to console
 */
export function printContrastAudit() {
  const audit = runContrastAudit();
  
  console.log('\n' + '='.repeat(80));
  console.log('COLOR CONTRAST AUDIT - Apple HIG / WCAG AA Compliance');
  console.log('='.repeat(80) + '\n');
  
  console.log(`Total Tests: ${audit.total}`);
  console.log(`✅ Passed: ${audit.passed}`);
  console.log(`❌ Failed: ${audit.failed}`);
  console.log(`Pass Rate: ${Math.round((audit.passed / audit.total) * 100)}%\n`);
  
  console.log('Detailed Results:\n');
  
  audit.results.forEach(({ test, ratio, pass }) => {
    const status = pass ? '✅ PASS' : '❌ FAIL';
    const marker = pass ? '' : ' ⚠️';
    console.log(`${status}${marker} ${test.name}`);
    console.log(`    ${ratio}:1 (required: ${test.required}:1)`);
    console.log(`    Foreground: ${test.fg} | Background: ${test.bg}\n`);
  });
  
  if (audit.failed > 0) {
    console.log('\n' + '⚠️'.repeat(20));
    console.log('FAILED COMBINATIONS REQUIRE FIXES:');
    console.log('⚠️'.repeat(20) + '\n');
    
    audit.results
      .filter(r => !r.pass)
      .forEach(({ test, ratio }) => {
        const gap = test.required - ratio;
        console.log(`❌ ${test.name}`);
        console.log(`   Current: ${ratio}:1, Required: ${test.required}:1`);
        console.log(`   Gap: ${gap.toFixed(2)}:1\n`);
      });
  }
  
  console.log('='.repeat(80) + '\n');
}

// Export for use in React components (development only)
export { calculateContrast };
export type { ColorTest };
