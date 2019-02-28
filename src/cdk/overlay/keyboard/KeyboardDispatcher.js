import * as React from 'react';
import _ from 'lodash';
import { KeyboardDispatcherProvider } from './context/KeyboardDispatcherContext';

/*
Side effect service for handling keyboard
events for overlays
 */
class OverlayKeyboardDispatcher extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** Currently attached overlays in the order they were attached. */
      attachedOverlays: [],
      /** Whether dispatcher is started */
      attached: false,
      provide: {
        add: this.add,
        update: this.update,
        remove: this.remove,
      },
    };
  }
  
  /**
   * Actions
   */
  /** Add a new overlay to the list of attached overlay refs. */
  add = ({ id, callback }) => {
    this.remove(id);
  
    // Lazily start dispatcher once first overlay is added
    if (!this.state.attached) {
      this.setState({ attached: true }, () => {
        document.body.addEventListener('keydown', this.keyDownListener, true);
      });
    }
    
    this.setState(state => ({
      attachedOverlays: [...state.attachedOverlays, { id, callback }],
    }));
  };

  /** Update overlay callback in case it's changed */
  update = ({ id, callback }) => {
    const index = _.findIndex(this.state.attachedOverlays, { id });

    if (index > -1) {
      this.setState((state) => {
        const info = state.attachedOverlays[index];
        const attachedOverlays = [...state.attachedOverlays];
        attachedOverlays.splice(index, 1, {
          ...info,
          callback,
        });
        return { attachedOverlays };
      });
    }
  };
  
  /** Remove an overlay from the list of attached overlay refs. */
  remove = (id) => {
    const index = _.findIndex(this.state.attachedOverlays, { id });
    
    if (index > -1) {
      this.setState((state) => {
        const attachedOverlays = [...state.attachedOverlays];
        attachedOverlays.splice(index, 1);
        return { attachedOverlays };
      }, () => {
        if (this.state.attachedOverlays.length === 0) {
          detach.call(this);
        }
      });
    }
  };
  
  /** Keyboard event listener that will be attached to the body. */
  keyDownListener = (event) => {
    /*
    Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
    We want to target the most recent overlay, rather than trying to match where the event
    came from, because some components might open an overlay, but keep focus on a trigger element
    (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
    because we don't want overlays that don't handle keyboard events to block the ones below
    them that do.
     */
    _.forEachRight(this.state.attachedOverlays, (overlay) => {
      if (overlay.callback) {
        overlay.callback(event);
        return false;
      }
    });
  };
    
    // no other rendering
  render = () => (
    <KeyboardDispatcherProvider value={this.state.provide}>
      { this.props.children }
    </KeyboardDispatcherProvider>
  );
}

/**
 * Private methods
 */
/** Detaches the global keyboard event listener. */
function detach() {
  if (this.state.attached) {
    this.setState({ attached: false }, () => {
      document.body.removeEventListener('keydown', this.keyDownListener, true);
    });
  }
}

export default OverlayKeyboardDispatcher;
