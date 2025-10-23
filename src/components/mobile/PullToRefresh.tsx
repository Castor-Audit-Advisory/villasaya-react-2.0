/**
 * Pull-to-Refresh Component
 * Apple HIG Compliance: Standard iOS pull-to-refresh interaction
 * 
 * Usage:
 * <PullToRefresh onRefresh={async () => await loadData()}>
 *   <YourContent />
 * </PullToRefresh>
 */

import { ReactNode } from 'react';
import PullToRefreshLib from 'react-simple-pull-to-refresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  return (
    <PullToRefreshLib
      onRefresh={onRefresh}
      pullDownThreshold={80}
      maxPullDownDistance={120}
      resistance={2}
      refreshingContent={
        <div className="flex justify-center py-4" role="status" aria-live="polite">
          <div 
            className="w-8 h-8 border-4 border-vs-primary border-t-transparent rounded-full animate-spin"
            aria-label="Refreshing content"
          />
        </div>
      }
      pullingContent={
        <div className="flex justify-center py-2 text-vs-text-tertiary text-sm">
          <span aria-hidden="true">↓</span> Pull to refresh
        </div>
      }
      className={className}
    >
      {children}
    </PullToRefreshLib>
  );
}
