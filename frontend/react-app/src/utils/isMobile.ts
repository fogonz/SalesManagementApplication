// utils/isMobile.ts
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 900 || /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
