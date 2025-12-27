import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (typeof window.localStorage.getItem === 'function') {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        return null; // SecurityError or similar
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (typeof window.localStorage.setItem === 'function') {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        // ignore
      }
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (typeof window.localStorage.removeItem === 'function') {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        // ignore
      }
    }
  }
};
