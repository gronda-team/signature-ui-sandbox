import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Overlay from './Overlay';
import { OverlayConnectedPositionBoundingBox, OverlayPane } from './styles/index';
import { withPositionStrategyConsumer } from './position/context';
import FlexibleConnectedPositionStrategy, { ConnectedPositionPropType } from './position/FlexibleConnectedPositionStrategy';
import { ESC, ESCAPE } from '../../components/core/keys';

/*
Structure is as follows:
 (- backdrop) -- from parent
  - bounding box
    - pane
      - children
 */

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

class FlexibleConnectedPositionOverlayBase extends React.Component {
  getBoundingBoxEl = (el) => {
    this.props.__setBoundingBox(el);
  };
  
  getPaneEl = (el) => {
    // position strategy from HOC
    this.props.__setPane(el);
    // passed as normal prop to tap into it
    this.props.setPane(el);
  };
  
  getPaneStyles = () => ({
    ...this.props.__paneStyles,
    width: this.props.width,
    height: this.props.height,
    minWidth: this.props.minWidth,
    minHeight: this.props.minHeight,
  });
  
  render() {
    return (
      <Overlay
        backdrop={this.props.backdrop}
        backdropClick={this.props.backdropClick}
        overlayKeydown={this.props.overlayKeydown}
        setRoot={this.props.__setRoot}
      >
        <OverlayConnectedPositionBoundingBox style={this.props.__boundingBoxStyles} innerRef={this.getBoundingBoxEl}>
          <OverlayPane style={this.getPaneStyles()} innerRef={this.getPaneEl}>
            { this.props.children }
          </OverlayPane>
        </OverlayConnectedPositionBoundingBox>
      </Overlay>
    )
  }
}

const FlexibleConnectedPositionOverlayBaseConsumer = withPositionStrategyConsumer(FlexibleConnectedPositionOverlayBase);

export default class FlexibleConnectedPositionOverlay extends React.Component {
  getPositions = () => this.props.positions.map(pos => ({
    originX: pos.originX,
    originY: pos.originY,
    overlayX: pos.overlayX,
    overlayY: pos.overlayY,
    offsetX: pos.offsetX || this.props.offsetX,
    offsetY: pos.offsetY || this.props.offsetY
  }));
  
  overlayKeydown = (event) => {
    this.props.overlayKeydown(event);
    
    if (event.key === ESC || event.key === ESCAPE) {
      this.props.close();
    }
  };
  
  render() {
    const {
      origin,
      positions,
      offsetX,
      offsetY,
      viewportMargin,
      scrollStrategy,
      open,
      overlayKeydown,
      lockPosition,
      flexibleDimensions,
      growAfterOpen,
      push,
      positionChange,
      children,
      onOpened,
      // width, height, backdrop, backdropClick, overlayKeydown
      ...overlayProps,
    } = this.props;
    return open ? (
      <FlexibleConnectedPositionStrategy
        viewportMargin={viewportMargin}
        growAfterOpen={growAfterOpen}
        offsetX={offsetX}
        offsetY={offsetY}
        origin={origin}
        minWidth={overlayProps.minWidth}
        minHeight={overlayProps.minHeight}
        preferredPositions={this.getPositions()}
        hasFlexibleDimensions={flexibleDimensions}
        canPush={push}
        positionLocked={lockPosition}
        onPositionChange={positionChange}
        canApply={open}
        onOpened={onOpened}
      >
        <FlexibleConnectedPositionOverlayBaseConsumer {...overlayProps} overlayKeydown={this.overlayKeydown}>
          { children }
        </FlexibleConnectedPositionOverlayBaseConsumer>
      </FlexibleConnectedPositionStrategy>
    ) : null;
  }
}

FlexibleConnectedPositionOverlay.displayName = 'FlexibleConnectedPositionOverlay';

FlexibleConnectedPositionOverlay.propTypes = {
  /** Origin for the connected overlay. */
  origin: PropTypes.node,
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
  backdrop: PropTypes.oneOf(['light', 'dark', 'transparent', null]),
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
  /** Callback for attached */
  onOpened: PropTypes.func,
  /** Set pane element as state */
  setPane: PropTypes.func,
};

FlexibleConnectedPositionOverlay.defaultProps = {
  origin: null,
  positions: DEFAULT_POSITIONS,
  offsetX: null,
  offsetY: null,
  width: null,
  height: null,
  minWidth: null,
  minHeight: null,
  backdrop: null,
  viewportMargin: 0,
  scrollStrategy: null,
  open: false,
  lockPosition: false,
  flexibleDimensions: false,
  growAfterOpen: false,
  push: false,
  backdropClick: null,
  positionChange: null,
  overlayKeydown: null,
  close: _.noop,
  onOpened: _.noop,
  setPane: _.noop,
};
