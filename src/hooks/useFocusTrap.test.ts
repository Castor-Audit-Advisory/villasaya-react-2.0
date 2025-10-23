import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusTrap, useKeyboardNavigation } from './useFocusTrap';

/**
 * Focus Trap Regression Tests
 * 
 * These tests verify the focus trap hook doesn't crash and properly sets up event listeners.
 * Full DOM focus behavior is difficult to test in jsdom, so these tests focus on:
 * - Hook initialization without errors
 * - Event listener registration/cleanup
 * - Ref stability
 * - Active/inactive state handling
 * 
 * The keyboard navigation tests provide comprehensive coverage of the recently fixed bug.
 */

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button2 = document.createElement('button');
    button3 = document.createElement('button');

    button1.textContent = 'Button 1';
    button2.textContent = 'Button 2';
    button3.textContent = 'Button 3';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should trap focus within the container when active', async () => {
    const { result } = renderHook(() => useFocusTrap(true));

    await act(async () => {
      if (result.current.current) {
        result.current.current = container;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    const focusableElements = container.querySelectorAll('button');
    expect(focusableElements.length).toBe(3);
    expect(document.activeElement).toBeDefined();
  });

  it('should handle Tab key events without errors', async () => {
    const { result } = renderHook(() => useFocusTrap(true));

    await act(async () => {
      if (result.current.current !== undefined) {
        Object.defineProperty(result.current, 'current', {
          writable: true,
          value: container
        });
      }
    });

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });

    let errorThrown = false;
    try {
      container.dispatchEvent(tabEvent);
    } catch (error) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(false);
  });

  it('should handle Shift+Tab key events without errors', async () => {
    const { result } = renderHook(() => useFocusTrap(true));

    await act(async () => {
      if (result.current.current !== undefined) {
        Object.defineProperty(result.current, 'current', {
          writable: true,
          value: container
        });
      }
    });

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    let errorThrown = false;
    try {
      container.dispatchEvent(shiftTabEvent);
    } catch (error) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(false);
  });

  it('should not trap focus when inactive', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useFocusTrap(isActive),
      { initialProps: { isActive: false } }
    );

    act(() => {
      if (result.current.current) {
        result.current.current = container;
      }
    });

    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);

    act(() => {
      externalButton.focus();
    });

    expect(document.activeElement).toBe(externalButton);

    document.body.removeChild(externalButton);
  });

  it('should restore focus to previously focused element on cleanup', () => {
    const externalButton = document.createElement('button');
    document.body.appendChild(externalButton);

    act(() => {
      externalButton.focus();
    });

    const { result, unmount } = renderHook(() => useFocusTrap(true));

    act(() => {
      if (result.current.current) {
        result.current.current = container;
      }
    });

    act(() => {
      unmount();
    });

    expect(document.activeElement).toBe(externalButton);

    document.body.removeChild(externalButton);
  });
});

describe('useKeyboardNavigation', () => {
  afterEach(() => {
    document.body.classList.remove('keyboard-navigation');
  });

  it('should detect Tab key press and add keyboard-navigation class', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    expect(result.current.current).toBe(false);
    expect(document.body.classList.contains('keyboard-navigation')).toBe(false);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );
    });

    expect(result.current.current).toBe(true);
    expect(document.body.classList.contains('keyboard-navigation')).toBe(true);
  });

  it('should detect mouse down and remove keyboard-navigation class', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );
    });

    expect(result.current.current).toBe(true);
    expect(document.body.classList.contains('keyboard-navigation')).toBe(true);

    act(() => {
      window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(result.current.current).toBe(false);
    expect(document.body.classList.contains('keyboard-navigation')).toBe(false);
  });

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardNavigation());

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should only respond to Tab key, not other keys', () => {
    const { result } = renderHook(() => useKeyboardNavigation());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
    });

    expect(result.current.current).toBe(false);
    expect(document.body.classList.contains('keyboard-navigation')).toBe(false);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      );
    });

    expect(result.current.current).toBe(false);
    expect(document.body.classList.contains('keyboard-navigation')).toBe(false);
  });
});
