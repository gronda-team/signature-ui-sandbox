import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OverlayBackdrop, OverlayPaneRoot } from './styles/index';
import {
  OverlayContainerDefaultProps, OverlayContainerPropTypes,
  withOverlayContainerConsumer,
} from './context';
import {
  KeyboardDispatcherDefaultProps, KeyboardDispatcherPropTypes,
  withKeyboardDispatcher,
} from './keyboard/context/KeyboardDispatcherContext';
import { stack } from '../../lib/core/components/util';
import {PROP_TYPE_STRING_OR_NUMBER} from '../util';

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
    if (this.PANE && !_.isEqual(_.pick(prevProps, PROP_CSS_FIELDS), _.pick(this.props, PROP_CSS_FIELDS))) {
      updateElementSize.call(this, this.props);
    }

    /** Update keydown when it changes as a prop, in case it comes later after attaching */
    if (prevProps.onKeyDown !== this.props.onKeyDown) {
      updateOverlayKeyDown.call(this, this.props.onKeyDown);
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
      this.DUMMY_PANE = overlay;
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
      this.DUMMY_BACKDROP = backdrop;
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

    /**
     * Save the pane and host styles bound to this component
     * so that React won't throw an error when we try to update
     * host/pane style like this.state.host.style = ...
     */
    // References the same object, so it doesn't get cloned
    this.HOST = host;
    this.PANE = pane;
  };
  
  /** Attaches content to the overlay + creates backdrop */
  attach = () => {
    if (this.props.positionStrategy) {
      this.props.positionStrategy.attach();
    }

    // Update the pane element with the given configuration.
    if (!this.state.host.parentElement && this.state.previousHostParent) {
      this.state.previousHostParent.appendChild(this.state.host);
    }
    
    updateStackingOrder.call(this);
    updateElementSize.call(this);
    updateElementDirection.call(this);
    
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
        this.PANE.style,
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
    
    this.detachBackdrop();
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
        this.PANE.style,
        { display: 'none' },
      );
      this.props.__keyboardDispatcher.remove(this.OVERLAY_ID);
      detachContent.call(this);
    });
  };

  /**
   * Detaches the backdrop (if any) associated with the overlay.
   *
   * This is not a private method because the Dialog component
   * needs to manually manage the backdrop destruction
   * appropriately.
   */
  detachBackdrop = () => {
    const backdrop = this.state.backdrop;
    if (!backdrop) return;

    let timeoutId = null;
    const finishDetach = () => {
      // remove backdrop
      backdrop.parentNode.removeChild(backdrop);

      backdrop.dataset.shade = undefined; // toggle it off
      this.setState(state => {
        /**
         * If we open up the same overlay before the backdrop
         * can officially be disposed, we would still have the
         * older backdrop and won't be able to add a new one.
         *
         * This was found when tests were done where overlays
         * were closed and then reopened immediately before the
         * 500 ms (see below) could finish executing.
         */
        if (state.backdrop === backdrop) return { backdrop: null };
        return null;
      }, () => {
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
    if (!this.state.attached) return (
      <React.Fragment>
        { this.state.renderDummyOverlay ?
          /*
          we must get the styled-components classes
          from a dummy PaneRoot
           */
          <OverlayPaneRoot ref={this.getDummyOverlay} /> : null
        }
        { this.state.renderDummyBackdrop ?
          <OverlayBackdrop ref={this.getDummyBackdrop} /> : null
        }
      </React.Fragment>
    );
    const host = this.state.pane;
    return ReactDOM.createPortal(this.props.children, host);
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
  width: PROP_TYPE_STRING_OR_NUMBER,
  /** The height of the overlay panel. If a number is provided, pixel units are assumed. */
  height: PROP_TYPE_STRING_OR_NUMBER,
  /** The min-width of the overlay panel. If a number is provided, pixel units are assumed. */
  minWidth: PROP_TYPE_STRING_OR_NUMBER,
  /** The min-height of the overlay panel. If a number is provided, pixel units are assumed. */
  minHeight: PROP_TYPE_STRING_OR_NUMBER,
  /** The max-width of the overlay panel. If a number is provided, pixel units are assumed. */
  maxWidth: PROP_TYPE_STRING_OR_NUMBER,
  /** The max-height of the overlay panel. If a number is provided, pixel units are assumed. */
  maxHeight: PROP_TYPE_STRING_OR_NUMBER,
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
StackedOverlay.displayName = 'StackedOverlay';

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
  if (this.DUMMY_PANE) {
    const classNames = Array.from(this.DUMMY_PANE.classList);
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
  if (this.DUMMY_BACKDROP) {
    const classNames = Array.from(this.DUMMY_BACKDROP.classList);
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

/** Updates the text direction on the overlay panel host */
function updateElementDirection() {
  this.HOST.setAttribute('dir', this.props.dir);
}

/** Updates the size of the overlay element based on the overlay config. */
function updateElementSize(props = this.props) {
  Object.assign(
    this.PANE.style,
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
  this.PANE.style.pointerEvents = enable ?
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

/** Update the overlay keydown callback function */
function updateOverlayKeyDown(current) {
  this.props.__keyboardDispatcher.update({
    id: this.OVERLAY_ID,
    callback: current,
  });
}
