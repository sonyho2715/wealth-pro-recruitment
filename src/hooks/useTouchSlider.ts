import { useRef, useCallback, useEffect } from 'react';

interface TouchSliderOptions {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

/**
 * Custom hook for touch-friendly slider controls
 * Provides smooth touch interaction for range inputs on mobile devices
 */
export function useTouchSlider({
  min,
  max,
  step,
  value,
  onChange,
}: TouchSliderOptions) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;

      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step, value]
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      isDragging.current = true;
      const newValue = calculateValue(e.touches[0].clientX);
      onChange(newValue);
    },
    [calculateValue, onChange]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault(); // Prevent scrolling while dragging
      const newValue = calculateValue(e.touches[0].clientX);
      onChange(newValue);
    },
    [calculateValue, onChange]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    sliderRef,
    sliderProps: {
      ref: sliderRef,
      type: 'range' as const,
      min,
      max,
      step,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
      className: 'w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider touch-pan-x',
      style: {
        // Larger touch target for mobile
        touchAction: 'pan-x',
      },
    },
  };
}

/**
 * CSS for better mobile slider experience
 * Add this to your global CSS or component styles
 */
export const sliderStyles = `
/* Mobile-optimized slider styles */
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  border-radius: 8px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
  transition: transform 0.15s ease;
}

.slider::-webkit-slider-thumb:hover,
.slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
}

/* Increase touch target on mobile */
@media (max-width: 768px) {
  .slider::-webkit-slider-thumb {
    width: 36px;
    height: 36px;
  }

  .slider::-moz-range-thumb {
    width: 36px;
    height: 36px;
  }

  .slider {
    height: 16px;
  }
}
`;
