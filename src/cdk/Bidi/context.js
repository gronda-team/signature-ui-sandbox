import * as React from 'react';
import { usePlatform } from '../Platform';

/**
 * @type {React.Context<null | 'ltr' | 'rtl'>}
 */
export const DirectionalityContext = React.createContext(null);

export function useDir() {
  const is = usePlatform();
  const dir = React.useContext(DirectionalityContext);

  // If there is no parent directionality context, then use the one from the HTML/body tags
  if (dir == null && is('browser')) {
    const bodyDir = document.body ? document.body.dir : null;
    const htmlDir = document.documentElement ? document.documentElement.dir : null;
    const value = bodyDir || htmlDir;
    return (value === 'ltr' || value === 'rtl') ? value : 'ltr';
  }

  return dir;
}
