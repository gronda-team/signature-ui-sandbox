import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../util';

export const PlatformPropTypes = PropTypes.shape({
  is: PropTypes.func,
});

export const PlatformDefaultProps = {
  is: _.stubFalse,
};

const { Provider: PlatformProvider, Consumer: PlatformConsumer } = React.createContext(PlatformDefaultProps);

// Whether the current platform supports the V8 Break Iterator. The V8 check
// is necessary to detect all Blink based browsers.
const hasV8BreakIterator = !_.isUndefined(_.get(Intl, 'v8BreakIterator'));

/**
 * Service to detect the current platform by comparing the userAgent strings and
 * checking browser-specific global properties.
 */
export default class Platform extends React.Component {
  /**
   * Derived data
   */
  /* Convenience function for checking platform.is('browser') or s/t like that */
  is = (platformType) => {
    const platform = _.toUpper(platformType);
    switch (platform) {
      case 'BROWSER': return isBrowser();
      case 'EDGE': return isEdge();
      case 'TRIDENT': return isTrident();
      case 'BLINK': return isBlink();
      case 'WEBKIT': return isWebKit();
      case 'IOS': return isIOS();
      case 'FIREFOX': return isFirefox();
      case 'ANDROID': return isAndroid();
      case 'SAFARI': return isSafari();
      default: return false;
    }
  };
  
  /** Get provider value */
  providerValue = () => ({
    is: this.is,
  });
  
  render() {
    return (
      <PlatformProvider value={this.providerValue()}>
        { this.props.children }
      </PlatformProvider>
    )
  }
}

export { PlatformProvider, PlatformConsumer }

export function withPlatformConsumer(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithPlatform extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <PlatformConsumer>
          { value => (
            <Component
              {...restProps}
              __platform={value}
              ref={forwardedRef}
            />
          ) }
        </PlatformConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithPlatform {...props} forwardedRef={ref} />
  }

  forwardRef.displayName = `WithPlatform(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}

/**
 * private methods
 */
/* Whether the application is being rendered in the browser. */
function isBrowser() {
  return _.isObject(document) && !!document;
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
  return isBrowser()
    && (!_.isNil(_.get(window, 'chrome')) || hasV8BreakIterator)
    && !_.isUndefined(CSS)
    && !isEdge() && !isTrident();
}

/** Whether the current rendering engine is WebKit. */
// Webkit is part of the userAgent in EdgeHTML, Blink and Trident. Therefore we need to
// ensure that Webkit runs standalone and is not used as another engine's base.
function isWebKit() {
  return isBrowser()
    && /AppleWebKit/i.test(navigator.userAgent)
    && !isBlink() && !isEdge() && !isTrident();
}

/** Whether the current platform is Apple iOS. */
function isIOS() {
  return isBrowser()
    && /iPad|iPhone|iPod/.test(navigator.userAgent)
    && !_.get(window, 'MSStream');
}

/** Whether the current browser is Firefox. */
// It's difficult to detect the plain Gecko engine, because most of the browsers identify
// them self as Gecko-like browsers and modify the userAgent's according to that.
// Since we only cover one explicit Firefox case, we can simply check for Firefox
// instead of having an unstable check for Gecko.
function isFirefox() {
  return isBrowser() && /(firefox|minefield)/i.test(navigator.userAgent);
}

/** Whether the current platform is Android. */
// Trident on mobile adds the android platform to the userAgent to trick detections.
function isAndroid() {
  return isBrowser()
    && /android/i.test(navigator.userAgent)
    && !isTrident();
}

/** Whether the current browser is Safari. */
// Safari browsers will include the Safari keyword in their userAgent. Some browsers may fake
// this and just place the Safari keyword in the userAgent. To be more safe about Safari every
// Safari browser should also use Webkit as its layout engine.
function isSafari() {
  return isBrowser()
    && /safari/i.test(navigator.userAgent)
    && isWebKit();
}
