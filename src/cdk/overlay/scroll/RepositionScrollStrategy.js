import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { stack } from '../../../lib/core/components/util';
import { withViewportRuler } from '../../scrolling';
import {
  ScrollDispatcherDefaultProps, ScrollDispatcherPropTypes,
  withScrollDispatcher,
} from '../../scrolling/context/scroll-dispatcher';
import { ViewportContextDefaultProps, ViewportContextPropTypes } from '../../scrolling/context/viewport-ruler';
import { isElementScrolledOutsideView } from '../position/scroll-clip';
import { ScrollStrategyProvider } from './context';

class RepositionScrollStrategy extends React.Component {
  constructor() {
    super();
    
    this.state = {
      // whether or not the scroll strategy is enabled
      enabled: false,
      provide: {
        attach: this.attach,
        enable: this.enable,
        disable: this.disable,
      },
    };
    
    this.SCROLL_STRATEGY_ID = _.uniqueId('sui-reposition-strategy:');
    this.onScroll = onScroll.bind(this);
  }
  
  /** Binds this scroll strategy to an overlay. */
  attach = () => {
    this.props.__overlay.setScrollStrategy(this.state.provide);
  };
  
  /** Enables repositioning of the attached overlay on scroll. */
  enable = () => {
    if (!this.state.enabled) {
      const throttle = this.props.scrollThrottle;
      this.props.__scrollDispatcher.add({
        id: this.SCROLL_STRATEGY_ID,
        callback: throttle > 0 ? _.debounce(this.onScroll, throttle) : this.onScroll,
      })
    }
  };
  
  /** Disables repositioning of the attached overlay on scroll. */
  disable = () => {
    if (this.state.enabled) {
      this.setState({ enabled: false });
    }
  };
  
  render() {
    return (
      <ScrollStrategyProvider value={this.state.provide}>
        { this.props.children }
      </ScrollStrategyProvider>
    );
  }
}

const RepositionScrollStrategyPropTypes = {
  /** Time in milliseconds to throttle the scroll events. */
  scrollThrottle: PropTypes.number,
  /** Whether to close the overlay once the user has scrolled away completely. */
  autoClose: PropTypes.bool,
};

const RepositionScrollStrategyDefaultProps = {
  scrollThrottle: 0,
  autoClose: false,
};

RepositionScrollStrategy.propTypes = {
  ...RepositionScrollStrategyPropTypes,
  __scrollDispatcher: ScrollDispatcherPropTypes,
  __viewportRuler: ViewportContextPropTypes,
};

RepositionScrollStrategy.defaultProps = {
  ...RepositionScrollStrategyDefaultProps,
  __scrollDispatcher: ScrollDispatcherDefaultProps,
  __viewportRuler: ViewportContextDefaultProps,
};

const StackedScrollStrategy = stack(
  withViewportRuler,
  withScrollDispatcher,
)(RepositionScrollStrategy);

StackedScrollStrategy.propTypes = RepositionScrollStrategyPropTypes;
StackedScrollStrategy.defaultProps = RepositionScrollStrategyDefaultProps;

export default StackedScrollStrategy;

/** handles on scroll */
function onScroll() {
  this.props.__overlay.updatePosition();
  if (this.props.autoClose) {
    const overlayRect = this.props.__overlay.pane.getBoundingClientRect();
    const { width, height } = this.props.__viewportRuler.getViewportSize();
    
    const parentRects = [{ width, height, bottom: height, right: width, top: 0, left: 0 }];
    
    if (isElementScrolledOutsideView(overlayRect, parentRects)) {
      this.disable();
      _.defer(this.props.__overlay.detach);
    }
  }
}
