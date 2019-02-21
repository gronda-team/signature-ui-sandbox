import * as React from 'react';
import PropTypes from 'prop-types';
import {InteractivityCheckerDefaultProps, InteractivityCheckerPropTypes, withInteractivityChecker} from '..';

/**
 * Reactive FocusTrap object to trap focus within
 * an element and its children.
 */
class FocusTrap extends React.Component {
  constructor() {
    super();

    this.state = {
      /** Whether the anchors have been added */
      attached: false,
    };

    /**
     * We don't necessarily need these guys as part of the state
     * since we don't have any reason to tap into React's
     * reactivity. The closest proxy we'll have for reactivity
     * is state.attached.
     */
    this.START_ANCHOR = null;
    this.END_ANCHOR = null;
  }

  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps) {
    if (
      prevProps.enabled !== this.props.enabled
      && this.START_ANCHOR
      && this.END_ANCHOR
    ) {
      /** If we're toggling/not toggling, then update the tab index for the anchors */
      toggleAnchorTabIndex.call(this, this.props.enabled, this.START_ANCHOR);
      toggleAnchorTabIndex.call(this, this.props.enabled, this.END_ANCHOR);
    }

    /**
     * Instantiate the anchors when props.element is defined
     */
    if (
      (!prevProps.element && this.props.element)
      && !this.props.deferAnchors
      && this.props.enabled
    ) {
      this.attachAnchors();
    }
  }

  /**
   * Actions
   */
  /**
   * Inserts the anchors into the DOM.
   *
   * This can be done on instantiation, but it can be deferred
   * as the end user wishes.
   */
  attachAnchors = () => {
    if (this.state.attached) return true;
    let hasAttached = this.state.attached;

    if (!this.START_ANCHOR) {
      this.START_ANCHOR = createAnchor.call(this);
      this.START_ANCHOR.addEventListener('focus', this.focusLastTabbableElement);
    }

    if (!this.END_ANCHOR) {
      this.END_ANCHOR = createAnchor.call(this);
      this.END_ANCHOR.addEventListener('focus', this.focusFirstTabbableElement);
    }

    if (this.props.element.parentNode) {
      this.props.element.parentNode.insertBefore(this.START_ANCHOR, this.props.element);
      this.props.element.parentNode.insertBefore(this.END_ANCHOR, this.props.element.nextSibling);
      hasAttached = true;
      this.setState({ attached: hasAttached });
    }

    return hasAttached;
  };

  /** Destroy the focus trap by cleaning up the anchors */
  destroy = () => {
    if (this.START_ANCHOR && this.START_ANCHOR.parentNode) {
      this.START_ANCHOR.parentNode.removeChild(this.START_ANCHOR);
    }

    if (this.END_ANCHOR && this.END_ANCHOR.parentNode) {
      this.END_ANCHOR.parentNode.removeChild(this.END_ANCHOR);
    }

    this.START_ANCHOR = this.END_ANCHOR = null;
  };

  /**
   * Focuses the element that should be focused when the focus trap
   * is initialized.
   *
   * @returns boolean Whether the focus was successful.
   */
  focusInitialElement = () => {
    const redirectToElement = this.props.element.querySelector('[data-focus-initial]');

    if (redirectToElement) {
      if (!this.props.__interactivity.isFocusable(redirectToElement)) {
        console.warn('Element matching [data-focus-initial] is not focusable.', redirectToElement);
      }

      redirectToElement.focus();
      return true;
    }

    return this.focusFirstTabbableElement();
  };

  /**
   * Focuses the first tabbable element within the focus trap.
   * @returns boolean Whether focus was successful.
   */
  focusFirstTabbableElement = () => {
    const redirectToElement = getRegionBoundary.call(this, 'start');
    console.log(redirectToElement);
    if (redirectToElement) {
      redirectToElement.focus();
    }

    return !!redirectToElement;
  };

  /**
   * Focuses the last tabbable element within the focus trap region
   * @returns boolean Whether the focus was successful.
   */
  focusLastTabbableElement = () => {
    const redirectToElement = getRegionBoundary.call(this, 'end');

    if (redirectToElement) {
      redirectToElement.focus();
    }

    return !!redirectToElement;
  };

  /** Noop render */
  render = () => null;
}

const FocusTrapPropTypes = {
  /** Whether the focus trap is active */
  enabled: PropTypes.bool,
  /** Element within which to trap focus */
  element: PropTypes.element,
  /**
   * Whether we're deferring the creation of start/end anchors to a later
   * time.
   */
  deferAnchors: PropTypes.bool,
};

const FocusTrapDefaultProps = {
  enabled: true,
  element: null,
  deferAnchors: false,
};

FocusTrap.propTypes = {
  ...FocusTrapPropTypes,
  __interactivity: InteractivityCheckerPropTypes,
};

FocusTrap.defaultProps = {
  ...FocusTrapDefaultProps,
  __interactivity: InteractivityCheckerDefaultProps,
};

const StackedFocusTrap = withInteractivityChecker(FocusTrap);
StackedFocusTrap.propTypes = FocusTrapPropTypes;
StackedFocusTrap.defaultProps = FocusTrapDefaultProps;

export default StackedFocusTrap;

/**
 * Private methods
 */
/** Get the specified boundary element of the trapped region */
function getRegionBoundary(bound) {
  let markers = this.props.element.querySelectorAll(
    // Region boundaries are marked with data-focus-region
    `[data-focus-region=${bound}]`
  );

  if (bound === 'start') {
    return markers.length ?
      markers[0] :
      getFirstTabbableElement.call(this, this.props.element);
  }

  return markers.length ?
    markers[markers.length - 1] :
    getLastTabbableElement.call(this, this.props.element);
}

/** Recursively get the first tabbable element from a DOM subtree */
function getFirstTabbableElement(root) {
  console.log(
    root.nodeName,
    this.props.__interactivity.isFocusable(root),
    this.props.__interactivity.isTabbable(root)
  );
  if (
    this.props.__interactivity.isFocusable(root)
    && this.props.__interactivity.isTabbable(root)
  ) return root;

  /**
   * Iterate the DOM order. Note that IE doesn't have `children` for SVG so we fall
   * back to `childNodes` which includes text nodes, comments etc.
   */
  let children = root.children || root.childNodes;

  for (let i = 0; i < children.length; i++) {
    let tabbableChild = children[i].nodeType === document.ELEMENT_NODE ?
      getFirstTabbableElement.call(this, children[i]) :
      null;

    if (tabbableChild) return tabbableChild;
  }

  return null;
}

/** Get the last tabbable element from a DOM subtree (inclusive). */
function getLastTabbableElement(root) {
  if (
    this.props.__interactivity.isFocusable(root)
    && this.props.__interactivity.isTabbable(root)
  ) return root;

  let children = root.children || root.childNodes;
  // Iterate in reverse order
  for (let i = children.length - 1; i >= 0; i--) {
    let tabbableChild = children[i].nodeType === document.ELEMENT_NODE ?
      getLastTabbableElement.call(this, children[i]) :
      null;

    if (tabbableChild) return tabbableChild;
  }

  return null;
}

/** Create an anchor element */
function createAnchor() {
  const anchor = document.createElement('div');
  toggleAnchorTabIndex.call(this, this.props.enabled, anchor);
  if (this.DUMMY_ANCHOR_EL) {
    /**
     * Apply anchor + hidden stylings to this element
     */
    this.DUMMY_ANCHOR_EL.classList.forEach((className) => {
      anchor.classList.add(className);
    });
  }

  anchor.setAttribute('data-sui-role', 'focus-trap');

  return anchor;
}

/** Toggles the tabIndex of the anchor, depending on if the trap is enabled */
function toggleAnchorTabIndex(isEnabled, anchor) {
  /**
   * Remove the tabIndex completely rather than setting it to -1
   * in case the user navigates it via the arrow keys
   */
  isEnabled ?
    anchor.setAttribute('tabindex', '0') :
    anchor.removeAttribute('tabindex');
}
