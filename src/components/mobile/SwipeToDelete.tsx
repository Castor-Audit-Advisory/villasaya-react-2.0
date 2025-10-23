import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => Promise<void>;
  disabled?: boolean;
  deleteLabel?: string;
}

export function SwipeToDelete({ 
  children, 
  onDelete, 
  disabled = false,
  deleteLabel = 'Delete'
}: SwipeToDeleteProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [deleteTriggered, setDeleteTriggered] = useState(false);
  const touchStartX = useRef(0);
  const currentTranslateX = useRef(0);
  const deleteThreshold = 80; // Minimum swipe distance to trigger delete
  const maxSwipe = 100; // Maximum swipe distance for visual feedback

  useEffect(() => {
    // Reset on unmount or when disabled changes
    if (disabled) {
      setTranslateX(0);
      currentTranslateX.current = 0;
    }
  }, [disabled]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      const newTranslateX = Math.min(diff, maxSwipe);
      setTranslateX(newTranslateX);
      currentTranslateX.current = newTranslateX;

      // Trigger haptic when crossing delete threshold
      if (newTranslateX >= deleteThreshold && !deleteTriggered) {
        triggerHaptic('warning');
        setDeleteTriggered(true);
      } else if (newTranslateX < deleteThreshold && deleteTriggered) {
        setDeleteTriggered(false);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled) return;
    
    setIsSwiping(false);

    // If swiped past threshold, trigger delete
    if (currentTranslateX.current >= deleteThreshold) {
      triggerHaptic('error');
      // Animate to full swipe
      setTranslateX(maxSwipe);
      
      try {
        // Wait for animation, then call delete
        await new Promise(resolve => setTimeout(resolve, 200));
        await onDelete();
        // Delete succeeded - component will unmount
      } catch (error) {
        // Delete failed - snap back to normal
        console.error('Delete failed:', error);
        setTranslateX(0);
        currentTranslateX.current = 0;
        setDeleteTriggered(false);
      }
    } else {
      // Snap back
      setTranslateX(0);
      currentTranslateX.current = 0;
      setDeleteTriggered(false);
    }
  };

  const handleDeleteClick = async () => {
    if (disabled) return;
    triggerHaptic('error');
    
    try {
      await onDelete();
      // Delete succeeded - component will unmount
    } catch (error) {
      // Delete failed - reset state
      console.error('Delete failed:', error);
      setTranslateX(0);
      currentTranslateX.current = 0;
      setDeleteTriggered(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete Button Background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-gradient-to-l from-red-500 to-red-600 pr-6"
        style={{
          width: `${Math.max(translateX, 0)}px`,
          transition: isSwiping ? 'none' : 'width 0.3s ease-out',
        }}
      >
        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-2 text-white font-medium text-[15px] whitespace-nowrap"
          style={{
            opacity: translateX >= deleteThreshold ? 1 : 0.5,
            transform: `scale(${translateX >= deleteThreshold ? 1 : 0.9})`,
            transition: 'opacity 0.2s, transform 0.2s',
          }}
        >
          <Trash2 className="w-5 h-5" />
          {translateX >= deleteThreshold && <span>{deleteLabel}</span>}
        </button>
      </div>

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        className="bg-white relative"
      >
        {children}
      </div>
    </div>
  );
}
