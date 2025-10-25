import { useEffect } from 'react';

export function useStaticStyles(styleId: string, styles: string) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (styleElement) {
      if (styleElement.innerHTML !== styles) {
        styleElement.innerHTML = styles;
      }
      return;
    }

    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [styleId, styles]);
}
