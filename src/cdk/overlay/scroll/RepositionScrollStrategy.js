import * as React from 'react';
import PropTypes from 'prop-types';
import {ViewportRulerDefaultProps, ViewportRulerPropTypes, withViewportRuler} from '../../scrolling';
import {
  ScrollDispatcherDefaultProps,
  ScrollDispatcherPropTypes,
  withScrollDispatcher,
} from '../../scrolling/exports';
import {stack} from '../../../lib/core/components/util';
import {isElementScrolledOutsideView} from '../position/util';

/**
 * Reactive scroll strategy object to expose enable, and disable
 * functionality
 *
 * It will update the element position as the user is scrolling.
 */

class RepositionScrollStrategy extends React.Component {
  constructor() {
    super();

    this.state = {
      // whether or not the scroll strategy is enabled
      enabled: false,
    };
  }
  /** Enables repositioning of the overlay on scroll */
  enable = () => {
    if (!this.state.enabled) {
      const throttle = this.props.scrollThrottle || 0;
      this.props.__scrollDispatcher.add({
        id: this.props.overlay.OVERLAY_ID,
        throttleTime: throttle,
        callback: () => {
          this.props.overlay.updatePosition();

          if (this.props.autoClose) {
            const overlayRect = this.props.overlay.state.pane.getBoundingClientRect();
            const { width, height } = this.props.__viewportRuler.getViewportSize();

            const parentRects = [{
              width,
              height,
              bottom: height,
              right: width,
              top: 0,
              left: 0,
            }];

            if (isElementScrolledOutsideView(overlayRect, parentRects)) {
              this.disable();
              this.props.overlay.detach();
            }
          }
        },
      });
      this.setState({ enabled: true });
    }
  };

  /** Disable repositioning on scroll */
  disable = () => {
    if (this.state.enabled) {
      // todo: add scroll dispatcher
      this.setState({ enabled: false });
    }
  };

  /** Noop render */
  render = () => null;
}

const RepositionScrollStrategyPropTypes = {
  /** Associated overlay */
  overlay: PropTypes.object,
  /** Time in milliseconds to throttle the scroll events. */
  scrollThrottle: PropTypes.number,
  /** Whether to close the overlay once the user has scrolled away completely. */
  autoClose: PropTypes.bool,
};

const RepositionScrollStrategyDefaultProps = {
  scrollThrottle: 0,
  autoClose: false,
};

// Define the prop types
RepositionScrollStrategy.propTypes = {
  ...RepositionScrollStrategyPropTypes,
  __viewportRuler: ViewportRulerPropTypes,
  __scrollDispatcher: ScrollDispatcherPropTypes,
};

RepositionScrollStrategy.defaultProps = {
  ...RepositionScrollStrategyDefaultProps,
  __viewportRuler: ViewportRulerDefaultProps,
  __scrollDispatcher: ScrollDispatcherDefaultProps,
};

// Add context dependencies
const StackedRepositionScrollStrategy = stack(
  withViewportRuler,
  withScrollDispatcher,
)(RepositionScrollStrategy);

StackedRepositionScrollStrategy.propTypes = RepositionScrollStrategyPropTypes;
StackedRepositionScrollStrategy.defaultProps = RepositionScrollStrategyDefaultProps;

export default StackedRepositionScrollStrategy;
