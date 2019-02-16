import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  OverlayContainerDefaultProps, OverlayContainerPropTypes,
  withOverlayContainerConsumer,
} from '../context/overlay-container';
import { stack } from '../../../lib/core/components/util';
import { PlatformDefaultProps, PlatformPropTypes, withPlatformConsumer } from '../../platform';
import { ViewportRulerDefaultProps, ViewportRulerPropTypes, withViewportRuler } from '../../scrolling';
import {
  isElementClippedByScrolling,
  isElementScrolledOutsideView,
} from './scroll-clip';

class FlexibleConnectedPositionStrategy extends React.Component {
  constructor() {
    super();
    
    this.state = {
      // dummy so we can extract the styles
      renderDummyBoundingBox: true,
      /** Whether the strategy has been disposed of already. */
      /** Whether we're performing the very first positioning of the overlay. */
      isInitialRender: null,
      /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
      lastBoundingBoxSize: { width: 0, height: 0 },
      /** Whether the overlay was pushed in a previous positioning. */
      isPushed: false,
      /** Cached origin dimensions */
      originRect: null,
      /** Cached overlay dimensions */
      overlayRect: null,
      /** Cached viewport dimensions */
      viewportRect: null,
      /** The last position to have been calculated as the best fit position. */
      lastPosition: null,
      /** Whether the strategy has been disposed of already. */
      isDisposed: null,
      /** Amount by which the overlay was pushed in each axis during the last time it was positioned. */
      previousPushAmount: null,
      /** Keeps track of the CSS classes that the position strategy has applied on the overlay panel. */
      appliedPanelClasses: [],
      provide: {
        attach: this.attach,
        apply: this.apply,
        detach: this.detach,
        dispose: this.dispose,
        reapplyLastPosition: this.reapplyLastPosition,
      },
    };
    
    this.STRATEGY_ID = _.uniqueId('sui-fcps:');
  }
  
  /**
   * Lifecycle
   */
  componentDidMount() {
    _.defer(() => {
      this.setState({ renderDummyBoundingBox: false });
    });
  }
  
  componentDidUpdate(prevProps) {
    // If the last calculated position object isn't part of the positions anymore, clear
    // it in order to avoid it being picked up if the consumer tries to re-apply.
    if (!_.isEqual(prevProps.preferredPositions, this.props.preferredPositions)) {
      if (this.props.preferredPositions.indexOf(this.state.lastPosition) === -1) {
        this.setState({ lastPosition: null });
      }
    }
  }
  
  componentWillUnmount() {
    // remove listener
    this.props.__viewportRuler.remove(this.STRATEGY_ID);
  }
  
  /**
   * Actions
   */
  /** Attaches this position strategy to an overlay. */
  attach = () => {
    const boundingBox = this.props.overlay.state.host;
    if (boundingBox) {
      const boundingBoxStyles = Array.from(boundingBox.classList);
      boundingBoxStyles.forEach((className) => {
        this.props.overlay.state.host.classList.add(className);
      });

      boundingBox.setAttribute('data-overlay-role', 'bounding-box');
    }
    
    this.setState({
      isDisposed: false,
      isInitialRender: true,
      lastPosition: null,
    });
    
    this.props.__viewportRuler.remove(this.STRATEGY_ID);
    this.props.__viewportRuler.add({
      id: this.STRATEGY_ID,
      callback: () => {
        // When the window is resized, we want to trigger the next reposition as if it
        // was an initial render, in order for the strategy to pick a new optimal position,
        // otherwise position locking will cause it to stay at the old one.
        this.setState({ isInitialRender: true }, () => {
          this.apply();
        });
      },
    });
  };
  
  /**
   * Updates the position of the overlay element, using whichever preferred position relative
   * to the origin best fits on-screen.
   *
   * The selection of a position goes as follows:
   *  - If any positions fit completely within the viewport as-is,
   *      choose the first position that does so.
   *  - If flexible dimensions are enabled and at least one satifies the given minimum width/height,
   *      choose the position with the greatest available size modified by the positions' weight.
   *  - If pushing is enabled, take the position that went off-screen the least and push it
   *      on-screen.
   *  - If none of the previous criteria were met, use the position that goes off-screen the least.
   * @docs-private
   */
  apply = () => {
    // We shouldn't do anything if the strategy was disposed or we're on the server.
    if (this.state.isDisposed || (!this.props.__platform.is('browser'))) return;
  
    // If the position has been applied already (e.g. when the overlay was opened) and the
    // consumer opted into locking in the position, re-use the old position, in order to
    // prevent the overlay from jumping around.
    if (!this.state.isInitialRender && this.props.positionLocked && this.state.lastPosition) {
      this.reapplyLastPosition();
      return;
    }
  
    clearPanelClasses.call(this);
    resetOverlayElementStyles.call(this);
    resetBoundingBoxStyles.call(this);
  
    // We need the bounding rects for the origin and the overlay to determine how to position
    // the overlay relative to the origin.
    // We use the viewport rect to determine whether a position would go off-screen.
    const originRect = this.props.origin.getBoundingClientRect();
    const overlayRect = this.props.overlay.state.pane.getBoundingClientRect();
    const viewportRect = getNarrowedViewportRect.call(this);
    
    this.setState({ originRect, overlayRect, viewportRect });
  
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
      
      this.setState({ isPushed: false }, () => {
        applyPosition.call(this, bestFit.position, bestFit.origin);
      });
      
      return;
    }
  
    // When none of the preferred positions fit within the viewport, take the position
    // that went off-screen the least and attempt to push it on-screen.
    if (this.props.canPush) {
      this.setState({ isPushed: true }, () => {
        applyPosition.call(this, fallback.position, fallback.originPoint);
      });
      
      return;
    }
  
    // All options for getting the overlay within the viewport have been exhausted, so go with the
    // position that went off-screen the least.
    applyPosition.call(this, fallback.position, fallback.originPoint);
  };
  
  /** Remove children rendering */
  detach = () => {
    this.setState({
      lastPosition: null,
      previousPushAmount: null,
    });
  };
  
  /** Cleanup after the element gets destroyed. */
  dispose = () => {
    if (this.state.isDisposed) return;
    
    if (this.props.overlay.state.host) {
      // reset the host styles
      Object.assign(this.props.overlay.HOST.style, {
        top: '',
        left: '',
        right: '',
        bottom: '',
        height: '',
        width: '',
        alignItems: '',
        justifyContent: '',
      });
    }
    
    if (this.props.overlay.state.pane) {
      resetOverlayElementStyles.call(this);
    }
    
    if (this.props.overlay.state.host) {
      const boundingBoxStyles = Array.from(this.props.overlay.state.host.classList);
      // remove bounding box classes
      boundingBoxStyles.forEach((className) => {
        this.props.overlay.state.host.classList.remove(className);
      });

      this.props.overlay.state.host.removeAttribute('data-overlay-role');
    }
    
    this.detach();
    this.setState({ isDisposed: true });
  };
  
  /**
   * This re-aligns the overlay element with the trigger in its last calculated position,
   * even if a position higher in the "preferred positions" list would now fit. This
   * allows one to re-align the panel without changing the orientation of the panel.
   */
  reapplyLastPosition = () => {
    if (!this.state.isDisposed && (!this.props.__platform || this.props.__platform.is('browser'))) {
      this.setState({
        originRect: this.props.origin.getBoundingClientRect(),
        overlayRect: this.props.overlay.state.pane.getBoundingClientRect(),
        viewportRect: getNarrowedViewportRect.call(this),
      }, () => {
        const lastPosition = this.state.lastPosition || _.head(this.props.preferredPositions);
        const originPoint = getOriginPoint.call(this, this.state.originRect, lastPosition);
        
        applyPosition.call(this, lastPosition, originPoint);
      });
    }
  };

  /** Noop render because this is a reactive object */
  render = () => null;
}

const FCPSPropTypes = {
  /** The actual overlay to which this strategy is attached */
  overlay: PropTypes.object,
  /** The origin element against which the overlay will be positioned. */
  origin: PropTypes.instanceOf(HTMLElement),
  /** Whether the overlay can be pushed on-screen on the initial open. */
  canPush: PropTypes.bool,
  /** Whether the overlay can grow via flexible width/height after the initial open. */
  growAfterOpen: PropTypes.bool,
  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  hasFlexibleDimensions: PropTypes.bool,
  /** Whether the overlay position is locked. */
  positionLocked: PropTypes.bool,
  /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
  viewportMargin: PropTypes.number,
  /** The Scrollable containers used to check scrollable view properties on position change. */
  // todo: add scrollable type
  scrollables: PropTypes.arrayOf(PropTypes.node),
  /** Ordered list of preferred positions, from most to least desirable. */
  preferredPositions: PropTypes.array,
  /** Default offset for the overlay along the x axis. */
  offsetX: PropTypes.number,
  /** Default offset for the overlay along the y axis. */
  offsetY: PropTypes.number,
  /** Selector to be used when finding the elements on which to set the transform origin. */
  transformOriginSelector: PropTypes.string,
};

const FCPSDefaultProps = {
  overlay: null,
  origin: null,
  canPush: true,
  growAfterOpen: false,
  hasFlexibleDimensions: true,
  positionLocked: false,
  viewportMargin: 0,
  scrollables: [],
  preferredPositions: [],
  offsetX: 0,
  offsetY: 0,
  transformOriginSelector: null,
};

FlexibleConnectedPositionStrategy.propTypes = {
  ...FCPSPropTypes,
  __overlayContainer: OverlayContainerPropTypes,
  __platform: PlatformPropTypes,
  __viewportRuler: ViewportRulerPropTypes,
};

FlexibleConnectedPositionStrategy.defaultProps = {
  ...FCPSDefaultProps,
  __overlayContainer: OverlayContainerDefaultProps,
  __platform: PlatformDefaultProps,
  __viewportRuler: ViewportRulerDefaultProps,
};

const StackedPositionStrategy = stack(
  withOverlayContainerConsumer,
  withViewportRuler,
  withPlatformConsumer,
)(FlexibleConnectedPositionStrategy);

StackedPositionStrategy.propTypes = FCPSPropTypes;
StackedPositionStrategy.defaultProps = FCPSDefaultProps;

export default StackedPositionStrategy;

/**
 * Private methods
 */
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
  
  let y;
  if (pos.originY === 'center') {
    y = originRect.top + (originRect.height / 2);
  } else {
    y = pos.originY === 'top' ? originRect.top : originRect.bottom;
  }
  
  return { x, y };
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
  
  let overlayStartY;
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
  let { x, y } = point;
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
    const minHeight = this.props.overlay.props.minHeight;
    const minWidth = this.props.overlay.props.minWidth;
    
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
 * @param start Starting point from which the overlay is pushed.
 * @param overlay Dimensions of the overlay.
 * @param scrollPosition Current viewport scroll position.
 * @returns The point at which to position the overlay after pushing. This is effectively a new
 *     originPoint.
 */
function pushOverlayOnScreen(start, overlay, scrollPosition) {
  // If the position is locked and we've pushed the overlay already, reuse the previous push
  // amount, rather than pushing it again. If we were to continue pushing, the element would
  // remain in the viewport, which goes against the expectations when position locking is enabled.
  if (this.state.previousPushAmount && this.props.positionLocked) {
    return {
      x: start.x + this.state.previousPushAmount.x,
      y: start.y + this.state.previousPushAmount.y
    };
  }
  
  const viewport = this.state.viewportRect;
  
  // Determine how much the overlay goes outside the viewport on each
  // side, which we'll use to decide which direction to push it.
  const overflowRight = Math.max(start.x + overlay.width - viewport.right, 0);
  const overflowBottom = Math.max(start.y + overlay.height - viewport.bottom, 0);
  const overflowTop = Math.max(viewport.top - scrollPosition.top - start.y, 0);
  const overflowLeft = Math.max(viewport.left - scrollPosition.left - start.x, 0);
  
  // Amount by which to push the overlay in each axis such that it remains on-screen.
  let pushX = 0;
  let pushY = 0;
  
  // If the overlay fits completely within the bounds of the viewport, push it from whichever
  // direction is goes off-screen. Otherwise, push the top-left corner such that its in the
  // viewport and allow for the trailing end of the overlay to go out of bounds.
  if (overlay.width < viewport.width) {
    pushX = overflowLeft || -overflowRight;
  } else {
    pushX = start.x < this.props.viewportMargin ? (viewport.left - scrollPosition.left) - start.x : 0;
  }
  
  if (overlay.height < viewport.height) {
    pushY = overflowTop || -overflowBottom;
  } else {
    pushY = start.y < this.props.viewportMargin ? (viewport.top - scrollPosition.top) - start.y : 0;
  }
  
  this.setState({
    previousPushAmount: { x: pushX, y: pushY },
  });
  
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
  
  if (position.panelClass) {
    addPanelClasses.call(this, position.panelClass);
  }
  
  // Save the last connected position in case the position needs to be re-calculated.
  this.setState({ lastPosition: position, isInitialRender: false });
  
  // todo: add listener? line 664 in material2-master
}

/** Sets the transform origin based on the configured selector and the passed-in position.  */
function setTransformOrigin(position) {
  if (!this.props.transformOriginSelector) return;
  
  const elements =
    this.props.overlay.state.host.querySelectorAll(this.props.transformOriginSelector);
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
  const viewport = this.state.viewportRect;
  const rtl = isRtl.call(this);
  let height;
  let top;
  let bottom;
  
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
    // If neither top nor bottom, it means that the overlay is vertically centered on the
    // origin point. Note that we want the position relative to the viewport, rather than
    // the page, which is why we don't use something like `viewport.bottom - origin.y` and
    // `origin.y - viewport.top`.
    const smallestDistanceToViewportEdge =
      Math.min(viewport.bottom - origin.y + viewport.top, origin.y);
    
    const previousHeight = this.state.lastBoundingBoxSize.height;
    
    height = smallestDistanceToViewportEdge * 2;
    top = origin.y - smallestDistanceToViewportEdge;
    
    if (height > previousHeight && !this.state.isInitialRender && !this.props.growAfterOpen) {
      top = origin.y - (previousHeight / 2);
    }
  }
  
  // The overlay is opening 'right-ward' (the content flows to the right).
  const isBoundedByRightViewportEdge =
    (position.overlayX === 'start' && !rtl) ||
    (position.overlayX === 'end' && rtl);
  
  // The overlay is opening 'left-ward' (the content flows to the left).
  const isBoundedByLeftViewportEdge =
    (position.overlayX === 'end' && !rtl) ||
    (position.overlayX === 'start' && rtl);
  
  let width;
  let left;
  let right;
  
  if (isBoundedByLeftViewportEdge) {
    right = viewport.right - origin.x + this.props.viewportMargin;
    width = origin.x - viewport.left;
  } else if (isBoundedByRightViewportEdge) {
    left = origin.x;
    width = viewport.right - origin.x;
  } else {
    // If neither start nor end, it means that the overlay is horizontally centered on the
    // origin point. Note that we want the position relative to the viewport, rather than
    // the page, which is why we don't use something like `viewport.right - origin.x` and
    // `origin.x - viewport.left`.
    const smallestDistanceToViewportEdge =
      Math.min(viewport.right - origin.x + viewport.left, origin.x);
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
  
  let styles = {};
  
  if (hasExactPosition.call(this)) {
    styles.top = styles.left = '0';
    styles.bottom = styles.right = '';
    styles.width = styles.height = '100%';
  } else {
    const maxHeight = this.props.overlay.props.maxHeight;
    const maxWidth = this.props.overlay.props.maxWidth;
    
    Object.assign(
      styles,
      ['height', 'top', 'bottom', 'width', 'left', 'right'].reduce((acc, key) => {
        if (!_.isNil(boundingBoxRect[key])) {
          acc[key] = `${boundingBoxRect[key]}px`;
        }
        
        return acc;
      }, {}),
    );
    
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
    
    if (!_.isNil(maxHeight)) {
      styles.maxHeight = `${maxHeight}px`;
    }
    
    if (!_.isNil(maxWidth)) {
      styles.maxWidth = `${maxWidth}px`;
    }
  }
  
  this.setState({
    lastBoundingBoxSize: boundingBoxRect,
  });
  
  Object.assign(
    this.props.overlay.HOST.style,
    styles,
  );
}

/** Resets the styles for the bounding box so that a new positioning can be computed. */
function resetBoundingBoxStyles() {
  Object.assign(this.props.overlay.HOST.style, {
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    height: '',
    width: '',
    alignItems: '',
    justifyContent: '',
  });
}

/** Resets the styles for the overlay pane so that a new positioning can be computed. */
function resetOverlayElementStyles() {
  Object.assign(this.props.overlay.PANE.style, {
    top: '',
    left: '',
    bottom: '',
    right: '',
    position: '',
  });
}

/** Sets positioning styles to the overlay element. */
function setOverlayElementStyles(originPoint, position) {
  let styles = {};
  if (hasExactPosition.call(this)) {
    const scrollPosition = this.props.__viewportRuler.getViewportScrollPosition();
    
    Object.assign(
      styles,
      getExactOverlayY.call(this, position, originPoint, scrollPosition),
      getExactOverlayX.call(this, position, originPoint, scrollPosition),
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
  if (this.props.hasFlexibleDimensions && this.props.overlay.props.maxHeight) {
    styles.maxHeight = '';
  }
  
  if (this.props.hasFlexibleDimensions && this.props.overlay.props.maxWidth) {
    styles.maxWidth = '';
  }
  
  Object.assign(this.props.overlay.PANE.style, styles);
}

/** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
function getExactOverlayY(position, originPoint, scrollPosition) {
  // Reset any existing styles. This is necessary in case the
  // preferred position has changed since the last `apply`.
  let styles = { top: null, bottom: null };
  let overlayPoint = getOverlayPoint.call(this, originPoint, this.state.overlayRect, position);
  
  if (this.state.isPushed) {
    overlayPoint = pushOverlayOnScreen.call(this, overlayPoint, this.state.overlayRect, scrollPosition);
  }
  
  const virtualKeyboardOffset = this.props.__overlayContainer ?
    this.props.__overlayContainer.getContainer().getBoundingClientRect().top : 0;
  
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
    styles.bottom = `${documentHeight - (overlayPoint.y + this.state.overlayRect.height)}px`;
  } else if (!_.isNil(overlayPoint.y)) {
    styles.top = `${overlayPoint.y}px`;
  }
  
  return styles;
}

function getExactOverlayX(position, originPoint, scrollPosition) {
  // Reset any existing styles. This is necessary in case the preferred position has
  // changed since the last `apply`.
  let styles = { left: null, right: null };
  let overlayPoint = getOverlayPoint.call(this, originPoint, this.state.overlayRect, position);
  
  if (this.state.isPushed) {
    overlayPoint = pushOverlayOnScreen.call(this, overlayPoint, this.state.overlayRect, scrollPosition);
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
    styles.right = `${documentWidth - (overlayPoint.x + this.state.overlayRect.width)}px`;
  } else if (!_.isNil(overlayPoint.x)) {
    styles.left = `${overlayPoint.x}px`;
  }
  
  return styles;
}

/**
 * Gets the view properties of the trigger and overlay, including whether they are clipped
 * or completely outside the view of any of the strategy's scrollables.
 */
function getScrollVisibility() {
  // Note: needs fresh rects since the position could've changed.
  const originBounds = this.props.origin.getBoundingClientRect();
  const overlayBounds =  this.props.overlay.state.pane.getBoundingClientRect();
  
  const scrollContainerBounds = this.props.scrollables.map(scrollable => {
    return scrollable.getBoundingClientRect();
  });
  
  return {
    isOriginClipped: isElementClippedByScrolling.call(this, originBounds, scrollContainerBounds),
    isOriginOutsideView: isElementScrolledOutsideView.call(this, originBounds, scrollContainerBounds),
    isOverlayClipped: isElementClippedByScrolling.call(this, overlayBounds, scrollContainerBounds),
    isOverlayOutsideView: isElementScrolledOutsideView.call(this, overlayBounds, scrollContainerBounds),
  };
}

/** Subtracts the amount that an element is overflowing on an axis from it's length. */
function subtractOverflows(length, ...overflows) {
  return overflows.reduce((currentValue, currentOverflow) => currentValue - Math.max(currentOverflow, 0), length);
}

/** Narrows the given viewport rect by props.viewportMargin. */
function getNarrowedViewportRect() {
  // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
  // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
  // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
  // and `innerHeight` that do. This is necessary, because the overlay container uses
  // 100% `width` and `height` which don't include the scrollbar either.
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const scrollPosition = this.props.__viewportRuler.getViewportScrollPosition();
  
  return {
    top:    scrollPosition.top + this.props.viewportMargin,
    left:   scrollPosition.left + this.props.viewportMargin,
    right:  scrollPosition.left + width - this.props.viewportMargin,
    bottom: scrollPosition.top + height - this.props.viewportMargin,
    width:  width  - (2 * this.props.viewportMargin),
    height: height - (2 * this.props.viewportMargin),
  };
}

/** Whether the we're dealing with an RTL context */
function isRtl() {
  return this.props.overlay.props.dir === 'rtl';
}

/** Determines whether the overlay uses exact or flexible positioning. */
function hasExactPosition() {
  return !this.props.hasFlexibleDimensions || this.state.isPushed;
}

/** Retrieves the offset of a position along the x or y axis. */
function getOffset(position, axis) {
  if (axis === 'x') {
    // We don't do something like `position['offset' + axis]` in order to avoid breaking minifiers that rename properties.
    return position.offsetX === null ? this.props.offsetX : position.offsetX;
  }
  
  return position.offsetY === null ? this.props.offsetY : position.offsetY;
}

/** Adds a single CSS class or an array of classes on the overlay panel. */
function addPanelClasses(cssClasses) {
  if (this.props.overlay.state.pane) {
    const classes = _.castArray(cssClasses);
    this.setState(state => ({
      appliedPanelClasses: _.uniq([...state.appliedPanelClasses, ...classes]),
    }), () => {
      classes.forEach((cssClass) => {
        this.props.overlay.state.pane.classList.add(cssClass);
      });
    });
  }
}

/** Clears the classes that the position strategy has applied from the overlay panel. */
function clearPanelClasses() {
  if (this.props.overlay.state.pane) {
    const classes = this.state.appliedPanelClasses;
    this.setState({ appliedPanelClasses: [] }, () => {
      classes.forEach((cssClass) => {
        this.props.overlay.state.pane.classList.remove(cssClass);
      });
    });
  }
}
