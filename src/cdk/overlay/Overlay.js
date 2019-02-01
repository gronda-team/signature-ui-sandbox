import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OverlayBackdrop, OverlayPaneRoot } from './styles/index';
import {
  OverlayContainerDefaultProps, OverlayContainerPropTypes,
  withOverlayContainerConsumer,
} from './context/overlay-container';
import {
  KeyboardDispatcherDefaultProps, KeyboardDispatcherPropTypes,
  withKeyboardDispatcher,
} from './keyboard/context';
import { stack } from '../../lib/core/components/util';

class Overlay extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      renderDummyOverlay: true,
      renderDummyBackdrop: true,
      previousHostParent: null,
      host: null,
      pane: null,
      backdrop: null,
      created: false,
      attached: false,
      /** emits when the backdrop has been clicked */
      // For autocomplete, it must be part of the state rather than via props
      onBackdropClick: _.noop,
    };
    
    this.OVERLAY_ID = _.uniqueId('sui-overlay:');
  }
  
  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps) {
    if (!_.isEqual(_.pick(prevProps, PROP_CSS_FIELDS), _.pick(this.props, PROP_CSS_FIELDS))) {
      updateElementSize.call(this.props);
    }
  }
  
  componentWillUnmount() {
    this.dispose();
  }
  
  /**
   * Refs
   */
  getDummyOverlay = (overlay) => {
    if (overlay) {
      this.PANE = overlay;
      /*
      We only want to steal the styled-components class names
      from the dummy container. Its rendering is inconsequential
      to the final overlay.
       */
      this.setState({ renderDummyOverlay: false });
    }
  };
  
  getDummyBackdrop = (backdrop) => {
    if (backdrop) {
      this.BACKDROP = backdrop;
      this.setState({ renderDummyBackdrop: false });
    }
  };
  
  /**
   * Actions
   */
  /** Create an overlay */
  create = () => {
    const host = createHostElement.call(this);
    const pane = createPaneElement.call(this, host);
    this.setState({
      host,
      pane,
      created: true,
    });
  };
  
  /** Attaches content to the overlay + creates backdrop */
  attach = () => {
    // Update the pane element with the given configuration.
    if (!this.state.host.parentElement && this.state.previousHostParent) {
      this.state.previousHostParent.appendChild(this.state.host);
    }
    
    updateStackingOrder.call(this);
    updateElementSize.call(this);
    // updateElementDirection.call(this);
    
    if (this.props.scrollStrategy) {
      this.props.scrollStrategy.enable();
    }
  
    // Enable pointer events for the overlay pane element.
    togglePointerEvents.call(this, true);
    
    if (this.props.backdrop) {
      attachBackdrop.call(this);
    }
    
    this.setState({ attached: true }, () => {
      this.updatePosition();
      Object.assign(
        this.state.pane.style,
        { display: 'block' },
      );

      this.props.__keyboardDispatcher.add({
        id: this.OVERLAY_ID,
        callback: _.isFunction(this.props.onKeyDown) ? this.props.onKeyDown : null,
      });
    });
  };
  
  /** Detaches an overlay from a portal. */
  detach = () => {
    if (!this.state.attached) return;
    
    detachBackdrop.call(this);
    /*
    When the overlay is detached, the pane element should disable pointer events.
    This is necessary because otherwise the pane element will cover the page and
    disable pointer events therefore. Depends on the position strategy and the
    applied pane boundaries.
    */
    togglePointerEvents.call(this, false);
    
    if (this.props.positionStrategy) {
      this.props.positionStrategy.detach();
    }
    
    if (this.props.scrollStrategy) {
      this.props.scrollStrategy.disable();
    }
    
    this.setState({
      attached: false,
    }, () => {
      Object.assign(
        this.state.pane.style,
        { display: 'none' },
      );
      this.props.__keyboardDispatcher.remove(this.OVERLAY_ID);
      detachContent.call(this);
    });
  };
  
  /** Cleans up the overlay and associated document listeners from the DOM. */
  dispose = () => {
    if (this.props.positionStrategy) {
      this.props.positionStrategy.dispose();
    }
    
    if (this.props.scrollStrategy) {
      this.props.scrollStrategy.disable();
    }

    if (_.has(this.state, 'host.parentNode')) {
      this.state.host.parentNode.removeChild(this.state.host);
    }
    
    this.setState({ attached: false, previousHostParent: null });
  };
  
  /*
  Updates position of overlay based on position strategy
   */
  updatePosition = () => {
    _.invoke(this.props.positionStrategy, 'apply');
  };
  
  /** Update the size properties of the overlay. */
  updateSize = () => {
    updateElementSize.call(this, this.props);
  };

  /** Has a non-binding event callback for the backdrop */
  onBackdropClick = (event) => {
    // That way, we don't have to update addEventListener or anything
    // if we change the event listener
    this.state.onBackdropClick(event);
  };
  
  render() {
    if (!this.state.attached) return null;
    const host = this.state.pane;
    return (
      <React.Fragment>
        { this.state.renderDummyOverlay ?
          /*
          we must get the styled-components classes
          from a dummy PaneRoot
           */
          <OverlayPaneRoot innerRef={this.getDummyOverlay} /> : null
        }
        { this.state.renderDummyBackdrop ?
          <OverlayBackdrop innerRef={this.getDummyBackdrop} /> : null
        }
        { ReactDOM.createPortal(this.props.children, host) }
      </React.Fragment>
    )
  }
}

const PROP_CSS_FIELDS = [
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
];

const OverlayPropTypes = {
  /** Custom styles to add to overlay pane */
  style: PropTypes.object,
  /** Whether the overlay has a backdrop. */
  backdrop: PropTypes.oneOf(['transparent', 'dark', 'light']),
  /** The width of the overlay panel. If a number is provided, pixel units are assumed. */
  width: PropTypes.number,
  /** The height of the overlay panel. If a number is provided, pixel units are assumed. */
  height: PropTypes.number,
  /** The min-width of the overlay panel. If a number is provided, pixel units are assumed. */
  minWidth: PropTypes.number,
  /** The min-height of the overlay panel. If a number is provided, pixel units are assumed. */
  minHeight: PropTypes.number,
  /** The max-width of the overlay panel. If a number is provided, pixel units are assumed. */
  maxWidth: PropTypes.number,
  /** The max-height of the overlay panel. If a number is provided, pixel units are assumed. */
  maxHeight: PropTypes.number,
  /**
   * Direction of the text in the overlay panel. If a `Directionality` instance
   * is passed in, the overlay will handle changes to its value automatically.
   */
  direction: PropTypes.oneOf(['ltr', 'rtl']),
  /**
   * Whether the overlay should be disposed of when the user goes backwards/forwards in history.
   * Note that this usually doesn't include clicking on links (unless the user is using
   * the `HashLocationStrategy`).
   */
  disposeOnNavigation: PropTypes.bool,
  /** Key down events targeted to this overlay */
  onKeyDown: PropTypes.func,
  /** Strategy with which to position the overlay. */
  positionStrategy: PropTypes.shape({
    enable: PropTypes.func,
    disable: PropTypes.func,
  }),
  /** Strategy to be used when handling scroll events while the overlay is open. */
  scrollStrategy: PropTypes.shape({
    enable: PropTypes.func,
    disable: PropTypes.func,
  }),
};

const OverlayDefaultProps = {
  style: {},
  backdrop: null,
  width: null,
  height: null,
  minWidth: null,
  minHeight: null,
  maxWidth: null,
  maxHeight: null,
  direction: 'ltr',
  disposeOnNavigation: false,
  onBackdropClick: _.noop,
  /*
  must be null instead of _.noop so we don't invoke
  the keyboard dispatcher
   */
  onKeyDown: null,
};

Overlay.propTypes = {
  ...OverlayPropTypes,
  __overlayContainer: OverlayContainerPropTypes,
  __keyboardDispatcher: KeyboardDispatcherPropTypes,
};

Overlay.defaultProps = {
  ...OverlayDefaultProps,
  __overlayContainer: OverlayContainerDefaultProps,
  __keyboardDispatcher: KeyboardDispatcherDefaultProps,
};

const StackedOverlay = stack(
  withKeyboardDispatcher,
  withOverlayContainerConsumer,
)(Overlay);

StackedOverlay.propTypes = OverlayPropTypes;
StackedOverlay.defaultProps = OverlayDefaultProps;

export default StackedOverlay;

/**
 * Private methods
 */
/*
Creates the host element that wraps around an overlay
and can be used for advanced positioning.
 */
function createHostElement() {
  const host = document.createElement('div');
  this.props.__overlayContainer.getContainer().appendChild(host);
  return host;
}

/*
Creates the DOM element for an overlay and appends it to the overlay container.
 */
function createPaneElement(host) {
  const pane = document.createElement('div');
  pane.id = _.uniqueId('sui-overlay-pane:');
  if (this.PANE) {
    const classNames = Array.from(this.PANE.classList);
    classNames.forEach((className) => {
      pane.classList.add(className);
    });
    
    host.appendChild(pane);
  }
  pane.style.display = 'none';
  return pane;
}

/*
Attaches a backdrop for this overlay.

This must be separate from what's rendered because this must
be placed directly as a child of the host.
*/
function attachBackdrop() {
  const backdrop = document.createElement('div');
  if (this.BACKDROP) {
    const classNames = Array.from(this.BACKDROP.classList);
    classNames.forEach((className) => {
      backdrop.classList.add(className);
    });
    
    backdrop.dataset.shade = this.props.backdrop;
  
    /*
    Insert the backdrop before the pane in the DOM order, in order to handle stacked overlays properly.
     */
    if (this.state.host) {
      const host = this.state.host;
      host.parentElement.insertBefore(backdrop, host);
    }
    
    backdrop.addEventListener('click', this.onBackdropClick);
    
    _.defer(() => {
      // animate the appearance
      backdrop.dataset.visible = true;
    });
    
    this.setState({ backdrop });
  }
}

/** Detaches the backdrop (if any) associated with the overlay. */
function detachBackdrop() {
  const backdrop = this.state.backdrop;
  if (!backdrop) return;
  
  let timeoutId = null;
  const finishDetach = () => {
    // remove backdrop
    backdrop.parentNode.removeChild(backdrop);
  
    backdrop.dataset.shade = undefined; // toggle it off
    this.setState({ backdrop: null }, () => {
      window.clearTimeout(timeoutId);
    });
  };
  
  backdrop.dataset.visible = false;
  backdrop.addEventListener('transitionend', finishDetach);
  /*
  If the backdrop doesn't have a transition, the `transitionend` event won't fire.
  In this case we make it unclickable and we try to remove it after a delay.
   */
  backdrop.style.pointerEvents = 'none';
  timeoutId = window.setTimeout(finishDetach, 500);
}

/** Updates the size of the overlay element based on the overlay config. */
function updateElementSize(props = this.props) {
  const style = this.state.pane.style;
  
  Object.assign(
    this.state.pane.style,
    style,
    PROP_CSS_FIELDS.reduce((s, key) => {
      const value = _.get(props, key);
      if (!_.isNil(value)) {
        s[key] = `${value}px`;
      }
      return s;
    }, {}),
  );
}

/** Toggles the pointer events for the overlay pane element. */
function togglePointerEvents(enable = false) {
  this.state.pane.style.pointerEvents = enable ?
    'auto' : 'none';
}

/**
 * Updates the stacking order of the element, moving it to the top if necessary.
 * This is required in cases where one overlay was detached, while another one,
 * that should be behind it, was destroyed. The next time both of them are opened,
 * the stacking will be wrong, because the detached element's pane will still be
 * in its original DOM position.
 */
function updateStackingOrder() {
  if (this.state.host.nextSibling) {
    this.state.host.parentNode.appendChild(this.state.host);
  }
}

/** Detaches the overlay content */
function detachContent() {
  if (_.has(this.state, 'host.parentElement')) {
    this.setState({
      previousHostParent: this.state.host.parentElement,
    }, () => {
      this.state.previousHostParent.removeChild(this.state.host);
    });
  }
}
