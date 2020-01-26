import React from 'react';

// Whether the current platform supports the V8 Break Iterator. The V8 check
// is necessary to detect all Blink based browsers.
let hasV8BreakIterator = false;

// We need a try/catch around the reference to `Intl`, because accessing it in some cases can
// cause IE to throw. These cases are tied to particular versions of Windows and can happen if
// the consumer is providing a polyfilled `Map`. See:
// https://github.com/Microsoft/ChakraCore/issues/3189
// https://github.com/angular/material2/issues/15687
try {
  hasV8BreakIterator = (typeof Intl !== 'undefined' && Intl.v8BreakIterator);
} catch {
  hasV8BreakIterator = false;
}

export function isBrowser() {
  return typeof document === 'object' && !!document;
}

/** Whether the current browser is Microsoft Edge. */
function isEdge() {
  return isBrowser() && /(edge)/i.test(navigator.userAgent);
}

/** Whether the current rendering engine is Microsoft Trident. */
function isTrident() {
  return isBrowser() && /(msie|trident)/i.test(navigator.userAgent);
}

/** Whether the current rendering engine is Blink. */
// EdgeHTML and Trident mock Blink specific things and need to be excluded from this check.
function isBlink() {
  return isBrowser() && (
    !!(window.chrome || hasV8BreakIterator)
    && typeof CSS !== 'undefined'
    && !isEdge()
    && !isTrident()
  );
}

/** Whether the current rendering engine is WebKit. */
// Webkit is part of the userAgent in EdgeHTML, Blink and Trident. Therefore we need to
// ensure that Webkit runs standalone and is not used as another engine's base.
function isWebkit() {
  return isBrowser() &&
    /AppleWebKit/i.test(navigator.userAgent) && !isBlink() && !isEdge() && !isTrident();
}

/** Whether the current platform is Apple iOS. */
function isIOS() {
  return isBrowser() && /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !('MSStream' in window);
}


function is(platform) {
  switch (platform.toString().toLowerCase()) {
    case 'browser':
      return isBrowser();
    case 'edge':
      return isEdge();
    case 'trident':
      return isTrident();
    case 'blink':
      return isBlink();
    case 'ios':
      return isIOS();
    case 'webkit':
      return isWebkit();
    /** Whether the current browser is Firefox. */
    // It's difficult to detect the plain Gecko engine, because most of the browsers identify
    // them self as Gecko-like browsers and modify the userAgent's according to that.
    // Since we only cover one explicit Firefox case, we can simply check for Firefox
    // instead of having an unstable check for Gecko.
    case 'firefox':
      return isBrowser() && /(firefox|minefield)/i.test(navigator.userAgent);
    /** Whether the current platform is Android. */
    // Trident on mobile adds the android platform to the userAgent to trick detections.
    case 'android':
      return isBrowser() && /android/i.test(navigator.userAgent) && !isTrident();
    /** Whether the current browser is Safari. */
    // Safari browsers will include the Safari keyword in their userAgent. Some browsers may fake
    // this and just place the Safari keyword in the userAgent. To be more safe about Safari every
    // Safari browser should also use Webkit as its layout engine.
    case 'safari':
      return isBrowser() && /safari/i.test(navigator.userAgent) && isWebkit();
    default: return false;
  }
}

export const PlatformContext = React.createContext(() => false);

export function Platform({ children }) {
  return <PlatformContext.Provider value={is}>{ children }</PlatformContext.Provider>;
}

/**
 * @return {function(): boolean}
 */
export function usePlatform() {
  return React.useContext(PlatformContext);
}
