import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {PROP_TYPE_STRING_OR_NUMBER} from '../../cdk/util';
import {ESC, ESCAPE} from '../../cdk/keycodes/keys';
import {
  OverlayContainerDefaultProps,
  OverlayContainerPropTypes,
  BlockScrollStrategy,
  Overlay, withOverlayContainerConsumer,
} from '../../cdk/overlay';
import GlobalPositionStrategy from '../../cdk/overlay/position/GlobalPositionStrategy';
import DialogContainer from './DialogContainer';
import {
  DialogManagerDefaultProps,
  DialogManagerPropTypes,
  withDialogManager
} from './context/DialogManagerContext';
import {stack} from '../core/components/util';

/**
 * Dialog component that uses CDK Overlay behind the scenes.
 *
 * This dialog can manage its own instantiation/teardown, but is
 * also capable of opening child dialogs as well.
 */
class Dialog extends React.Component {
  constructor() {
    super();

    this.state = {
      /**
       * List of self-expiring actions that will be invoked
       * when the dialog animates.
       */
      animationChangeStateActions: [],
    };

    /** Refs, constants */
    this.DEFAULT_ID = _.uniqueId('sui-overlay:');
    this.overlay = React.createRef();
    this.container = React.createRef();
    this.scrollStrategy = React.createRef();
    this.positionStrategy = React.createRef();
  }

  componentDidMount() {
    this.setState({
      animationChangeStateActions: [{
        id: 'end-enter',
        callback: (event) => {
          if (!(event.phaseName === 'done' && event.toState === 'enter')) return;
          // Must only be invoked once
          this.emitOnOpen();
        },
      }, {
        id: 'end-exit',
        callback: (event) => {
          if (!(event.phaseName === 'done' && event.toState === 'exit')) return;
          // Invoke dispose only once
          this.disposeOverlay();
        },
      }],
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open) {
      if (this.props.open) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  /**
   * Derived data
   */
  /** Get the id; defaults to DEFAULT_ID */
  getId = () => this.props.id || this.DEFAULT_ID;

  /** Get a reference to the CDK Overlay */
  getOverlay = () => _.get(this.overlay, 'current', {});

  /** Get a reference to the Dialog container */
  getContainer = () => _.get(this.container, 'current', {});

  /**
   * Actions
   */
  /** Open the modal dialog */
  open = () => {
    const overlay = this.getOverlay();
    if (!overlay.state.created) {
      /** Create the overlay if it hasn't been created already */
      overlay.create();
    } else {
      overlay.updateSize();
    }

    /**
     * Wait until the next tick to attach the backdrop click
     * and other important stuff.
     */
    window.setTimeout(() => {
      if (!overlay.state.attached) {
        /** Attach overlay if it's not already attached */
        overlay.attach();
      }

      if (this.props.backdrop) {
        overlay.setState({
          onBackdropClick: () => {
            /**
             * When the user clicks on the backdrop, and if they
             * do not disable close, then it should close the
             * backdrop as expected.
             */
            if (!this.props.disableClose) {
              this.close();
            }
          },
        });
      }

      /**
       * Finally attach the dialog when it's ready
       */
      window.requestAnimationFrame(() => {
        /** Attach the dialog container and save previous element */
        this.getContainer().attach();
        setupDisposableListeners.call(this);

        /** Add the reference to the dialog manager */
        this.props.__dialogManager.add({ id: this.DEFAULT_ID, dialog: this });
      });
    }, 0);
  };

  /** Close the overlay */
  close = () => {
    this.setState(state => ({
      animationChangeStateActions: [...state.animationChangeStateActions, {
        id: 'start-exit',
        callback: (event) => {
          if (!(event.phaseName === 'start' && event.toState === 'exit')) return;
          // Invoke this only once
          this.detachBackdrop();
        },
      }],
    }), () => {
      /** Dispose the overlay when the animation is complete */
      this.props.__dialogManager.remove(this.DEFAULT_ID);
      /** Trigger all of the callbacks to be done */
      this.getContainer().startExitAnimation();
    });
  };

  /** Handle the listeners/cleanup upon animation */
  handleAnimationListeners = (event) => {
    /** Invoke all of the listeners that are present */
    this.state.animationChangeStateActions.forEach((info) => {
      info.callback(event);
    });
  };

  /** Invoke listeners when being called */
  handleOverlayDetachment = () => {
    this.props.onClose();
    this.getOverlay().dispose();
  };

  /** Handle overlay closing */
  handleOverlayKeyDown = (event) => {
    if ([ESC, ESCAPE].indexOf(event.key) > -1 && !this.props.disableClose) {
      this.close();
    }
  };

  /**
   * Renderers
   */
  render() {
    const overrules = this.props.position || {};
    return (
      <React.Fragment>
        <BlockScrollStrategy
          ref={this.scrollStrategy}
        />
        <GlobalPositionStrategy
          overlay={this.overlay.current}
          leftOffset={overrules.left}
          rightOffset={overrules.right}
          topOffset={overrules.top}
          bottomOffset={overrules.bottom}
          ref={this.positionStrategy}
        />
        <Overlay
          positionStrategy={this.positionStrategy.current}
          scrollStrategy={this.scrollStrategy.current}
          backdrop={this.props.backdrop}
          width={this.props.width}
          height={this.props.height}
          minWidth={this.props.minWidth}
          minHeight={this.props.minHeight}
          maxWidth={this.props.maxWidth}
          maxHeight={this.props.maxHeight}
          direction={this.props.dir}
          onDetach={this.handleOverlayDetachment}
          disposeOnNavigation={this.props.closeOnNavigation}
          onKeyDown={this.handleOverlayKeyDown}
          ref={this.overlay}
        >
          <DialogContainer
            id={this.getId()}
            role={this.props.role}
            autoFocus={this.props.autoFocus}
            restoreFocus={this.props.restoreFocus}
            onAnimationStateChange={this.handleAnimationListeners}
            ref={this.container}
          >
            { this.props.children }
          </DialogContainer>
        </Overlay>
      </React.Fragment>
    )
  }
}

const DialogPropTypes = {
  /** ID for the dialog. If omitted, a unique one will be generated. */
  id: PropTypes.string,
  /** Whether the dialog is open or not */
  open: PropTypes.bool,
  /** The ARIA role of the dialog element */
  role: PropTypes.string,
  /** Whether the user can use escape or clicking on the backdrop to close the modal. */
  disableClose: PropTypes.bool,
  /** Additional panel classes */
  panelClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** The configuration for the backdrop */
  backdrop: PropTypes.oneOf(['transparent', 'dark', 'light']),
  /** Width of the dialog */
  width: PropTypes.string,
  /** Height of the dialog */
  height: PropTypes.string,
  /** Minimum width of the dialog. Number coerced to pixels */
  minWidth: PROP_TYPE_STRING_OR_NUMBER,
  /** Minimum height of the dialog. Number coerced to pixels */
  minHeight: PropTypes.string,
  /** Maximum width of the dialog. Number coerced to pixels */
  maxWidth: PropTypes.string,
  /** Maximum height of the dialog. Number coerced to pixels */
  maxHeight: PropTypes.string,
  /** Position override */
  position: PropTypes.shape({
    top: PropTypes.string,
    bottom: PropTypes.string,
    left: PropTypes.string,
    right: PropTypes.string,
  }),
  /** Layout direction for the dialog's content. */
  dir: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
  /** id of the element that describes the dialog */
  ariaDescribedBy: PropTypes.string,
  /** aria label to assign to the dialog element */
  ariaLabel: PropTypes.string,
  /** Whether the dialog should focus the first focusable element */
  autoFocus: PropTypes.bool,
  /**
   * Whether the dialog should restore focus to the most recently
   * focused element before the dialog was open (after it's closed)
   */
  restoreFocus: PropTypes.bool,
  /** Scroll strategy to be used for the dialog */
  scrollStrategy: PropTypes.shape({}),
  /** Whether the dialog should close when the user navigates */
  closeOnNavigation: PropTypes.bool,
  /** Callback invoked when dialog is opened */
  onOpen: PropTypes.func,
  /** Callback invoked when dialog is closed */
  onClose: PropTypes.func,
};

const DialogDefaultProps = {
  id: null,
  open: false,
  role: 'dialog',
  panelClass: '',
  disableClose: false,
  backdrop: 'dark',
  width: '',
  height: '',
  minWidth: null,
  minHeight: null,
  maxWidth: '80vw',
  maxHeight: null,
  position: null,
  dir: 'ltr',
  ariaDescribedBy: null,
  ariaLabel: null,
  autoFocus: true,
  restoreFocus: true,
  scrollStrategy: null,
  closeOnNavigation: true,
  onOpen: _.noop,
  onClose: _.noop,
};

Dialog.propTypes = {
  ...DialogPropTypes,
  __overlayContainer: OverlayContainerPropTypes,
  __dialogManager: DialogManagerPropTypes,
};

Dialog.defaultProps = {
  ...DialogDefaultProps,
  __overlayContainer: OverlayContainerDefaultProps,
  __dialogManager: DialogManagerDefaultProps,
};

const StackedDialog = stack(
  withDialogManager,
  withOverlayContainerConsumer,
)(Dialog);
StackedDialog.propTypes = DialogPropTypes;
StackedDialog.defaultProps = DialogDefaultProps;

export default StackedDialog;

/**
 * Private methods
 */
/**
 * Listeners that can only be called once
 */
function setupDisposableListeners() {
  this.disposeOverlay = _.once(() => {
    this.getOverlay().dispose();
  });
  /** Invoke the onOpen listener only once */
  this.emitOnOpen = _.once(() => {
    this.props.onOpen();
  });
  /** Detach the overlay backdrop (done in concert with the animation) */
  this.detachBackdrop = _.once(() => {
    this.props.onClose();
    this.getOverlay().detachBackdrop();
  });
}
