import React, { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  snapPoints?: number[];
  dismissible?: boolean;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  showCloseButton = true,
  snapPoints,
  dismissible = true,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissible={dismissible}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-[20px] max-h-[96vh] focus:outline-none">
          {/* Drag Handle */}
          <div className="flex items-center justify-center py-3">
            <div className="w-12 h-[5px] bg-[#E8E8E8] rounded-full" />
          </div>

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="px-6 pb-4 border-b border-[#E8E8E8]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {title && (
                    <Drawer.Title className="text-[#1F1F1F] text-[20px] font-semibold">
                      {title}
                    </Drawer.Title>
                  )}
                  {description && (
                    <Drawer.Description className="text-[#B9B9C3] text-[14px] mt-1">
                      {description}
                    </Drawer.Description>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8F8F8] active:bg-[#E8E8E8] transition-colors ml-4"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-[#5E5873]" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Safe area padding */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Trigger component for convenience
export function BottomSheetTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  return (
    <Drawer.Trigger asChild={asChild}>
      {children}
    </Drawer.Trigger>
  );
}

// Action buttons container
export function BottomSheetActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
