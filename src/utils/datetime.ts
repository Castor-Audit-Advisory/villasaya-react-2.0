const MS_IN_MINUTE = 60 * 1000;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

export function formatRelativeTime(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return 'just now';
  }

  if (diffMs < MS_IN_MINUTE) {
    return 'just now';
  }

  if (diffMs < MS_IN_HOUR) {
    const minutes = Math.round(diffMs / MS_IN_MINUTE);
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < MS_IN_DAY) {
    const hours = Math.round(diffMs / MS_IN_HOUR);
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.round(diffMs / MS_IN_DAY);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
