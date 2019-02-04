import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Overlay from './Overlay';
import { ESC, ESCAPE } from '../keycodes/keys';
import FlexibleConnectedPositionStrategy from './position/FlexibleConnectedPositionStrategy';
import RepositionScrollStrategy from './scroll/RepositionScrollStrategy';

class ConnectedOverlay extends React.Component {
  constructor() {
    super();

    this.overlay = React.createRef();
    this.positionStrategy = React.createRef();
    this.scrollStrategy = React.createRef();
  }

  /**
   * Lifecycle
   */
  componentDidMount() {
    this.overlay.current.setState({
      onBackdropClick: this.props.backdropClick,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.positionStrategy.current) {
      if (prevProps.origin !== this.props.origin) {
        if (this.props.open) {
          this.positionStrategy.current.apply();
        }
      }
    }

    if (prevProps.backdropClick !== this.props.backdropClick) {
      // Set it manually if it changes
      this.overlay.current.setState({
        onBackdropClick: this.props.backdropClick,
      });
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
   * Derived data
   */
  getFinalPositions = () => {
    return this.props.positions.map(position => ({
      ...position,
      offsetX: position.offsetX || this.props.offsetX,
      offsetY: position.offsetY || this.props.offsetY,
    }));
  };

  /**
   * Actions
   */
  /** Handle key down actions */
  handleOverlayKeyDown = (event) => {
    this.props.onOverlayKeyDown(event);
    
    if (event.key === ESC || event.key === ESCAPE) {
      detachOverlay.call(this);
    }
  };

  /** Handle the position change */
  emitPositionChange = (positionEvent) => {
    this.props.onPositionChange(positionEvent);
  };
  
  render() {
    const ScrollStrategy = this.props.scrollStrategy;
    return (
      <React.Fragment>
        <ScrollStrategy
          overlay={this.overlay.current}
          ref={this.scrollStrategy}
        />
        <FlexibleConnectedPositionStrategy
          origin={this.props.origin}
          overlay={this.overlay.current}
          onPositionChange={this.emitPositionChange}
          preferredPositions={this.getFinalPositions()}
          hasFlexibleDimensions={this.props.flexibleDimensions}
          canPush={this.props.push}
          growAfterOpen={this.props.growAfterOpen}
          viewportMargin={this.props.viewportMargin}
          positionLocked={this.props.lockPosition}
          ref={this.positionStrategy}
        />
        <Overlay
          direction={this.props.dir}
          positionStrategy={this.positionStrategy.current}
          scrollStrategy={this.scrollStrategy.current}
          backdrop={this.props.backdrop}
          width={this.props.width}
          height={this.props.height}
          minWidth={this.props.minWidth}
          minHeight={this.props.minHeight}
          ref={this.overlay}
        >
          { this.props.children }
        </Overlay>
      </React.Fragment>
    );
  };
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
  scrollStrategy: PropTypes.node,
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
  /** Listener for overlay keydown events */
  onOverlayKeyDown: PropTypes.func,
  /** Called when the position strategy changes */
  onPositionChange: PropTypes.func,
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
  scrollStrategy: RepositionScrollStrategy,
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
  onOverlayKeyDown: _.noop,
  onPositionChange: _.noop,
};

ConnectedOverlay.propTypes = {
  ...ConnectedOverlayPropTypes,
};

ConnectedOverlay.defaultProps = {
  ...ConnectedOverlayDefaultProps,
};

export default ConnectedOverlay;

/**
 * Private methods
 */
/** Create an overlay */
function createOverlay() {
  const overlay = this.overlay.current;
  overlay.create();
  overlay.setState({
    onOverlayKeyDown: this.handleOverlayKeyDown,
  });
}

/** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
function attachOverlay() {
  const overlay = this.overlay.current;
  if (!overlay.state.created) {
    createOverlay.call(this);
  } else {
    overlay.updateSize();
  }

  /** Wait till next tick to try and query state.host */
  window.setTimeout(() => {
    // Attach if it isn't already
    if (!overlay.state.attached) {
      overlay.attach();
      _.invoke(this.props, 'onAttached');
    }

    if (this.props.backdrop) {
      // Set it manually
      this.overlay.current.setState({
        backdropClick: this.props.backdropClick,
      });
    }
  }, 0);
}

/** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
function detachOverlay() {
  if (this.overlay.current) {
    this.overlay.current.detach();
    this.overlay.current.setState({
      // Unsubscribe
      onOverlayKeyDown: () => {},
    });
    _.invoke(this.props, 'onDetached');
  }
}

/** Destroys the overlay created by this component. */
function destroyOverlay() {
  if (this.overlay.current) {
    this.overlay.current.dispose();
    this.overlay.current.setState({
      // Unsubscribe
      onOverlayKeyDown: () => {},
    });
  }
}
