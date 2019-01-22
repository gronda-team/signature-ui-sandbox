import * as React from 'react';
import { HORIZONTAL_BIN, VERTICAL_BIN } from '../../portal/prop-types';

const NOOP_OVERLAY_STATE = {
  top: '',
  left: '',
  bottom: '',
  right: '',
  position: '',
};

const NOOP_BOUNDING_STATE = {
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  height: '',
  width: '',
  alignItems: '',
  justifyContent: '',
};

export default class FlexiblePositionStrategy extends React.Component {
  constructor() {
    super();
    this.state = {
      overlayStyle: NOOP_OVERLAY_STATE,
      boundingBoxStyle: NOOP_BOUNDING_STATE,
      isPushed: false,
    };
  }
  
  /*
  Derived data
   */
  getOriginRect = () => {
    if (!this.props.origin.getBoundingClientRect) return null;
    return this.props.origin.getBoundingClientRect();
  };
  
  getOverlayRect = () => {
    if (!this.props.pane.getBoundingClientRect) return null;
    return this.props.pane.getBoundingClientRect();
  };
  
  apply = () => {
    this.resetOverlayElementStyles();
    this.resetBoundingBoxStyles();
    
    const originRect = this.getOriginRect();
    const overlayRect = this.getOverlayRect();
    const viewportRect = this.getBoundedViewportRect();
    
    this.setState({
      viewportRect, originRect, overlayRect,
    }, () => {
      let fallback;
      const flexibleFits = [];
      
      for (let pos of this.props.preferredPositions) {
        let originPoint = this.getOriginPoint(originRect, pos);
        let overlayPoint = this.getOverlayPoint(originPoint, originRect, pos);
        let overlayFit = this.getOverlayFit(overlayPoint, overlayRect, viewportRect, pos);
        
        if (overlayFit.isCompletelyWithinViewport) {
          this.setState({ isPushed: false });
          this.applyPosition(pos, originPoint);
          return;
        }
      }
    });
  };
  
  applyPosition = (position, originPoint) => {
    // this._setTransformOrigin(position);
    this.setOverlayElementsStyle(originPoint, position);
    this._setBoundingBoxStyles(originPoint, position);
  
    // Save the last connected position in case the position needs to be re-calculated.
    this._lastPosition = position;
  };
  
  getOriginPoint = (rect, position) => {
    let x;
    if (position.originX === 'center') {
      x = rect.left + (rect.width / 2);
    } else {
      const startX = rect.right;
      const endX = rect.left;
      x = position.originX === 'start' ? startX : endX;
    }
    
    let y;
    if (position.originY === 'center') {
      y = rect.top + (rect.height / 2);
    } else {
      y = position.originY === 'top' ? rect.top : rect.bottom;
    }
    
    return { x, y };
  };
  
  getOverlayPoint = (origin, rect, position) => {
    // Calculate the (overlayStartX, overlayStartY), the start of the
    // potential overlay position relative to the origin point.
    let overlayStartX;
    if (position.overlayX === 'center') {
      overlayStartX = -rect.width / 2;
    } else if (position.overlayX === 'start') {
      overlayStartX = 0;
    } else {
      overlayStartX = -rect.width;
    }
  
    let overlayStartY: number;
    if (position.overlayY === 'center') {
      overlayStartY = -rect.height / 2;
    } else {
      overlayStartY = position.overlayY === 'top' ? 0 : -rect.height;
    }
  
    // The (x, y) coordinates of the overlay.
    return {
      x: origin.x + overlayStartX,
      y: origin.y + overlayStartY,
    };
  };
  
  getOverlayFit = (point, overlay, viewport, position) => {
    let { x, y } = point;
    let offsetX = this.getOffset(position, 'x');
    let offsetY = this.getOffset(position, 'y');
  
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
    let visibleWidth = this.subtractOverflows(overlay.width, leftOverflow, rightOverflow);
    let visibleHeight = this.subtractOverflows(overlay.height, topOverflow, bottomOverflow);
    let visibleArea = visibleWidth * visibleHeight;
  
    return {
      visibleArea,
      isCompletelyWithinViewport: (overlay.width * overlay.height) === visibleArea,
      fitsInViewportVertically: visibleHeight === overlay.height,
      fitsInViewportHorizontally: visibleWidth === overlay.width,
    };
  };
  
  getOffset = (position, axis) => {
    if (axis === 'x') {
      // We don't do something like `position['offset' + axis]` in
      // order to avoid breking minifiers that rename properties.
      return position.offsetX === null ? this.props.offsetX : position.offsetX;
    }
  
    return position.offsetY === null ? this.props.offsetY : position.offsetY;
  };
  
  subtractOverflows = (length, ...overflows) => {
    return overflows.reduce((currentValue, currentOverflow) => {
      return currentValue - Math.max(currentOverflow, 0);
    }, length);
  };
  
  resetOverlayElementStyles = () => {
    this.setState({ overlayStyle: NOOP_BOUNDING_STATE });
  };
  
  resetBoundingBoxStyles = () => {
    this.setState({ overlayStyle: NOOP_BOUNDING_STATE });
  };
  
  getViewportScrollPosition = () => {
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
  
    return {top, left};
  };
  
  getBoundedViewportRect = () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const scrollPosition = this.getViewportScrollPosition();
  
    return {
      top:    scrollPosition.top + this.props.margin,
      left:   scrollPosition.left + this.props.margin,
      right:  scrollPosition.left + width - this.props.margin,
      bottom: scrollPosition.top + height - this.props.margin,
      width:  width  - (2 * this.props.margin),
      height: height - (2 * this.props.margin),
    };
  };
  
  /** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
  getExactOverlayX = (position, originPoint) => {
    // Reset any existing styles. This is necessary in case the
    // preferred position has changed since the last `apply`.
    let styles = {top: null, bottom: null};
    let overlayPoint = this.getOverlayPoint(originPoint, this.getOverlayRect(), position);
  
    if (this.state.isPushed) {
      overlayPoint = this.pushOverlayOnScreen(overlayPoint, this._overlayRect);
    }
  
    // @breaking-change 7.0.0 Currently the `_overlayContainer` is optional in order to avoid a
    // breaking change. The null check here can be removed once the `_overlayContainer` becomes
    // a required parameter.
    let virtualKeyboardOffset = this._overlayContainer ?
      this._overlayContainer.getContainerElement().getBoundingClientRect().top : 0;
  
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
      const documentHeight = this._document.documentElement.clientHeight;
      styles.bottom = `${documentHeight - (overlayPoint.y + this._overlayRect.height)}px`;
    } else {
      styles.top = coerceCssPixelValue(overlayPoint.y);
    }
  
    return styles;
  };
  
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
  pushOverlayOnScreen = (start, overlay) => {};
  getExactOverlayY = (position, originPoint) => {};
  
  setOverlayElementsStyle = (originPoint, position) => {
    const styles = {} as CSSStyleDeclaration;
  
    if (this.hasExactPosition()) {
      extendStyles(styles, this._getExactOverlayY(position, originPoint));
      extendStyles(styles, this._getExactOverlayX(position, originPoint));
    } else {
      styles.position = 'static';
    }
  
    // Use a transform to apply the offsets. We do this because the `center` positions rely on
    // being in the normal flex flow and setting a `top` / `left` at all will completely throw
    // off the position. We also can't use margins, because they won't have an effect in some
    // cases where the element doesn't have anything to "push off of". Finally, this works
    // better both with flexible and non-flexible positioning.
    let transformString = '';
    let offsetX = this._getOffset(position, 'x');
    let offsetY = this._getOffset(position, 'y');
  
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
    if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxHeight) {
      styles.maxHeight = '';
    }
  
    if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxWidth) {
      styles.maxWidth = '';
    }
  
    extendStyles(this._pane.style, styles);
  };
  
  hasExactPosition = () => (
    !this.props.hasFlexibleDimensions || this.state.isPushed,
  );
  
  render() {
    return (
    
    )
  }
}

FlexiblePositionStrategy.propTypes = {
  margin: PropTypes.number,
  origin: PropTypes.node,
  pane: PropTypes.node,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  preferredPositions: PropTypes.arrayOf(
    PropTypes.shape({
      originX: HORIZONTAL_BIN,
      originY: VERTICAL_BIN,
      overlayX: HORIZONTAL_BIN,
      overlayY: VERTICAL_BIN,
    })
  ),
};

FlexiblePositionStrategy.defaultProps = {
  margin: 8,
  origin: null,
  pane: null,
  offsetX: 20,
  offsetY: 20,
  preferredPositions: [],
};
