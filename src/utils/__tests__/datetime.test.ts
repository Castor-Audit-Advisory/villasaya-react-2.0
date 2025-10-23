import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { formatRelativeTime } from '../datetime';

describe('formatRelativeTime', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const freezeTime = (isoString: string) => {
    const fixedDate = new Date(isoString);
    vi.setSystemTime(fixedDate);
  };

  it('returns empty string for invalid date', () => {
    expect(formatRelativeTime('invalid')).toBe('');
  });

  it('returns "just now" for future dates', () => {
    freezeTime('2024-01-01T12:00:00.000Z');
    expect(formatRelativeTime('2024-01-01T12:05:00.000Z')).toBe('just now');
  });

  it('returns minutes for recent timestamps', () => {
    freezeTime('2024-01-01T12:10:00.000Z');
    expect(formatRelativeTime('2024-01-01T12:05:00.000Z')).toBe('5 mins ago');
  });

  it('returns hours when appropriate', () => {
    freezeTime('2024-01-01T15:00:00.000Z');
    expect(formatRelativeTime('2024-01-01T12:00:00.000Z')).toBe('3 hrs ago');
  });

  it('returns days when appropriate', () => {
    freezeTime('2024-01-05T12:00:00.000Z');
    expect(formatRelativeTime('2024-01-01T12:00:00.000Z')).toBe('4 days ago');
  });
});
