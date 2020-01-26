import * as React from 'react';
import noop from 'lodash/noop';
import invoke from 'lodash/invoke';
import { OverlayActions } from '../context';
import { useViewportRuler } from '../../Scrolling';
import get from 'lodash/get';
import { isElementClippedByScrolling, isElementScrolledOutsideView, subtractOverflows, utils } from './util';
import { usePlatform } from '../../Platform';

/**
 * A connected position as specified by the user.
 * @typedef {Object} ConnectedPosition
 * @property originX {'start' | 'center' | 'end'}
 * @property originY {'top' | 'center' | 'bottom'}
 * @property overlayX {'start' | 'center' | 'end'}
 * @property overlayY {'top' | 'center' | 'bottom'}
 * @property [weight] {number}
 * @property [offsetX] {number}
 * @property [offsetY] {number}
 * @property [paneAttributes] {Object}
 */

/**
 * @typedef {Object} ScrollingVisibility
 * @property isOriginClipped {boolean}
 * @property isOriginOutsideView {boolean}
 * @property isOverlayClipped {boolean}
 * @property isOverlayOutsideView {boolean}
 */

/**
 * Position and size of the overlay sizing wrapper for a specific position.
 * @typedef {Object} BoundingBoxRect
 * @property top {number}
 * @property left {number}
 * @property bottom {number}
 * @property right {number}
 * @property height {number}
 * @property width {number}
 */

/**
 * @typedef {Object} Point
 * @property x {number}
 * @property y {number}
 */

/**
 * Record of measurements for how an overlay (at a given position) fits into the viewport
 * @typedef {Object} OverlayFit
 * @property isCompletelyWithinViewport {boolean} Whether the overlay fits completely in
 * the viewport.
 * @property fitsInViewportVertically {boolean} Whether the overlay fits in the viewport on the
 * y-axis.
 * @property fitsInViewportHorizontally {boolean} Whether the overlay fits in the viewport on the
 * x-axis.
 * @property visibleArea {number} The total visible area (in px^2) of the overlay inside the
 * viewport.
 */

/**
 * @typedef {Object} FlexibleFit
 * @property position {ConnectedPosition}
 * @property origin {Point}
 * @property overlayRect {ClientRect}
 * @property boundingBoxRect {BoundingBoxRect}
 */

/**
 * Keys in the position strategy config
 * @type {string[]}
 */
const FLEXIBLE_STRATEGY_PROP_KEYS = [
  'origin',
  'offsetX',
  'offsetY',
  'hasFlexibleDimensions',
  'viewportMargin',
  'scrollables',
  'positionLocked',
  'growAfterOpen',
  'enableTransformOrigin',
  'onPositionChange',
  'preferredPositions',
  'canPush',
];

const DEFAULT_CONFIGS = {
  /** The origin element against which the overlay will be positioned. */
  origin: null,
  /** Default offset for the overlay along the x axis. */
  offsetX: 0,
  /** Default offset for the overlay along the y axis. */
  offsetY: 0,
  /** Whether the overlay's width and height can be constrained to fit within the viewport. */
  hasFlexibleDimensions: true,
  /** Amount of space that must be maintained between the overlay and the edge of the viewport. */
  viewportMargin: 0,
  /** The Scrollable containers used to check scrollable view properties on position change. */
  scrollables: [],
  /** Whether the overlay position is locked. */
  positionLocked: false,
  /** Whether the overlay can grow via flexible width/height after the initial open. */
  growAfterOpen: false,
  /** Enable transform origin to be calculated for components looking to grow and animate. */
  enableTransformOrigin: '',
  /** Subject that emits whenever the position changes. */
  onPositionChange: '',
  /** Ordered list of preferred positions, from most to least desirable. */
  preferredPositions: [],
  /** Whether the overlay can be pushed on-screen on the initial open. */
  canPush: true,
};

/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * implicit position relative some origin element. The relative position is defined in terms of
 * a point on the origin element that is connected to a point on the overlay element. For example,
 * a basic dropdown is connecting the bottom-left corner of the origin to the top-left corner
 * of the overlay.
 */
function useFlexibleConnectedPositionStrategy(state, dispatch) {
  const is = usePlatform();
  /** Whether we're performing the very first positioning of the overlay. */
  const isInitialRender = React.useRef(false);

  /** Whether the strategy has been disposed of already. */
  const isDisposed = React.useRef(false);

  /**
   * Change listener cleanup for resize
   * @type {React.MutableRefObject<Function>}
   */
  const removeResizeListener = React.useRef(noop);

  /** Last size used for the bounding box. Used to avoid resizing the overlay after open. */
  const lastBoundingBoxSize = React.useRef({ width: 0, height: 0 });

  /**
   * The last position to have been calculated as the best fit position.
   * @type {React.MutableRefObject<ConnectedPosition | null>}
   */
  const lastPosition = React.useRef(null);

  /** @type {React.MutableRefObject<ClientRect | null>} Cached overlay dimensions */
  const overlayRect = React.useRef(null);

  /** @type {React.MutableRefObject<ClientRect | null>} Cached viewport dimensions */
  const viewportRect = React.useRef(null);

  /** @type {React.MutableRefObject<Array>} List of data attributes to be nullified for the pane */
  const currentPaneAttributes = React.useRef([]);

  /**
   * Change listener cleanup for resize
   * @type {React.MutableRefObject<null | { x: number, y: number }>}
   */
  const previousPushAmount = React.useRef(null);

  /** Whether the overlay was pushed in a previous positioning. */
  const isPushed = React.useRef(false);

  const vr = useViewportRuler();

  /**
   * @type {Object}
   */
  const config = React.useMemo(
    () => {
      const { positionStrategyConfig: config } = state;

      const mappedConfig = FLEXIBLE_STRATEGY_PROP_KEYS.reduce((acc, key) => {
        if (config[key] != null) {
          acc[key] = config[key];
        }
        return acc;
      }, {});

      return {
        ...DEFAULT_CONFIGS,
        ...mappedConfig,
      };
    },
    FLEXIBLE_STRATEGY_PROP_KEYS
      .map(key => get(state, ['positionStrategyConfig', key]))
  );

  /**
   * Returns the ClientRect of the current origin.
   * @type {function(): ClientRect}
   */
  const getOriginRect = React.useCallback(() => {
    const origin = config.origin;

    if (origin instanceof HTMLElement) {
      return origin.getBoundingClientRect();
    }

    const width = origin.width || 0;
    const height = origin.height || 0;

    // If the origin is a point, return a client rect as if it was a 0x0 element at the point.
    return {
      width,
      height,
      top: origin.y,
      bottom: origin.y + height,
      left: origin.x,
      right: origin.x + width,
    }
  }, [config.origin]);

  /**
   * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
   * @type {function(originRect: ClientRect, pos: ConnectedPosition): Point}
   */
  const getOriginPoint = React.useCallback((originRect, pos) => {
    let x;
    if (pos.originX === 'center') {
      // Note: when centering we should always use the `left`
      // offset, otherwise the position will be wrong in RTL.
      x = originRect.left + (originRect.width / 2);
    } else {
      const startX = state.dir === 'rtl' ? originRect.right : originRect.left;
      const endX = state.dir === 'rtl' ? originRect.left : originRect.right;
      x = pos.originX === 'start' ? startX : endX;
    }

    let y;
    if (pos.originY === 'center') {
      y = originRect.top + (originRect.height / 2);
    } else {
      y = pos.originY === 'top' ? originRect.top : originRect.bottom;
    }

    return { x, y };
  }, [
    state.dir,
  ]);

  /**
   * Retrieves the offset of a position along the x or y axis.
   * @type {function(position: ConnectedPosition, axis: 'x' | 'y'): number}
   */
  const getOffset = React.useCallback((position, axis) => {
    if (axis === 'x') {
      // We don't do something like `position['offset' + axis]` in
      // order to avoid breaking minifiers that rename properties.
      return position.offsetX == null ? config.offsetX : position.offsetX;
    }

    return position.offsetY == null ? config.offsetY : position.offsetY;
  }, [
    config.offsetX,
    config.offsetY,
  ]);

  /**
   * Determines whether the overlay uses exact or flexible positioning. Keep this as a callback
   * because we make use of a ref.
   * @type {function(): boolean}
   */
  const hasExactPosition = React.useCallback(() => (
    !config.hasFlexibleDimensions || isPushed.current
  ), [config.hasFlexibleDimensions]);

  /**
   * Narrows the given viewport rect by the current viewportMargin.
   * @type {function(): ClientRect}
   */
  const getNarrowedViewportRect = React.useCallback(() => {
    // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
    // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
    // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
    // and `innerHeight` that do. This is necessary, because the overlay container uses
    // 100% `width` and `height` which don't include the scrollbar either.
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const scrollPosition = vr.getViewportScrollPosition();

    return {
      top: scrollPosition.top + config.viewportMargin,
      left: scrollPosition.left + config.viewportMargin,
      right: scrollPosition.left + width - config.viewportMargin,
      bottom: scrollPosition.top + height - config.viewportMargin,
      width: width - (2 * config.viewportMargin),
      height: height - (2 * config.viewportMargin),
    };
  }, [
    vr.getViewportScrollPosition,
    config.viewportMargin,
  ]);

  /**
   * Gets the view properties of the trigger and overlay, including whether they are clipped
   * or completely outside the view of any of the strategy's scrollables.
   * @type {function(): ScrollingVisibility}
   */
  const getScrollVisibility = React.useCallback(() => {
    // Note: needs fresh rects since the position could've changed.
    const originBounds = getOriginRect();
    const overlayBounds =  state.pane.getBoundingClientRect();

    const scrollContainerBounds = config.scrollables.map(scrollable => (
      scrollable.getBoundingClientRect()
    ));

    return {
      isOriginClipped: isElementClippedByScrolling(originBounds, scrollContainerBounds),
      isOriginOutsideView: isElementScrolledOutsideView(originBounds, scrollContainerBounds),
      isOverlayClipped: isElementClippedByScrolling(overlayBounds, scrollContainerBounds),
      isOverlayOutsideView: isElementScrolledOutsideView(overlayBounds, scrollContainerBounds),
    };
  }, [
    getOriginRect,
    state.pane,
    config.scrollables,
  ]);

  /**
   * Gets the point at which the overlay can be "pushed" on-screen. If the overlay is larger than
   * the viewport, the top-left corner will be pushed on-screen (with overflow occurring on the
   * right and bottom).
   *
   * @param start {Point} Starting point from which the overlay is pushed.
   * @param overlay {ClientRect} Dimensions of the overlay.
   * @param scrollPosition {ViewportScrollPosition} Current viewport scroll position.
   * @returns {Point} The point at which to position the overlay after pushing. This is effectively
   * a new originPoint.
   */
  const pushOverlayOnScreen = React.useCallback((start, overlay, scrollPosition) => {
    if (previousPushAmount.current && config.positionLocked) {
      return {
        x: start.x + previousPushAmount.current.x,
        y: start.y + previousPushAmount.current.y,
      };
    }

    const viewport = viewportRect.current;

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
    if (overlay.width <= viewport.width) {
      pushX = overflowLeft || -overflowRight;
    } else {
      pushX = start.x < config.viewportMargin ? (viewport.left - scrollPosition.left) - start.x : 0;
    }

    if (overlay.height <= viewport.height) {
      pushY = overflowTop || -overflowBottom;
    } else {
      pushY = start.y < config.viewportMargin ? (viewport.top - scrollPosition.top) - start.y : 0;
    }

    previousPushAmount.current = { x: pushX, y: pushY };

    return {
      x: start.x + pushX,
      y: start.y + pushY,
    };
  }, [
    config.viewportMargin,
    config.positionLocked,
  ]);

  /**
   * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
   * origin point to which the overlay should be connected.
   *
   * @param originPoint {Point} Starting origin point.
   * @param overlayRect {ClientRect} Dimensions of the overlay.
   * @param pos {ConnectedPosition} Current viewport scroll position.
   * @returns {Point} Coordinate of the top-left corner of the overlay.
   */
  const getOverlayPoint = React.useCallback((originPoint, overlayRect, pos) => {

    // Calculate the (overlayStartX, overlayStartY), the start of the
    // potential overlay position relative to the origin point.
    let overlayStartX;
    if (pos.overlayX === 'center') {
      overlayStartX = -overlayRect.width / 2;
    } else if (pos.overlayX === 'start') {
      overlayStartX = state.dir === 'rtl' ? -overlayRect.width : 0;
    } else {
      overlayStartX = state.dir === 'rtl' ? 0 : -overlayRect.width;
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
  }, [state.dir]);

  /**
   * Gets how well an overlay at the given point will fit within the viewport
   * @type {function(point: Point, overlay: ClientRect, viewport: ClientRect,
    position: ConnectedPosition): OverlayFit}
   */
  const getOverlayFit = React.useCallback((point, overlay, viewport, position) => {
    let { x, y } = point;
    let offsetX = getOffset(position, 'x');
    let offsetY = getOffset(position, 'y');

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
    let visibleWidth = subtractOverflows(overlay.width, leftOverflow, rightOverflow);
    let visibleHeight = subtractOverflows(overlay.height, topOverflow, bottomOverflow);
    let visibleArea = visibleWidth * visibleHeight;

    return {
      visibleArea,
      isCompletelyWithinViewport: (overlay.width * overlay.height) === visibleArea,
      fitsInViewportVertically: visibleHeight === overlay.height,
      fitsInViewportHorizontally: visibleWidth === overlay.width,
    };
  }, [
    getOffset,
  ]);

  /**
   * Gets the position and size of the overlay's sizing container.
   *
   * This method does no measuring and applies no styles so that we can cheaply compute the
   * bounds for all positions and choose the best fit based on these results.
   * @type {function(origin: Point, position: ConnectedPosition): BoundingBoxRect}
   */
  const calculateBoundingBoxRect = React.useCallback((origin, position) => {
    const viewport = viewportRect.current;
    const isRtl = state.dir === 'rtl';
    let height;
    let top;
    let bottom;

    if (position.overlayY === 'top') {
      // Overlay is opening "downward" and thus is bound by the bottom viewport edge.
      top = origin.y;
      height = viewport.height - top + config.viewportMargin;
    } else if (position.overlayY === 'bottom') {
      // Overlay is opening "upward" and thus is bound by the top viewport edge. We need to add
      // the viewport margin back in, because the viewport rect is narrowed down to remove the
      // margin, whereas the `origin` position is calculated based on its `ClientRect`.
      bottom = viewport.height - origin.y + config.viewportMargin * 2;
      height = viewport.height - bottom + config.viewportMargin;
    } else {
      // If neither top nor bottom, it means that the overlay is vertically centered on the
      // origin point. Note that we want the position relative to the viewport, rather than
      // the page, which is why we don't use something like `viewport.bottom - origin.y` and
      // `origin.y - viewport.top`.
      const smallestDistanceToViewportEdge =
        Math.min(viewport.bottom - origin.y + viewport.top, origin.y);

      const previousHeight = lastBoundingBoxSize.current.height;

      height = smallestDistanceToViewportEdge * 2;
      top = origin.y - smallestDistanceToViewportEdge;

      if (height > previousHeight && !isInitialRender.current && !config.growAfterOpen) {
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

    let width;
    let left;
    let right;

    if (isBoundedByLeftViewportEdge) {
      right = viewport.width - origin.x + config.viewportMargin;
      width = origin.x - config.viewportMargin;
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
      const previousWidth = lastBoundingBoxSize.current.width;

      width = smallestDistanceToViewportEdge * 2;
      left = origin.x - smallestDistanceToViewportEdge;

      if (width > previousWidth && !isInitialRender.current && !config.growAfterOpen) {
        left = origin.x - (previousWidth / 2);
      }
    }

    return { top, left, bottom, right, width, height };
  }, [
    state.dir,
    config.viewportMargin,
    config.growAfterOpen,
  ]);

  /**
   * Gets the exact left/right for the overlay when not using flexible sizing or when pushing
   * @type {function(position: ConnectedPosition,
   * originPoint: Point, scrollPosition: ViewportScrollPosition): { left: ?number, right: ?number }}
   */
  const getExactOverlayX = React.useCallback((position, originPoint, scrollPosition) => {
    // Reset any existing styles. This is necessary in case the preferred position has
    // changed since the last `apply`.
    const styles = { left: null, right: null };
    let overlayPoint = getOverlayPoint(originPoint, overlayRect.current, position);

    if (isPushed.current) {
      overlayPoint = pushOverlayOnScreen(overlayPoint, overlayRect.current, scrollPosition);
    }

    // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
    // or "after" the origin, which determines the direction in which the element will expand.
    // For the horizontal axis, the meaning of "before" and "after" change based on whether the
    // page is in RTL or LTR.
    let horizontalStyleProperty;

    if (state.dir === 'rtl') {
      horizontalStyleProperty = position.overlayX === 'end' ? 'left' : 'right';
    } else {
      horizontalStyleProperty = position.overlayX === 'end' ? 'right' : 'left';
    }

    // When we're setting `right`, we adjust the x position such that it is the distance
    // from the right edge of the viewport rather than the left edge.
    if (horizontalStyleProperty === 'right') {
      const documentWidth = document.documentElement.clientWidth;
      styles.right = documentWidth - (overlayPoint.x + overlayRect.current.width);
    } else {
      styles.left = overlayPoint.x;
    }

    return styles;
  }, [
    getOriginRect,
    state.pane,
    state.dir,
    config.scrollables,
    getOverlayPoint,
    pushOverlayOnScreen,
  ]);

  /**
   * Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing
   * @type {function(position: ConnectedPosition, originPoint: Point,
   * scrollPosition: ViewportScrollPosition): { top: ?number, bottom: ?number }}
   */
  const getExactOverlayY = React.useCallback((position, originPoint, scrollPosition) => {
    // Reset any existing styles. This is necessary in case the
    // preferred position has changed since the last `apply`.
    let styles = { top: null, bottom: null };
    let overlayPoint = getOverlayPoint(originPoint, overlayRect.current, position);

    if (isPushed.current) {
      overlayPoint = pushOverlayOnScreen(overlayPoint, overlayRect.current, scrollPosition);
    }

    // Todo: add overlay container to shared overlay state
    const overlayContainer = document.querySelector('[data-sui-overlay-root]');

    let virtualKeyboardOffset = overlayContainer.getBoundingClientRect().top;

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
      styles.bottom = documentHeight - (overlayPoint.y + overlayRect.current.height);
    } else {
      styles.top = overlayPoint.y;
    }

    return styles;
  }, [
    getOverlayPoint,
    pushOverlayOnScreen,
  ]);

  /**
   * Sets positioning styles to the overlay element.
   * @type {Function}
   */
  const resetPaneStyles = React.useCallback(() => {
    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: {
        top: '',
        left: '',
        bottom: '',
        right: '',
        position: '',
        transform: '',
      },
    });
  }, []);

  /**
   * Sets positioning styles to the overlay element.
   * @type {function(originPoint: Point, position: ConnectedPosition): void}
   */
  const setPaneStyles = React.useCallback((originPoint, position) => {
    let styles = {};
    const __hasExactPosition = hasExactPosition();
    const hasFlexibleDimensions = config.hasFlexibleDimensions;

    if (__hasExactPosition) {
      const scrollPosition = vr.getViewportScrollPosition();
      styles = {
        ...styles,
        ...getExactOverlayX(position, originPoint, scrollPosition),
        ...getExactOverlayY(position, originPoint, scrollPosition),
      };
    } else {
      styles.position = 'static';
    }

    // Use a transform to apply the offsets. We do this because the `center` positions rely on
    // being in the normal flex flow and setting a `top` / `left` at all will completely throw
    // off the position. We also can't use margins, because they won't have an effect in some
    // cases where the element doesn't have anything to "push off of". Finally, this works
    // better both with flexible and non-flexible positioning.
    let transformString = '';
    let offsetX = getOffset(position, 'x');
    let offsetY = getOffset(position, 'y');

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
    // Note that this doesn't apply when we have an exact position, in which case we do want to
    // apply them because they'll be cleared from the bounding box.
    if (config.maxHeight) {
      if (__hasExactPosition) {
        styles.maxHeight = config.maxHeight;
      } else if (hasFlexibleDimensions) {
        styles.maxHeight = '';
      }
    }

    if (config.maxWidth) {
      if (__hasExactPosition) {
        styles.maxWidth = config.maxWidth;
      } else if (hasFlexibleDimensions) {
        styles.maxWidth = '';
      }
    }

    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: styles,
    });
  }, [
    config.maxHeight,
    config.maxWidth,
    vr.getViewportScrollPosition,
    config.hasFlexibleDimensions,
    hasExactPosition,
    getExactOverlayX,
    getExactOverlayY,
    getOffset,
  ]);

  /**
   * Sets positioning styles to the overlay element.
   * @type {Function}
   */
  const resetHostStyles = React.useCallback(() => {
    dispatch({
      type: OverlayActions.ADD_HOST_STYLES,
      data: {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        height: '',
        width: '',
        alignItems: '',
        justifyContent: '',
      },
    });
  }, []);

  /**
   * Sets positioning styles to the overlay element.
   * @type {function(origin: Point, position: ConnectedPosition): void}
   */
  const setHostStyles = React.useCallback((origin, position) => {
    const boundingBoxRect = calculateBoundingBoxRect(origin, position);

    // It's weird if the overlay *grows* while scrolling, so we take the last size into account
    // when applying a new size.
    if (!isInitialRender.current && !config.growAfterOpen) {
      boundingBoxRect.height = Math.min(boundingBoxRect.height, lastBoundingBoxSize.current.height);
      boundingBoxRect.width = Math.min(boundingBoxRect.width, lastBoundingBoxSize.current.width);
    }

    const styles = {};

    if (hasExactPosition()) {
      styles.top = styles.left = '0';
      styles.bottom = styles.right = styles.maxHeight = styles.maxWidth = '';
      styles.width = styles.height = '100%';
    } else {
      const maxHeight = config.maxHeight;
      const maxWidth = config.maxWidth;

      styles.height = boundingBoxRect.height;
      styles.top = boundingBoxRect.top;
      styles.bottom = boundingBoxRect.bottom;
      styles.width = boundingBoxRect.width;
      styles.left = boundingBoxRect.left;
      styles.right = boundingBoxRect.right;

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
        styles.maxHeight = maxHeight;
      }

      if (maxWidth) {
        styles.maxWidth = maxWidth;
      }
    }

    lastBoundingBoxSize.current = boundingBoxRect;

    dispatch({
      type: OverlayActions.ADD_HOST_STYLES,
      data: styles,
    });
  }, [
    calculateBoundingBoxRect,
    config.growAfterOpen,
    hasExactPosition,
    config.maxHeight,
    config.maxWidth,
  ]);

  /**
   * Sets the transform origin based on the configured selector and the passed-in position
   * @type {function(position: ConnectedPosition): void}
   */
  const setTransformOrigin = React.useCallback((position) => {
    if (!config.enableTransformOrigin) return;

    let xOrigin;
    let yOrigin = position.overlayY;

    if (position.overlayX === 'center') {
      xOrigin = 'center';
    } else if (state.dir === 'rtl') {
      xOrigin = position.overlayX === 'start' ? 'right' : 'left';
    } else {
      xOrigin = position.overlayX === 'start' ? 'left' : 'right';
    }

    dispatch({
      type: OverlayActions.SET_TRANSFORM_ORIGIN,
      data: `${xOrigin} ${yOrigin}`,
    });
  }, [
    state.dir,
    config.enableTransformOrigin,
  ]);

  /**
   * Add attributes that are associated with a given position.
   * @type {function(attributes: Object): void}
   */
  const addPaneAttributes = React.useCallback((attributes) => {
    dispatch({
      type: OverlayActions.ADD_PANE_ATTRIBUTES,
      data: attributes,
    });

    // Cache the keys so we know which ones to remove when we detach the panel or apply
    // a different position.
    Object.keys(attributes).forEach((key) => {
      currentPaneAttributes.current.push(key);
    });
  }, []);

  /**
   * Add attributes that are associated with a given position.
   * @type {Function}
   */
  const clearPaneAttributes = React.useCallback(() => {
    dispatch({
      type: OverlayActions.REMOVE_PANE_ATTRIBUTES,
      data: currentPaneAttributes.current,
    });

    currentPaneAttributes.current = [];
  }, []);

  /**
   * Applies a computed position to the overlay and emits a position change.
   * @type {function(position: ConnectedPosition, originPoint: Point): void}
   */
  const applyPosition = React.useCallback((position, originPoint) => {
    setTransformOrigin(position);
    setPaneStyles(originPoint, position);
    setHostStyles(originPoint, position);

    if (position.paneAttributes) {
      addPaneAttributes(position.paneAttributes);
    }

    lastPosition.current = position;

    // Notify that the position has been changed along with its change properties.
    // We only emit if we've got any subscriptions, because the scroll visibility
    // calculations can be somewhat expensive.
    if (config.onPositionChange) {
      const scrollableViewProperties = getScrollVisibility();
      config.onPositionChange({
        scrollableViewProperties,
        connectionPair: position,
      });
    }

    isInitialRender.current = false;
  }, [
    addPaneAttributes,
    getScrollVisibility,
    config.onPositionChange,
    setTransformOrigin,
    setPaneStyles,
    setHostStyles,
  ]);

  /**
   * Whether the overlay can fit within the viewport when it may resize either its width or height.
   * @type {function(fit: OverlayFit, point: Point, viewport: ClientRect): boolean}
   */
  const canFitWithFlexibleDimensions = React.useCallback((fit, point, viewport) => {
    if (config.hasFlexibleDimensions) {
      const availableHeight = viewport.bottom - point.y;
      const availableWidth = viewport.right - point.x;
      const minHeight = state.minHeight;
      const minWidth = state.minWidth;

      const verticalFit = fit.fitsInViewportVertically ||
        (minHeight != null && minHeight <= availableHeight);
      const horizontalFit = fit.fitsInViewportHorizontally ||
        (minWidth != null && minWidth <= availableWidth);

      return verticalFit && horizontalFit;
    }

    return false;
  }, [
    config.hasFlexibleDimensions,
    state.minHeight,
    state.minWidth,
  ]);

  /**
   * This re-aligns the overlay element with the trigger in its last calculated position,
   * even if a position higher in the "preferred positions" list would now fit. This
   * allows one to re-align the panel without changing the orientation of the panel.
   * @type {Function}
   */
  const reapplyLastPosition = React.useCallback(() => {
    // Noop function that can be used in tests
    utils.noop();

    if (!isDisposed.current && is('browser')) {
      const originRect = getOriginRect();
      overlayRect.current = state.pane.getBoundingClientRect();
      viewportRect.current = getNarrowedViewportRect();

      const __lastPosition = lastPosition.current || config.preferredPositions[0];
      const originPoint = getOriginPoint(originRect, __lastPosition);
      applyPosition(__lastPosition, originPoint);
    }
  }, [
    applyPosition,
    getOriginPoint,
    config.preferredPositions,
    getNarrowedViewportRect,
    getOriginRect,
    state.pane,
  ]);

  /**
   * Cleanup position strategy
   * @type {Function}
   */
  const detach = React.useCallback(() => {
    if (isDisposed.current) return;
    clearPaneAttributes();
    lastPosition.current = null;
    previousPushAmount.current = null;
    invoke(removeResizeListener, 'current');

    if (state.host) {
      dispatch({
        type: OverlayActions.ADD_HOST_STYLES,
        data: {
          top: '',
          left: '',
          right: '',
          bottom: '',
          height: '',
          width: '',
          alignItems: '',
          justifyContent: '',
        },
      });
    }

    if (state.pane) {
      resetPaneStyles();
    }

    dispatch({
      type: OverlayActions.ADD_HOST_ATTRIBUTES,
      data: { 'data-connected-position-bounding-box': null },
    });

    isDisposed.current = true;
  }, [
    resetPaneStyles,
    state.pane,
    state.host,
    clearPaneAttributes,
  ]);

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
   *  @type {Function}
   */
  const apply = React.useCallback(() => {
    // We shouldn't do anything if the strategy was disposed or we're on the server.
    if (isDisposed.current || !is('browser') || !state.attached) {
      return;
    }

    // If the position has been applied already (e.g. when the overlay was opened) and the
    // consumer opted into locking in the position, re-use the old position, in order to
    // prevent the overlay from jumping around.
    if (!isInitialRender.current && config.positionLocked && lastPosition.current) {
      reapplyLastPosition();
      return;
    }

    clearPaneAttributes();
    resetPaneStyles();
    resetHostStyles();

    // We need the bounding rects for the origin and the overlay to determine how to position
    // the overlay relative to the origin.
    // We use the viewport rect to determine whether a position would go off-screen.
    viewportRect.current = getNarrowedViewportRect();
    const originRect = getOriginRect();
    overlayRect.current = state.pane.getBoundingClientRect();

    const __overlayRect = overlayRect.current;

    /**
     * Positions where the overlay will fit with flexible dimensions.
     * @type {FlexibleFit[]}
     */
    const flexibleFits = [];

    // Fallback if none of the preferred positions fit within the viewport.
    let fallback;

    // Go through each of the preferred positions looking for a good fit.
    // If a good fit is found, it will be applied immediately.
    for (let pos of config.preferredPositions) {
      // Get the exact (x, y) coordinate for the point-of-origin on the origin element.
      let originPoint = getOriginPoint(originRect, pos);

      // From that point-of-origin, get the exact (x, y) coordinate for the top-left corner of the
      // overlay in this position. We use the top-left corner for calculations and later translate
      // this into an appropriate (top, left, bottom, right) style.
      let overlayPoint = getOverlayPoint(originPoint, __overlayRect, pos);

      // Calculate how well the overlay would fit into the viewport with this point.
      let overlayFit = getOverlayFit(overlayPoint, __overlayRect, viewportRect.current, pos);

      // If the overlay, without any further work, fits into the viewport, use this position.
      if (overlayFit.isCompletelyWithinViewport) {
        isPushed.current = false;
        applyPosition(pos, originPoint);
        return;
      }

      // If the overlay has flexible dimensions, we can use this position
      // so long as there's enough space for the minimum dimensions.
      if (canFitWithFlexibleDimensions(overlayFit, overlayPoint, viewportRect.current)) {
        // Save positions where the overlay will fit with flexible dimensions. We will use these
        // if none of the positions fit *without* flexible dimensions.
        flexibleFits.push({
          position: pos,
          origin: originPoint,
          overlayRect: __overlayRect,
          boundingBoxRect: calculateBoundingBoxRect(originPoint, pos)
        });

        continue;
      }

      // If the current preferred position does not fit on the screen, remember the position
      // if it has more visible area on-screen than we've seen and move onto the next preferred
      // position.
      if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
        fallback = {
          overlayFit, overlayPoint, originPoint, position: pos, overlayRect: __overlayRect,
        };
      }
    }

    // If there are any positions where the overlay would fit with flexible dimensions, choose the
    // one that has the greatest area available modified by the position's weight
    if (flexibleFits.length) {
      /** @type {null | FlexibleFit} */
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

      isPushed.current = false;
      applyPosition(bestFit.position, bestFit.origin);
      return;
    }

    // When none of the preferred positions fit within the viewport, take the position
    // that went off-screen the least and attempt to push it on-screen.
    if (config.canPush) {
      // TODO(jelbourn): after pushing, the opening "direction" of the overlay might not make sense.
      isPushed.current = true;
      applyPosition(fallback.position, fallback.originPoint);
      return;
    }

    // All options for getting the overlay within the viewport have been exhausted, so go with the
    // position that went off-screen the least.
    applyPosition(fallback.position, fallback.originPoint);
  }, [
    config.canPush,
    calculateBoundingBoxRect,
    canFitWithFlexibleDimensions,
    getOverlayFit,
    getOverlayPoint,
    getOriginPoint,
    config.preferredPositions,
    state.pane,
    getOriginRect,
    getNarrowedViewportRect,
    resetHostStyles,
    resetPaneStyles,
    applyPosition,
    reapplyLastPosition,
    config.positionLocked,
    clearPaneAttributes,
    state.attached,
  ]);

  const attach = React.useCallback(() => {
    dispatch({
      type: OverlayActions.ADD_HOST_ATTRIBUTES,
      data: { 'data-connected-position-bounding-box': true },
    });

    isDisposed.current = false;
    isInitialRender.current = true;
    lastPosition.current = null;

    invoke(removeResizeListener, 'current');
    removeResizeListener.current = vr.addChangeListener(() => {
      isInitialRender.current = true;
      apply();
    });
  }, [vr.addChangeListener, apply]);

  React.useEffect(() => {
    dispatch({
      type: OverlayActions.UPDATE_POSITION_STRATEGY_CALLBACKS,
      data: { apply, reapplyLastPosition },
    });
  }, [apply, reapplyLastPosition]);

  React.useEffect(() => {
    if (config.preferredPositions.indexOf(lastPosition.current) === -1) {
      lastPosition.current = null;
    }
  }, [config.preferredPositions]);

  return React.useMemo(() => ({
    attach,
    detach,
    apply,
  }), [attach, detach, apply]);
}

export default useFlexibleConnectedPositionStrategy;
