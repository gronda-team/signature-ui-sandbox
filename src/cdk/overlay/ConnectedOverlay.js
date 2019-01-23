import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OverlayContextDefaultProps, OverlayContextPropTypes, withOverlayConsumer } from './context/overlay';
import { stack } from '../../lib/core/components/util';
import Overlay from './Overlay';
import { ESC, ESCAPE } from '../keycodes/keys';
import { PositionStrategyDefaultProps, PositionStrategyPropTypes, withPositionStrategy } from './position/context';
import FlexibleConnectedPositionStrategy from './position/FlexibleConnectedPositionStrategy';
import RepositionScrollStrategy from './scroll/RepositionScrollStrategy';

class ConnectedOverlay extends React.Component {
  /**
   * Lifecycle
   */
  componentDidMount() {
    this.props.setKeyDown(this.handleKeyDown);
    // set the pane once it becomes available
    this.props.setPane(this.props.__overlay.pane);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.origin !== this.props.origin) {
      if (this.props.open) {
        this.props.__positionStrategy.apply();
      }
    }
    
    if (prevProps.open !== this.props.open) {
      if (this.props.open) {
        attachOverlay.call(this);
      } else {
        detachOverlay.call(this);
      }
    }
  }
  
  componentWillUnmount() {
    destroyOverlay.call(this);
  }
  
  /**
   * Actions
   */
  /** Handle key down actions */
  handleKeyDown = (event) => {
    this.props.overlayKeydown(event);
    
    if (event.key === ESC || event.key === ESCAPE) {
      detachOverlay.call(this);
    }
  };
  
  render = () => this.props.children;
}

/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
const DEFAULT_POSITIONS = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top'
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom'
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom'
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top'
  }
];

/** A connected position as specified by the user. */
export const ConnectedPositionPropType = PropTypes.shape({
  originX: PropTypes.oneOf(['start', 'center', 'end']).isRequired,
  originY: PropTypes.oneOf(['top', 'center', 'bottom']).isRequired,
  overlayX: PropTypes.oneOf(['start', 'center', 'end']).isRequired,
  overlayY: PropTypes.oneOf(['top', 'center', 'bottom']).isRequired,
  weight: PropTypes.number,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
});

const ConnectedOverlayPropTypes = {
  /** Origin for the connected overlay. */
  origin: PropTypes.instanceOf(HTMLElement),
  /** Registered connected position pairs. */
  positions: PropTypes.arrayOf(ConnectedPositionPropType),
  /** The offset in pixels for the overlay connection point on the x-axis */
  offsetX: PropTypes.number,
  /** The offset in pixels for the overlay connection point on the y-axis */
  offsetY: PropTypes.number,
  /** The width of the overlay panel. */
  width: PropTypes.number,
  /** The height of the overlay panel. */
  height: PropTypes.number,
  /** The min width of the overlay panel. */
  minWidth: PropTypes.number,
  /** The min height of the overlay panel. */
  minHeight: PropTypes.number,
  /** The custom class to be set on the backdrop element. */
  backdrop: PropTypes.oneOf(['light', 'dark', 'transparent']),
  /** Margin between the overlay and the viewport edges. */
  viewportMargin: PropTypes.number,
  /** Strategy to be used when handling scroll events while the overlay is open. */
  scrollStrategy: PropTypes.any,
  /** Whether the overlay is open. */
  open: PropTypes.bool,
  /** Whether or not the overlay should be locked when scrolling. */
  lockPosition: PropTypes.bool,
  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  flexibleDimensions: PropTypes.bool,
  /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
  growAfterOpen: PropTypes.bool,
  /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
  push: PropTypes.bool,
  /** Event emitted when the backdrop is clicked. */
  backdropClick: PropTypes.func,
  /** Event emitted when the position has changed. */
  positionChange: PropTypes.func,
  /** Emits when there are keyboard events that are targeted at the overlay. */
  overlayKeydown: PropTypes.func,
  /** Handler to close itself */
  close: PropTypes.func,
  /** Set keydown method to close base overlay */
  setKeyDown: PropTypes.func,
  /** Listener for attachments */
  onAttached: PropTypes.func,
  /** Listener for detachments */
  onDetached: PropTypes.func,
  /** Set pane element so consumer can use it */
  setPane: PropTypes.func,
};

const ConnectedOverlayDefaultProps = {
  origin: null, // position strategy
  positions: DEFAULT_POSITIONS, // position strategy
  offsetX: null, // position strategy
  offsetY: null, // position strategy
  width: null,
  height: null,
  minWidth: null,
  minHeight: null,
  backdrop: null,
  viewportMargin: 0, // position strategy
  scrollStrategy: null,
  open: false,
  lockPosition: false, // position strategy
  flexibleDimensions: false, // position strategy
  growAfterOpen: false, // position strategy
  push: false, // position strategy
  backdropClick: null,
  positionChange: null,
  overlayKeydown: null,
  close: _.noop,
  setKeyDown: _.noop,
  onAttached: _.noop,
  onDetached: _.noop,
  setPane: _.noop,
};

ConnectedOverlay.propTypes = {
  ...ConnectedOverlayPropTypes,
  __overlay: OverlayContextPropTypes,
  __positionStrategy: PositionStrategyPropTypes,
};

ConnectedOverlay.defaultProps = {
  ...ConnectedOverlayDefaultProps,
  __overlay: OverlayContextDefaultProps,
  __positionStrategy: PositionStrategyDefaultProps,
};

const StackedConnectedOverlay = stack(
  withOverlayConsumer,
  withPositionStrategy,
)(ConnectedOverlay);

StackedConnectedOverlay.propTypes = ConnectedOverlayPropTypes;
StackedConnectedOverlay.defaultProps = ConnectedOverlayDefaultProps;

class FinalConnectedOverlay extends React.Component {
  constructor() {
    super();
    this.state = {
      keyDown: _.noop,
    };
  }
  
  setKeyDown = (keyDownListener) => {
    this.setState({ keyDown: keyDownListener });
  };
  
  render() {
    const {
      origin, positions, offsetX, offsetY, viewportMargin,
      lockPosition, flexibleDimensions, growAfterOpen, push,
      ...restProps,
    } = this.props;
    return (
      // inject position strategy so that ConnectedOverlay has access to context
      <Overlay
        onKeyDown={this.handleKeyDown}
        onBackdropClick={restProps.backdropClick}
        backdrop={restProps.backdrop}
        width={restProps.width}
        height={restProps.height}
        minWidth={restProps.minWidth}
        minHeight={restProps.minHeight}
        maxWidth={restProps.maxWidth}
        maxHeight={restProps.maxHeight}
      >
        <FlexibleConnectedPositionStrategy
          origin={origin}
          preferredPositions={positions}
          offsetX={offsetX}
          offsetY={offsetY}
          viewportMargin={viewportMargin}
          positionLocked={lockPosition}
          hasflexibledimensions={flexibleDimensions}
          growAfterOpen={growAfterOpen}
          canPush={push}
        >
          <RepositionScrollStrategy>
            <StackedConnectedOverlay
              origin={origin}
              setKeyDown={this.setKeyDown}
              {...restProps}
            >
              { restProps.open ? this.props.children : null }
            </StackedConnectedOverlay>
          </RepositionScrollStrategy>
        </FlexibleConnectedPositionStrategy>
      </Overlay>
    );
  }
}

FinalConnectedOverlay.displayName = 'ConnectedOverlay';
FinalConnectedOverlay.propTypes = ConnectedOverlayPropTypes;
FinalConnectedOverlay.defaultProps = ConnectedOverlayDefaultProps;

export default FinalConnectedOverlay;

/**
 * Private methods
 */

/** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
function attachOverlay() {
  if (!this.props.__overlay.created) {
    /** Creates an overlay */
    this.props.__overlay.create();
  } else {
    this.props.__overlay.updateSize();
  }
  
  // Attach if it isn't already
  _.defer(() => {
    if (!this.props.__overlay.attached) {
      this.props.__overlay.attach();
      _.invoke(this.props, 'onAttached');
    }
  });
  
  // todo: backdrop click stuff
}

/** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
function detachOverlay() {
  if (this.props.__overlay) {
    this.props.__overlay.detach();
    _.invoke(this.props, 'onDetached');
  }
}

/** Destroys the overlay created by this component. */
function destroyOverlay() {
  if (this.props.__overlay) {
    this.props.__overlay.dispose();
  }
}
