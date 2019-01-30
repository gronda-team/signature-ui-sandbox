import React from 'react';
import _ from 'lodash';
import { PlatformDefaultProps, PlatformPropTypes, withPlatformConsumer } from '../platform/Platform';
import { ViewportRulerProvider } from './context/ViewportRulerContext';

export const DEFAULT_RESIZE_TIME = 20;

class ViewportRuler extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** Cached viewport dimensions. */
      viewportSize: null,
      /** Array of callbacks that are triggered on resize or orientationchange events */
      callbacks: [],
      provide: {
        getViewportSize: this.getViewportSize,
        getViewportRect: this.getViewportRect,
        getViewportScrollPosition: this.getViewportScrollPosition,
        add: this.add,
        remove: this.remove,
      },
    };
    
    // create singleton for bound functions
    this.debouncedUpdateViewportSize = _.debounce(updateViewportSize.bind(this), DEFAULT_RESIZE_TIME);
    this.run = runListeners.bind(this);
  }
  
  /**
   * Lifecycle
   */
  componentDidMount() {
    if (this.props.__platform.is('browser')) {
      // add the listeners
      window.addEventListener('resize', this.run);
      window.addEventListener('orientationchange', this.run);
    }
  }
  
  componentWillUnmount() {
    if (this.props.__platform.is('browser')) {
      // remove listeners
      window.removeEventListener('resize', this.run);
      window.removeEventListener('orientationchange', this.run);
    }
  }
  
  /**
   * Actions
   */
  /** Returns the viewport's width and height. */
  getViewportSize = () => {
    let viewportSize = this.state.viewportSize;
    if (!viewportSize && this.props.__platform.is('browser')) {
      viewportSize = updateViewportSize.call(this);
    }
    
    const output = {
      width: viewportSize.width,
      height: viewportSize.height,
    };
  
    // If we're not on a browser, don't cache the size since it'll be mocked out anyway.
    this.setState({ viewportSize });
    
    return output;
  };
  
  /** Gets a ClientRect for the viewport's bounds. */
  getViewportRect = () => {
    // Use the document element's bounding rect rather than the window scroll properties
    // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
    // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
    // conceptual viewports. Under most circumstances these viewports are equivalent, but they
    // can disagree when the page is pinch-zoomed (on devices that support touch).
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
    // We use the documentElement instead of the body because, by default (without a css reset)
    // browsers typically give the document body an 8px margin, which is not included in
    // getBoundingClientRect().
    
    const scrollPosition = this.getViewportScrollPosition();
    
    const { width, height } = this.getViewportSize();
    
    return {
      height,
      width,
      top: scrollPosition.top,
      left: scrollPosition.left,
      bottom: scrollPosition.top + height,
      right: scrollPosition.left + width,
    };
  };
  
  /** Gets the (top, left) scroll position of the viewport. */
  getViewportScrollPosition = () => {
    // While we can get a reference to the fake document
    // during SSR, it doesn't have getBoundingClientRect.
    if (!this.props.__platform.is('browser')) {
      return { top: 0, left: 0 };
    }
  
    // The top-left-corner of the viewport is determined by the scroll position of the document
    // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
    // whether `document.body` or `document.documentElement` is the scrolled element, so reading
    // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
    // `document.documentElement` works consistently, where the `top` and `left` values will
    // equal negative the scroll position.
    const documentElement = document.documentElement;
    const documentRect = documentElement.getBoundingClientRect();
  
    const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
      documentElement.scrollTop || 0;
  
    const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
      documentElement.scrollLeft || 0;
  
    return { top, left };
  };
  
  /** Add viewport listener */
  add = ({ id, callback, throttleTime = DEFAULT_RESIZE_TIME }) => {
    const listener = {
      id,
      callback: _.debounce(callback, throttleTime),
    };
    this.setState(state => ({
      callbacks: [...state.callbacks, listener],
    }));
  };
  
  /** Remove viewport listener */
  remove = (id) => {
    this.setState((state) => {
      const index = _.findIndex(state.callbacks, { id });
      return [...state.callbacks].splice(index, 1);
    });
  };
  
  render() {
    return (
      <ViewportRulerProvider value={this.state.provide}>
        { this.props.children }
      </ViewportRulerProvider>
    );
  }
}

ViewportRuler.propTypes = {
  __platform: PlatformPropTypes,
};

ViewportRuler.defaultProps = {
  __platform: PlatformDefaultProps,
};

export default withPlatformConsumer(ViewportRuler);

/**
 * Private methods
 */
/** Updates the cached viewport size. */
function updateViewportSize() {
  return this.props.__platform.is('browser') ?
    { width: window.innerWidth, height: window.innerHeight } :
    { width: 0, height: 0 };
}

/** Callback that triggers all listeners */
function runListeners(event) {
  // update viewport size
  this.debouncedUpdateViewportSize();
  this.state.callbacks.forEach((listener) => {
    listener.callback(event);
  });
}
