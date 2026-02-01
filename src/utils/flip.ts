/**
 * FLIP animation utilities
 * FLIP = First, Last, Invert, Play
 */

export interface DOMRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Animate an element from one position/size to another using FLIP
 */
export async function flipAnimate(
  element: HTMLElement,
  startRect: DOMRect,
  endRect: DOMRect,
  options: {
    duration?: number;
    easing?: string;
    rotate?: number;
  } = {}
): Promise<void> {
  const {
    duration = 500,
    easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // ease-out
    rotate = 0
  } = options;

  // Calculate translate and scale
  const translateX = startRect.left - endRect.left + (startRect.width - endRect.width) / 2;
  const translateY = startRect.top - endRect.top + (startRect.height - endRect.height) / 2;
  const scaleX = startRect.width / endRect.width;
  const scaleY = startRect.height / endRect.height;

  // Set initial state
  element.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`;
  element.style.transition = 'none';
  
  // Force reflow
  element.offsetHeight;

  // Animate to final state
  element.style.transition = `transform ${duration}ms ${easing}`;
  element.style.transform = 'translate(0, 0) scale(1, 1) rotate(0deg)';

  // Wait for animation to complete
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Settle animation: quick bounce
 */
export async function settleAnimate(
  element: HTMLElement,
  duration: number = 120
): Promise<void> {
  element.style.transition = `transform ${duration}ms ease-out`;
  element.style.transform = 'scale(0.98)';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 0);

  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Fade out element
 */
export async function fadeOut(
  element: HTMLElement,
  options: {
    duration?: number;
    blur?: boolean;
  } = {}
): Promise<void> {
  const { duration = 500, blur = false } = options;

  element.style.transition = `opacity ${duration}ms ease-out${blur ? ', backdrop-filter ' + duration + 'ms ease-out' : ''}`;
  
  if (blur) {
    element.style.backdropFilter = 'blur(2px)';
  }
  
  element.style.opacity = '0';
  element.style.pointerEvents = 'none';

  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
