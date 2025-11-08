// Material UI Skeleton wrapper
import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps, Box } from '@mui/material';

export type SkeletonProps = MuiSkeletonProps;

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ ...props }, ref) => {
    return <MuiSkeleton ref={ref} animation="wave" {...props} />;
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton variants for specific mobile components
 * Following Apple HIG for loading states
 */

export function SkeletonTaskCard() {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '24px', p: 2, mb: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton height={15} width="75%" sx={{ mb: 0.5 }} />
          <Skeleton height={13} width="100%" sx={{ mb: 0.5 }} />
          <Skeleton height={13} width="85%" />
        </Box>
        <Skeleton variant="circular" width={8} height={8} sx={{ ml: 1.5, mt: 0.75, flexShrink: 0 }} />
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton height={12} width={64} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Skeleton width={14} height={14} />
            <Skeleton height={12} width={48} />
          </Box>
        </Box>
        <Skeleton height={22} width={64} sx={{ borderRadius: '9999px' }} />
      </Box>
    </Box>
  );
}

export function SkeletonExpenseCard() {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '24px', p: 2, mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton height={20} width="75%" sx={{ mb: 1 }} />
          <Skeleton height={16} width="50%" />
        </Box>
        <Skeleton height={24} width={80} sx={{ borderRadius: '9999px' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <Skeleton width={20} height={20} sx={{ borderRadius: '8px' }} />
        <Skeleton height={12} width={128} />
      </Box>
    </Box>
  );
}

export function SkeletonStatCard() {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '24px', p: 3 }}>
      <Skeleton height={16} width={96} sx={{ mb: 1.5 }} />
      <Skeleton height={32} width={64} sx={{ mb: 1.5 }} />
      <Skeleton height={12} width={128} />
    </Box>
  );
}

export function SkeletonActivityItem() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5, mb: 2 }}>
      <Skeleton width={40} height={40} sx={{ borderRadius: '8px', flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton height={16} width="75%" sx={{ mb: 1 }} />
        <Skeleton height={12} width="50%" />
      </Box>
    </Box>
  );
}

export function SkeletonList({ count = 3, children }: { count?: number; children: React.ReactNode }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </>
  );
}
