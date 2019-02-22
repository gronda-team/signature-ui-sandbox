import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { GlobalOverlayWrapper } from './styles';

/**
 * This is a strategy for positioning overlays.
 *
 * Give overlays an explicit position relative to the viewport.
 * Use flexbox instead of transforms in order to avoid issues with
 * blurry rendering.
 */
class GlobalPositionStrategy extends React.Component {
  constructor() {
    super();

    this.state = {
      disposed: null,
      /** Whether we're showing the dummy to extract styles */
      renderDummyDiv: true,
    };

    this.POSITION_CLASS_LIST = [];
  }

  /**
   * Refs
   */
  getDummyPositionDiv = (el) => {
    if (el) {
      this.setState({ renderDummyDiv: false });
      this.POSITION_CLASS_LIST = _.toArray(el.classList);
    }
  };

  /**
   * Derived data
   */
  /** Get top position of the overlay */
  getTop = () => {
    if (this.props.bottomOffset) return '';
    return this.props.topOffset;
  };

  /** Get left position of the overlay */
  getLeft = () => {
    if (this.props.rightOffset) return '';
    return this.props.leftOffset;
  };

  /** Get bottom position */
  getBottom = () => {
    if (this.props.topOffset) return '';
    return this.props.bottomOffset;
  };

  /** Get right position */
  getRight = () => {
    if (this.props.leftOffset) return '';
    return this.props.rightOffset;
  };

  getAlignItems = () => {
    if (!(this.getTop() || this.getBottom())) return 'center';
    if (this.getBottom()) return 'flex-end';
    return 'flex-start';
  };

  getJustifyContent = () => {
    if (!(this.getLeft() || this.getRight())) return 'center';
    if (this.getRight()) return 'flex-end';
    return 'flex-start';
  };

  /**
   * Actions
   */
  /** Attach positioning strategy to associated overlay */
  attach = () => {
    const host = this.props.overlay.HOST;
    this.POSITION_CLASS_LIST.forEach((className) => {
      host.classList.add(className);
    });
  };

  /** Apply the positioning strategy */
  apply = () => {
    if (
      !this.props.overlay
      || _.get(this.props.overlay, 'state.attached')
    ) return;

    const overlay = this.props.overlay;
    const styles = overlay.PANE.style;
    const parentStyles = overlay.HOST.style;

    styles.position = 'static';
    styles.marginTop = overlay.props.height === '100%' ?
      '0' : this.getTop();
    styles.marginLeft = overlay.props.width === '100%' ?
      '0' : this.getLeft();
    styles.marginBottom = this.getBottom();
    styles.marginRight = this.getRight();

    const justifyContent = this.getJustifyContent();

    if (overlay.props.width === '100%') {
      parentStyles.justifyContent = 'flex-start';
    } else if (justifyContent === 'center') {
      parentStyles.justifyContent = 'center';
    } else if (overlay.props.direction === 'rtl') {
      // In RTL the browser will invert `flex-start` and `flex-end` automatically, but we
      // don't want that because our positioning is explicitly `left` and `right`, hence
      // why we do another inversion to ensure that the overlay stays in the same position.
      if (justifyContent === 'flex-start') {
        parentStyles.justifyContent = 'flex-end';
      } else if (justifyContent === 'flex-end') {
        parentStyles.justifyContent = 'flex-start';
      }
    } else {
      parentStyles.justifyContent = justifyContent;
    }

    parentStyles.alignItems = overlay.props.height === '100%' ?
      'flex-start' :
      this.getAlignItems();
  };

  /** Cleans up the style changes from the DOM */
  dispose = () => {
    if (this.state.disposed || !this.props.overlay) return;

    const styles = this.props.overlay.PANE.style;
    const parent = this.props.overlay.HOST;
    const parentStyles = parent.style;

    this.POSITION_CLASS_LIST.forEach((className) => {
      parent.classList.remove(className);
    });

    parentStyles.justifyContent = parentStyles.alignItems
      = styles.marginTop = styles.marginBottom = styles.marginLeft
      = styles.marginBottom = '';
    this.setState({ disposed: true });
  };

  /** Noop render */
  render = () => (
    this.state.renderDummyDiv ? (
      <GlobalOverlayWrapper
        style={{ display: 'none' }}
        innerRef={this.getDummyPositionDiv}
      />
    ) : null
  );
}

const GlobalPositionStrategyPropTypes = {
  /** The top offset relative to viewport */
  topOffset: PropTypes.string,
  /** The bottom offset relative to viewport */
  bottomOffset: PropTypes.string,
  /** The left offset relative to viewport */
  leftOffset: PropTypes.string,
  /** The right offset relative to viewport */
  rightOffset: PropTypes.string,
  /** Overlay */
  overlay: PropTypes.object,
};

const GlobalPositionStrategyDefaultProps = {
  topOffset: '',
  bottomOffset: '',
  leftOffset: '',
  rightOffset: '',
  overlay: null,
};

GlobalPositionStrategy.propTypes = {
  ...GlobalPositionStrategyPropTypes,
};

GlobalPositionStrategy.defaultProps = {
  ...GlobalPositionStrategyDefaultProps,
};

export default GlobalPositionStrategy;
