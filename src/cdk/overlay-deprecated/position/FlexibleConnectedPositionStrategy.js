import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { PositionStrategyProvider } from './context';
import { isRtl } from '../../bidi/constants';
import { coerceCssPixelValue } from '../../coercion/css-pixel-value';
import { isElementClippedByScrolling, isElementScrolledOutsideView } from './scroll-clip';

export default class FlexibleConnectedPositionStrategy extends React.Component {
  constructor() {
    super();
    
    this.state = {
      isInitialRender: true,
      lastBoundingBoxSize: { width: 0, height: 0 },
      isPushed: false,
      originRect: { width: 0, height: 0 }, // origin comes from props
      overlayRect: { width: 0, height: 0 }, // must be provided via context updater (below)
      viewportRect: { width: 0, height: 0 },
      lastPosition: null,
      pane: null, // HTMLElement: the pane
      boundingBox: null, // HTMLElement: the bounding box
      root: null, // HTMLElement: the root container element
      provide: { // these are passed as context
        __boundingBoxStyles: {},
        __paneStyles: {},
        __setBoundingBox: this.setElement('boundingBox'),
        __setPane: this.setElement('pane'),
        __setRoot: this.setElement('root'),
      },
    };
  }
  
  componentDidMount() {
    if (!_.isUndefined(window)) {
      window.addEventListener('resize', this.apply);
    }
    
    if (this.props.canApply) {
      this.apply();
      // callback for onApplied
      this.props.onOpened();
    }
  }
  
  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.preferredPositions, prevProps.preferredPositions)) {
      updatePositions.call(this, this.props.preferredPositions);
    }
    
    if (prevProps.canApply !== this.props.canApply && this.props.canApply) {
      // if we go from not applying to applying, then apply it lol
      this.apply();
      // callback for onApplied
      this.props.onOpened();
    }
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.apply);
  }
  
  setElement = key => (el) => {
    this.setState({ [key]: el });
  };
  
  /**
   * Updates the position of the overlay element, using whichever preferred position relative
   * to the origin best fits on-screen.
   *
   * The selection of a position goes as follows:
   *  - If any positions fit completely within the viewport as-is,
   *      choose the first position that does so.
   *  - If flexible dimensions are enabled and at least one satisfies the given minimum width/height,
   *      choose the position with the greatest available size modified by the positions' weight.
   *  - If pushing is enabled, take the position that went off-screen the least and push it
   *      on-screen.
   *  - If none of the previous criteria were met, use the position that goes off-screen the least.
   */
  apply = () => {
    // We shouldn't do anything if the strategy was disposed or we're on the server.
    // @breaking-change 7.0.0 Remove `_platform` null check once it's guaranteed to be defined.
    if (_.isUndefined(window)) {
      return;
    }
  
    // If the position has been applied already (e.g. when the overlay was opened) and the
    // consumer opted into locking in the position, re-use the old position, in order to
    // prevent the overlay from jumping around.
    if (!this.state.isInitialRender && this.props.positionLocked && this.state.lastPosition) {
      this.reapplyLastPosition();
      return;
    }
  
    resetOverlayElementStyles.call(this);
    resetBoundingBoxStyles.call(this);
  
    // We need the bounding rects for the origin and the overlay to determine how to position
    // the overlay relative to the origin.
    // We use the viewport rect to determine whether a position would go off-screen.
    const viewportRect = getNarrowedViewportRect.call(this);
    const originRect = this.props.origin.getBoundingClientRect();
    const overlayRect = this.state.pane.getBoundingClientRect();
    
    // set it in state
    this.setState({ viewportRect, originRect, overlayRect });
  
    // Positions where the overlay will fit with flexible dimensions.
    const flexibleFits = [];
  
    // Fallback if none of the preferred positions fit within the viewport.
    let fallback;
  
    // Go through each of the preferred positions looking for a good fit.
    // If a good fit is found, it will be applied immediately.
    for (let pos of this.props.preferredPositions) {
      // Get the exact (x, y) coordinate for the point-of-origin on the origin element.
      let originPoint = getOriginPoint.call(this, originRect, pos);
    
      // From that point-of-origin, get the exact (x, y) coordinate for the top-left corner of the
      // overlay in this position. We use the top-left corner for calculations and later translate
      // this into an appropriate (top, left, bottom, right) style.
      let overlayPoint = getOverlayPoint.call(this, originPoint, overlayRect, pos);
    
      // Calculate how well the overlay would fit into the viewport with this point.
      let overlayFit = getOverlayFit.call(this, overlayPoint, overlayRect, viewportRect, pos);
    
      // If the overlay, without any further work, fits into the viewport, use this position.
      if (overlayFit.isCompletelyWithinViewport) {
        this.setState({ isPushed: false }, () => {
          applyPosition.call(this, pos, originPoint);
        });
        
        return;
      }
    
      // If the overlay has flexible dimensions, we can use this position
      // so long as there's enough space for the minimum dimensions.
      if (canFitWithFlexibleDimensions.call(this, overlayFit, overlayPoint, viewportRect)) {
        // Save positions where the overlay will fit with flexible dimensions. We will use these
        // if none of the positions fit *without* flexible dimensions.
        flexibleFits.push({
          position: pos,
          origin: originPoint,
          overlayRect,
          boundingBoxRect: calculateBoundingBoxRect.call(this, originPoint, pos)
        });
      
        continue;
      }
    
      // If the current preferred position does not fit on the screen, remember the position
      // if it has more visible area on-screen than we've seen and move onto the next preferred
      // position.
      if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
        fallback = { overlayFit, overlayPoint, originPoint, position: pos, overlayRect };
      }
    }
  
    // If there are any positions where the overlay would fit with flexible dimensions, choose the
    // one that has the greatest area available modified by the position's weight
    if (flexibleFits.length) {
      let bestFit = null;
      let bestScore = -1;
      for (const fit of flexibleFits) {
        const score =
          fit.boundingBoxRect.width * fit.boundingBoxRect.height * (fit.position.weight || 1);
        if (score > bestScore) {
          bestScore = score;
          bestFit = fit;
        }
      }
    
      this.setState({
        isPushed: false,
      }, () => {
        applyPosition.call(this, bestFit.position, bestFit.origin);
      });
      return;
    }
  
    // When none of the preferred positions fit within the viewport, take the position
    // that went off-screen the least and attempt to push it on-screen.
    if (this.props.canPush) {
      // TODO(jelbourn): after pushing, the opening "direction" of the overlay might not make sense.
      this.setState({
        isPushed: true,
      }, () => {
        applyPosition.call(this, fallback.position, fallback.originPoint);
      });
      
      return;
    }
  
    // All options for getting the overlay within the viewport have been exhausted, so go with the
    // position that went off-screen the least.
    applyPosition.call(this, fallback.position, fallback.originPoint);
  };
  
  /**
   * This re-aligns the overlay element with the trigger in its last calculated position,
   * even if a position higher in the "preferred positions" list would now fit. This
   * allows one to re-align the panel without changing the orientation of the panel.
   */
  reapplyLastPosition = () => {
    if (!_.isUndefined(window)) {
      const originRect = _.invoke(this.props.origin, 'getBoundingClientRect');
      const lastPosition = this.state.lastPosition || _.get(this.props.preferredPositions, 0);
      
      this.setState({
        originRect,
      }, () => {
        const originPoint = getOriginPoint.call(this, originRect, lastPosition);
        applyPosition.call(this, lastPosition, originPoint);
      });
      this._overlayRect = this.state.pane.getBoundingClientRect();
      this._viewportRect = getNarrowedViewportRect.call(this);
    }
  };
  
  render() {
    return (
      <PositionStrategyProvider value={this.state.provide}>
        { this.props.children }
      </PositionStrategyProvider>
    );
  }
}

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

FlexibleConnectedPositionStrategy.propTypes = {
  /** The Scrollable containers used to check scrollable view properties on position change. */
  scrollables: PropTypes.array,
  /** Ordered list of preferred positions, from most to least desirable. */
  preferredPositions: PropTypes.arrayOf(ConnectedPositionPropType),
  /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
  viewportMargin: PropTypes.number,
  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  hasFlexibleDimensions: PropTypes.bool,
  /** Whether the overlay can grow via flexible width/height after the initial open. */
  growAfterOpen: PropTypes.bool,
  /** Whether the overlay can be pushed on-screen on the initial open. */
  canPush: PropTypes.bool,
  /** Whether the overlay position is locked. */
  positionLocked: PropTypes.bool,
  /** Default offset for the overlay along the x axis. */
  offsetX: PropTypes.number,
  /** Default offset for the overlay along the y axis. */
  offsetY: PropTypes.number,
  /** Selector to be used when finding the elements on which to set the transform origin. */
  transformOriginSelector: PropTypes.string,
  /** Origin node where this connected strategy should be launched from */
  origin: PropTypes.node,
  /** directionality */
  dir: PropTypes.oneOf(['ltr', 'rtl']),
  /** Maximum width, height, etc. */
  maxWidth: PropTypes.number,
  minWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  /** listener */
  onPositionChange: PropTypes.func,
  /** Whether the strategy can apply */
  canApply: PropTypes.bool,
  /** Listener for post-apply */
  onOpened: PropTypes.func,
};

FlexibleConnectedPositionStrategy.defaultProps = {
  scrollables: [],
  preferredPositions: [],
  viewportMargin: 0,
  hasFlexibleDimensions: true,
  growAfterOpen: false,
  canPush: true,
  positionLocked: false,
  offsetX: 0,
  offsetY: 0,
  transformOriginSelector: '',
  origin: null,
  dir: 'ltr',
  maxWidth: null,
  minWidth: null,
  maxHeight: null,
  minHeight: null,
  onPositionChange: null,
  canApply: false,
  onOpened: _.noop,
};

/*
Private methods
 */
function updatePositions(positions) {
  // If the last calculated position object isn't part of the positions anymore, clear
  // it in order to avoid it being picked up if the consumer tries to re-apply.
  if (positions.indexOf(this.state.lastPosition) === -1) {
    this.setState({ lastPosition: null });
  }
}

/**
 * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
 */
function getOriginPoint(originRect, pos) {
  let x;
  if (pos.originX === 'center') {
    // Note: when centering we should always use the `left`
    // offset, otherwise the position will be wrong in RTL.
    x = originRect.left + (originRect.width / 2);
  } else {
    const startX = isRtl.call(this) ? originRect.right : originRect.left;
    const endX = isRtl.call(this) ? originRect.left : originRect.right;
    x = pos.originX === 'start' ? startX : endX;
  }
  
  let y: number;
  if (pos.originY === 'center') {
    y = originRect.top + (originRect.height / 2);
  } else {
    y = pos.originY === 'top' ? originRect.top : originRect.bottom;
  }
  
  return {x, y};
}

/**
 * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
 * origin point to which the overlay should be connected.
 */
function getOverlayPoint(originPoint, overlayRect, pos) {
  // Calculate the (overlayStartX, overlayStartY), the start of the
  // potential overlay position relative to the origin point.
  let overlayStartX;
  if (pos.overlayX === 'center') {
    overlayStartX = -overlayRect.width / 2;
  } else if (pos.overlayX === 'start') {
    overlayStartX = isRtl.call(this) ? -overlayRect.width : 0;
  } else {
    overlayStartX = isRtl.call(this) ? 0 : -overlayRect.width;
  }
  
  let overlayStartY: number;
  if (pos.overlayY === 'center') {
    overlayStartY = -overlayRect.height / 2;
  } else {
    overlayStartY = pos.overlayY === 'top' ? 0 : -overlayRect.height;
  }
  
  // The (x, y) coordinates of the overlay.
  return {
    x: originPoint.x + overlayStartX,
    y: originPoint.y + overlayStartY,
  };
}

/** Gets how well an overlay at the given point will fit within the viewport. */
function getOverlayFit(point, overlay, viewport, position) {
  let {x, y} = point;
  let offsetX = getOffset.call(this, position, 'x');
  let offsetY = getOffset.call(this, position, 'y');
  
  // Account for the offsets since they could push the overlay out of the viewport.
  if (offsetX) {
    x += offsetX;
  }
  
  if (offsetY) {
    y += offsetY;
  }
  
  // How much the overlay would overflow at this position, on each side.
  let leftOverflow = 0 - x;
  let rightOverflow = (x + overlay.width) - viewport.width;
  let topOverflow = 0 - y;
  let bottomOverflow = (y + overlay.height) - viewport.height;
  
  // Visible parts of the element on each axis.
  let visibleWidth = subtractOverflows.call(this, overlay.width, leftOverflow, rightOverflow);
  let visibleHeight = subtractOverflows.call(this, overlay.height, topOverflow, bottomOverflow);
  let visibleArea = visibleWidth * visibleHeight;
  
  return {
    visibleArea,
    isCompletelyWithinViewport: (overlay.width * overlay.height) === visibleArea,
    fitsInViewportVertically: visibleHeight === overlay.height,
    fitsInViewportHorizontally: visibleWidth === overlay.width,
  };
}

/**
 * Whether the overlay can fit within the viewport when it may resize either its width or height.
 * @param fit How well the overlay fits in the viewport at some position.
 * @param point The (x, y) coordinates of the overlat at some position.
 * @param viewport The geometry of the viewport.
 */
function canFitWithFlexibleDimensions(fit, point, viewport) {
  if (this.props.hasFlexibleDimensions) {
    const availableHeight = viewport.bottom - point.y;
    const availableWidth = viewport.right - point.x;
    const minHeight = this.props.minHeight;
    const minWidth = this.props.minWidth;
    
    const verticalFit = fit.fitsInViewportVertically ||
      (minHeight !== null && minHeight <= availableHeight);
    const horizontalFit = fit.fitsInViewportHorizontally ||
      (minWidth !== null && minWidth <= availableWidth);
    
    return verticalFit && horizontalFit;
  }
}

/**
 * Gets the point at which the overlay can be "pushed" on-screen. If the overlay is larger than
 * the viewport, the top-left corner will be pushed on-screen (with overflow occuring on the
 * right and bottom).
 *
 * @param start The starting point from which the overlay is pushed.
 * @param overlay The overlay dimensions.
 * @returns The point at which to position the overlay after pushing. This is effectively a new
 *     originPoint.
 */
function pushOverlayOnScreen(start, overlay) {
  const viewport = this.state.viewportRect;
  
  // Determine how much the overlay goes outside the viewport on each side, which we'll use to
  // decide which direction to push it.
  const overflowRight = Math.max(start.x + overlay.width - viewport.right, 0);
  const overflowBottom = Math.max(start.y + overlay.height - viewport.bottom, 0);
  const overflowTop = Math.max(viewport.top - start.y, 0);
  const overflowLeft = Math.max(viewport.left - start.x, 0);
  
  // Amount by which to push the overlay in each direction such that it remains on-screen.
  let pushX, pushY = 0;
  
  // If the overlay fits completely within the bounds of the viewport, push it from whichever
  // direction is goes off-screen. Otherwise, push the top-left corner such that its in the
  // viewport and allow for the trailing end of the overlay to go out of bounds.
  if (overlay.width <= viewport.width) {
    pushX = overflowLeft || -overflowRight;
  } else {
    pushX = viewport.left - start.x;
  }
  
  if (overlay.height <= viewport.height) {
    pushY = overflowTop || -overflowBottom;
  } else {
    pushY = viewport.top - start.y;
  }
  
  return {
    x: start.x + pushX,
    y: start.y + pushY,
  };
}

/**
 * Applies a computed position to the overlay and emits a position change.
 * @param position The position preference
 * @param originPoint The point on the origin element where the overlay is connected.
 */
function applyPosition(position, originPoint) {
  setTransformOrigin.call(this, position);
  setOverlayElementStyles.call(this, originPoint, position);
  setBoundingBoxStyles.call(this, originPoint, position);
  
  // Save the last connected position in case the position needs to be re-calculated.
  this.setState({ lastPosition: position, isInitialRender: false });
  
  // Notify that the position has been changed along with its change properties.
  // We only emit if we've got any subscriptions, because the scroll visibility
  // calculations can be somewhat expensive.
  if (_.isFunction(this.props.onPositionChange)) {
    const scrollableViewProperties = getScrollVisibility.call(this);
    this.props.onPositionChange({
      scrollableViewProperties,
      connectionPair: position,
    });
  }
}

/** Sets the transform origin based on the configured selector and the passed-in position.  */
function setTransformOrigin(position) {
  if (!this.props.transformOriginSelector) return;
  
  const elements = this.state.boundingBox
    .querySelectorAll(this.props.transformOriginSelector);
  
  let xOrigin;
  let yOrigin = position.overlayY;
  
  if (position.overlayX === 'center') {
    xOrigin = 'center';
  } else if (isRtl.call(this)) {
    xOrigin = position.overlayX === 'start' ? 'right' : 'left';
  } else {
    xOrigin = position.overlayX === 'start' ? 'left' : 'right';
  }
  
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.transformOrigin = `${xOrigin} ${yOrigin}`;
  }
}

/**
 * Gets the position and size of the overlay's sizing container.
 *
 * This method does no measuring and applies no styles so that we can cheaply compute the
 * bounds for all positions and choose the best fit based on these results.
 */
function calculateBoundingBoxRect(origin, position) {
  const viewport = this._viewportRect;
  const isRtl = isRtl.call(this);
  let height, top, bottom;
  
  if (position.overlayY === 'top') {
    // Overlay is opening "downward" and thus is bound by the bottom viewport edge.
    top = origin.y;
    height = viewport.bottom - origin.y;
  } else if (position.overlayY === 'bottom') {
    // Overlay is opening "upward" and thus is bound by the top viewport edge. We need to add
    // the viewport margin back in, because the viewport rect is narrowed down to remove the
    // margin, whereas the `origin` position is calculated based on its `ClientRect`.
    bottom = viewport.height - origin.y + this.props.viewportMargin * 2;
    height = viewport.height - bottom + this.props.viewportMargin;
  } else {
    // If neither top nor bottom, it means that the overlay
    // is vertically centered on the origin point.
    const smallestDistanceToViewportEdge =
      Math.min(viewport.bottom - origin.y, origin.y - viewport.left);
    const previousHeight = this.state.lastBoundingBoxSize.height;
    
    height = smallestDistanceToViewportEdge * 2;
    top = origin.y - smallestDistanceToViewportEdge;
    
    if (height > previousHeight && !this.state.isInitialRender && !this.props.growAfterOpen) {
      top = origin.y - (previousHeight / 2);
    }
  }
  
  // The overlay is opening 'right-ward' (the content flows to the right).
  const isBoundedByRightViewportEdge =
    (position.overlayX === 'start' && !isRtl) ||
    (position.overlayX === 'end' && isRtl);
  
  // The overlay is opening 'left-ward' (the content flows to the left).
  const isBoundedByLeftViewportEdge =
    (position.overlayX === 'end' && !isRtl) ||
    (position.overlayX === 'start' && isRtl);
  
  let width, left, right;
  
  if (isBoundedByLeftViewportEdge) {
    right = viewport.right - origin.x + this.props.viewportMargin;
    width = origin.x - viewport.left;
  } else if (isBoundedByRightViewportEdge) {
    left = origin.x;
    width = viewport.right - origin.x;
  } else {
    // If neither start nor end, it means that the overlay
    // is horizontally centered on the origin point.
    const smallestDistanceToViewportEdge =
      Math.min(viewport.right - origin.x, origin.x - viewport.top);
    const previousWidth = this.state.lastBoundingBoxSize.width;
    
    width = smallestDistanceToViewportEdge * 2;
    left = origin.x - smallestDistanceToViewportEdge;
    
    if (width > previousWidth && !this.state.isInitialRender && !this.props.growAfterOpen) {
      left = origin.x - (previousWidth / 2);
    }
  }
  
  return { top, left, bottom, right, width, height };
}

/**
 * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
 * origin's connection point and stetches to the bounds of the viewport.
 *
 * @param origin The point on the origin element where the overlay is connected.
 * @param position The position preference
 */
function setBoundingBoxStyles(origin, position) {
  const boundingBoxRect = calculateBoundingBoxRect.call(this, origin, position);
  
  // It's weird if the overlay *grows* while scrolling, so we take the last size into account
  // when applying a new size.
  if (!this.state.isInitialRender && !this.props.growAfterOpen) {
    boundingBoxRect.height = Math.min(boundingBoxRect.height, this.state.lastBoundingBoxSize.height);
    boundingBoxRect.width = Math.min(boundingBoxRect.width, this.state.lastBoundingBoxSize.width);
  }
  
  const styles = {};
  
  if (hasExactPosition.call(this)) {
    styles.top = styles.left = '0';
    styles.bottom = styles.right = '';
    styles.width = styles.height = '100%';
  } else {
    const maxHeight = this.props.maxHeight;
    const maxWidth = this.props.maxWidth;
    
    styles.height = coerceCssPixelValue(boundingBoxRect.height);
    styles.top = coerceCssPixelValue(boundingBoxRect.top);
    styles.bottom = coerceCssPixelValue(boundingBoxRect.bottom);
    styles.width = coerceCssPixelValue(boundingBoxRect.width);
    styles.left = coerceCssPixelValue(boundingBoxRect.left);
    styles.right = coerceCssPixelValue(boundingBoxRect.right);
    
    // Push the pane content towards the proper direction.
    if (position.overlayX === 'center') {
      styles.alignItems = 'center';
    } else {
      styles.alignItems = position.overlayX === 'end' ? 'flex-end' : 'flex-start';
    }
    
    if (position.overlayY === 'center') {
      styles.justifyContent = 'center';
    } else {
      styles.justifyContent = position.overlayY === 'bottom' ? 'flex-end' : 'flex-start';
    }
    
    if (maxHeight) {
      styles.maxHeight = coerceCssPixelValue(maxHeight);
    }
    
    if (maxWidth) {
      styles.maxWidth = coerceCssPixelValue(maxWidth);
    }
  }
  
  this.setState(state => ({
    lastBoundingBoxSize: boundingBoxRect,
    provide: {
      ...state.provide,
      __boundingBoxStyles: styles,
    },
  }));
}

/** Resets the styles for the overlay pane so that a new positioning can be computed. */
function resetBoundingBoxStyles() {
  this.setState(state => ({
    provide: {
      ...state.provide,
      __boundingBoxStyles: {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        height: '',
        width: '',
        alignItems: '',
        justifyContent: '',
      },
    },
  }));
}

/** Sets positioning styles to the overlay element. */
function setOverlayElementStyles(originPoint, position) {
  const styles = {};
  
  if (hasExactPosition.call(this)) {
    _.merge(
      styles,
      getExactOverlayY.call(this, position, originPoint),
      getExactOverlayX.call(this, position, originPoint)
    );
  } else {
    styles.position = 'static';
  }
  
  // Use a transform to apply the offsets. We do this because the `center` positions rely on
  // being in the normal flex flow and setting a `top` / `left` at all will completely throw
  // off the position. We also can't use margins, because they won't have an effect in some
  // cases where the element doesn't have anything to "push off of". Finally, this works
  // better both with flexible and non-flexible positioning.
  let transformString = '';
  let offsetX = getOffset.call(this, position, 'x');
  let offsetY = getOffset.call(this, position, 'y');
  
  if (offsetX) {
    transformString += `translateX(${offsetX}px) `;
  }
  
  if (offsetY) {
    transformString += `translateY(${offsetY}px)`;
  }
  
  styles.transform = transformString.trim();
  
  // If a maxWidth or maxHeight is specified on the overlay, we remove them. We do this because
  // we need these values to both be set to "100%" for the automatic flexible sizing to work.
  // The maxHeight and maxWidth are set on the boundingBox in order to enforce the constraint.
  if (this.props.hasFlexibleDimensions && this.props.maxHeight) {
    styles.maxHeight = '';
  }
  
  if (this.props.hasFlexibleDimensions && this.props.maxWidth) {
    styles.maxWidth = '';
  }
  
  this.setState(state => ({
    provide: {
      ...state.provide,
      __paneStyles: styles,
    },
  }));
}

/** Resets the styles for the overlay pane so that a new positioning can be computed. */
function resetOverlayElementStyles() {
  this.setState(state => ({
    provide: {
      ...state.provide,
      __paneStyles: {
        top: '', left: '', bottom: '', right: '', position: '',
      },
    },
  }));
}

/** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
function getExactOverlayY(position, originPoint) {
  // Reset any existing styles. This is necessary in case the
  // preferred position has changed since the last `apply`.
  let styles = { top: null, bottom: null };
  let overlayPoint = getOverlayPoint.call(this, originPoint, this._overlayRect, position);
  
  if (this.state.isPushed) {
    overlayPoint = pushOverlayOnScreen.call(this, overlayPoint, this._overlayRect);
  }
  
  // @breaking-change 7.0.0 Currently the `_overlayContainer` is optional in order to avoid a
  // breaking change. The null check here can be removed once the `_overlayContainer` becomes
  // a required parameter.
  const virtualKeyboardOffset = this.state.root ?
    this.state.root.getBoundingClientRect().top : 0;
  
  // Normally this would be zero, however when the overlay is attached to an input (e.g. in an
  // autocomplete), mobile browsers will shift everything in order to put the input in the middle
  // of the screen and to make space for the virtual keyboard. We need to account for this offset,
  // otherwise our positioning will be thrown off.
  overlayPoint.y -= virtualKeyboardOffset;
  
  // We want to set either `top` or `bottom` based on whether the overlay wants to appear
  // above or below the origin and the direction in which the element will expand.
  if (position.overlayY === 'bottom') {
    // When using `bottom`, we adjust the y position such that it is the distance
    // from the bottom of the viewport rather than the top.
    const documentHeight = document.documentElement.clientHeight;
    styles.bottom = `${documentHeight - (overlayPoint.y + this._overlayRect.height)}px`;
  } else {
    styles.top = coerceCssPixelValue(overlayPoint.y);
  }
  
  return styles;
}

/** Gets the exact left/right for the overlay when not using flexible sizing or when pushing. */
function getExactOverlayX(position, originPoint) {
  // Reset any existing styles. This is necessary in case the preferred position has
  // changed since the last `apply`.
  let styles = { left: null, right: null };
  let overlayPoint = getOverlayPoint.call(this, originPoint, this._overlayRect, position);
  
  if (this.state.isPushed) {
    overlayPoint = pushOverlayOnScreen.call(this, overlayPoint, this._overlayRect);
  }
  
  // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
  // or "after" the origin, which determines the direction in which the element will expand.
  // For the horizontal axis, the meaning of "before" and "after" change based on whether the
  // page is in RTL or LTR.
  let horizontalStyleProperty: 'left' | 'right';
  
  if (isRtl.call(this)) {
    horizontalStyleProperty = position.overlayX === 'end' ? 'left' : 'right';
  } else {
    horizontalStyleProperty = position.overlayX === 'end' ? 'right' : 'left';
  }
  
  // When we're setting `right`, we adjust the x position such that it is the distance
  // from the right edge of the viewport rather than the left edge.
  if (horizontalStyleProperty === 'right') {
    const documentWidth = document.documentElement.clientWidth;
    styles.right = `${documentWidth - (overlayPoint.x + this._overlayRect.width)}px`;
  } else {
    styles.left = coerceCssPixelValue(overlayPoint.x);
  }
  
  return styles;
}

/**
 * Gets the view properties of the trigger and overlay, including whether they are clipped
 * or completely outside the view of any of the strategy's scrollables.
 */
function getScrollVisibility() {
  // Note: needs fresh rects since the position could've changed.
  const originBounds = this.state.origin.getBoundingClientRect();
  const overlayBounds =  this.state.pane.getBoundingClientRect();
  
  // TODO(jelbourn): instead of needing all of the client rects for these scrolling containers
  // every time, we should be able to use the scrollTop of the containers if the size of those
  // containers hasn't changed.
  const scrollContainerBounds = this.props.scrollables.map(scrollable => {
    return scrollable.getBoundingClientRect();
  });
  
  return {
    isOriginClipped: isElementClippedByScrolling(originBounds, scrollContainerBounds),
    isOriginOutsideView: isElementScrolledOutsideView(originBounds, scrollContainerBounds),
    isOverlayClipped: isElementClippedByScrolling(overlayBounds, scrollContainerBounds),
    isOverlayOutsideView: isElementScrolledOutsideView(overlayBounds, scrollContainerBounds),
  };
}

/** Subtracts the amount that an element is overflowing on an axis from it's length. */
function subtractOverflows(length, ...overflows) {
  return overflows.reduce((currentValue, currentOverflow) => {
    return currentValue - Math.max(currentOverflow, 0);
  }, length);
}

/** Narrows the given viewport rect by the current viewportMargin */
function getNarrowedViewportRect() {
  // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
  // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
  // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
  // and `innerHeight` that do. This is necessary, because the overlay container uses
  // 100% `width` and `height` which don't include the scrollbar either.
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const scrollPosition = getViewportScrollPosition.call(this);
  const margin = this.props.viewportMargin;
  
  return {
    top:    scrollPosition.top + margin,
    left:   scrollPosition.left + margin,
    right:  scrollPosition.left + width - margin,
    bottom: scrollPosition.top + height - margin,
    width:  width  - (2 * margin),
    height: height - (2 * margin),
  };
}

function hasExactPosition() {
  return !this.props.hasFlexibleDimensions || this.state.isPushed;
}

/** Gets the (top, left) scroll position of the viewport. */
function getViewportScrollPosition() {
  // While we can get a reference to the fake document
  // during SSR, it doesn't have getBoundingClientRect.
  if (_.isUndefined(window)) {
    return { top: 0, left: 0 };
  }
  
  // The top-left-corner of the viewport is determined by the scroll position of the document
  // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
  // whether `document.body` or `document.documentElement` is the scrolled element, so reading
  // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
  // `document.documentElement` works consistently, where the `top` and `left` values will
  // equal negative the scroll position.
  const documentRect = document.documentElement.getBoundingClientRect();
  
  const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
    document.documentElement.scrollTop || 0;
  
  const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
    document.documentElement.scrollLeft || 0;
  
  return { top, left };
}

/** Retrieves the offset of a position along the x or y axis. */
function getOffset(position, axis) {
  if (axis === 'x') {
    // We don't do something like `position['offset' + axis]` in
    // order to avoid breaking minifiers that rename properties.
    return position.offsetX === null ? this.props.offsetX : position.offsetX;
  }
  
  return position.offsetY === null ? this.props.offsetY : position.offsetY;
}
