import * as React from 'react';
import {PlatformDefaultProps, PlatformPropTypes, withPlatformConsumer} from '../../platform';
import { InteractivityCheckerProvider } from './context/InteractivityCheckerContext';

/**
 * Root-level provider to check the interactivity of an
 * element, such as if it's focusable or tabbable.
 */
class InteractivityChecker extends React.Component {
  constructor() {
    super();

    /** Provider value for any component that accepts this consumer */
    this.state = {
      isDisabled: this.isDisabled,
      isVisible: this.isVisible,
      isTabbable: this.isTabbable,
      isFocusable: this.isFocusable,
    };
  }

  /**
   * Derived data
   */
  /**
   * Checks if the element is disabled.
   * @param element Element to be checked
   */
  isDisabled = element => (
    // This does not capture some cases, such as a non-form control with a disabled attribute or
    // a form control inside of a disabled form, but should capture the most common cases.
    element.hasAttribute('disabled')
  );

  /**
   * Gets whether an element is visible for the purposes of interactivity.
   *
   * This will capture states like `display: none` and `visibility: hidden`, but not things like
   * being clipped by an `overflow: hidden` parent or being outside the viewport.
   *
   * @returns Whether the element is visible.
   */
  isVisible = (element) => (
    hasGeometry(element) && window.getComputedStyle(element).visibility === 'visible'
  );

  /**
   * Gets whether an element can be reached via Tab key.
   * Assumes that the element has already been checked with isFocusable.
   *
   * @param element Element to be checked.
   * @returns Whether the element is tabbable.
   */
  isTabbable = (element) => {
    // Nothing is tabbable on the the server 😎
    if (!this.props.__platform.is('browser')) {
      return false;
    }

    const IS_WEBKIT = this.props.__platform.is('webkit');
    const IS_BLINK = this.props.__platform.is('blink');

    const frameElement = getFrameElement(getWindow(element));

    if (frameElement) {
      const frameType = frameElement && frameElement.nodeName.toLowerCase();

      // Frame elements inherit their tabindex onto all child elements.
      if (getTabIndexValue(frameElement) === -1) {
        return false;
      }

      // Webkit and Blink consider anything inside of an <object> element as non-tabbable.
      if ((IS_BLINK || IS_WEBKIT) && frameType === 'object') {
        return false;
      }

      // Webkit and Blink disable tabbing to an element inside of an invisible frame.
      if ((IS_BLINK || IS_WEBKIT) && !this.isVisible(frameElement)) {
        return false;
      }

    }

    let nodeName = element.nodeName.toLowerCase();
    let tabIndexValue = getTabIndexValue(element);

    if (element.hasAttribute('contenteditable')) {
      return tabIndexValue !== -1;
    }

    if (nodeName === 'iframe') {
      // The frames may be tabbable depending on content, but it's not possibly to reliably
      // investigate the content of the frames.
      return false;
    }

    if (nodeName === 'audio') {
      if (!element.hasAttribute('controls')) {
        // By default an <audio> element without the controls enabled is not tabbable.
        return false;
      } else if (IS_BLINK) {
        // In Blink <audio controls> elements are always tabbable.
        return true;
      }
    }

    if (nodeName === 'video') {
      if (!element.hasAttribute('controls') && this.props.__platform.is('trident')) {
        // In Trident a <video> element without the controls enabled is not tabbable.
        return false;
      } else if (IS_BLINK || this.props.__platform.is('firefox')) {
        // In Chrome and Firefox <video controls> elements are always tabbable.
        return true;
      }
    }

    if (nodeName === 'object' && (IS_BLINK || IS_WEBKIT)) {
      // In all Blink and WebKit based browsers <object> elements are never tabbable.
      return false;
    }

    // In iOS the browser only considers some specific elements as tabbable.
    if (IS_WEBKIT && this.props.__platform.is('ios') && !isPotentiallyTabbableIOS(element)) {
      return false;
    }

    return element.tabIndex >= 0;
  };

  /**
   * Gets whether an element can be focused by the user.
   *
   * @param element Element to be checked.
   * @returns Whether the element is focusable.
   */
  isFocusable = element => (
    // Perform checks in order of left to most expensive.
    // Again, naive approach that does not capture many edge cases and browser quirks.
    isPotentiallyFocusable(element) && !this.isDisabled(element) && this.isVisible(element)
  );

  /**
   * Renderers
   */
  render() {
    return (
      <InteractivityCheckerProvider value={this.state}>
        { this.props.children }
      </InteractivityCheckerProvider>
    )
  }
}

InteractivityChecker.propTypes = {
  __platform: PlatformPropTypes,
};

InteractivityChecker.defaultProps = {
  __platform: PlatformDefaultProps,
};

const StackedInteractivityChecker = withPlatformConsumer(InteractivityChecker);

export default StackedInteractivityChecker;

/**
 * Private methods
 */
/**
 * Returns the frame element from a window object. Since browsers like MS Edge throw errors if
 * the frameElement property is being accessed from a different host address, this property
 * should be accessed carefully.
 */
function getFrameElement(window) {
  try {
    return window.frameElement;
  } catch(error) {
    return null;
  }
}

/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element) {
  // Use logic from jQuery to check for an invisible element.
  // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
  return !!(element.offsetWidth || element.offsetHeight ||
    (typeof element.getClientRects === 'function' && element.getClientRects().length));
}

/** Gets whether an element is a native form element  */
function isNativeFormElement(element) {
  let nodeName = element.nodeName.toLowerCase();
  return nodeName === 'input' ||
    nodeName === 'select' ||
    nodeName === 'button' ||
    nodeName === 'textarea';
}

/** Gets whether an element is an `<input type="hidden">`. */
function isHiddenInput(element) {
  return isInputElement(element) && element.type === 'hidden';
}

/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element) {
  return isAnchorElement(element) && element.hasAttribute('href');
}

/** Gets whether an element is an input element. */
function isInputElement(element) {
  return element.nodeName.toLowerCase() === 'input';
}

/** Gets whether an element is an anchor element. */
function isAnchorElement(element) {
  return element.nodeName.toLowerCase() === 'a';
}

/** Gets whether an element has a valid tabindex. */
function hasValidTabIndex(element) {
  if (!element.hasAttribute('tabindex') || element.tabIndex === undefined) {
    return false;
  }

  let tabIndex = element.getAttribute('tabindex');

  // IE11 parses tabindex="" as the value "-32768"
  if (tabIndex === '-32768') {
    return false;
  }

  return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}

/**
 * Returns the parsed tabindex from the element attributes instead of returning the
 * evaluated tabindex from the browsers defaults.
 */
function getTabIndexValue(element) {
  if (!hasValidTabIndex(element)) {
    return null;
  }

  // See browser issue in Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
  const tabIndex = parseInt(element.getAttribute('tabindex') || '', 10);

  return isNaN(tabIndex) ? -1 : tabIndex;
}

/** Checks whether the specified element is potentially tabbable on iOS */
function isPotentiallyTabbableIOS(element) {
  let nodeName = element.nodeName.toLowerCase();
  let inputType = nodeName === 'input' && element.type;

  return inputType === 'text'
    || inputType === 'password'
    || nodeName === 'select'
    || nodeName === 'textarea';
}

/**
 * Gets whether an element is potentially focusable without taking current visible/disabled state
 * into account.
 */
function isPotentiallyFocusable(element) {
  // Inputs are potentially focusable *unless* they're type="hidden".
  if (isHiddenInput(element)) {
    return false;
  }

  return isNativeFormElement(element) ||
    isAnchorWithHref(element) ||
    element.hasAttribute('contenteditable') ||
    hasValidTabIndex(element);
}

/** Gets the parent window of a DOM node with regards of being inside of an iframe. */
function getWindow(node) {
  // ownerDocument is null if `node` itself *is* a document.
  return node.ownerDocument && node.ownerDocument.defaultView || window;
}
