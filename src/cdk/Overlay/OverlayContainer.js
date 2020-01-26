import * as React from 'react';
import ReactDOM from 'react-dom';
import { OverlayContainerContext } from './context';
import { OVERLAY_CONTAINER_PROP_CAMEL, OVERLAY_CONTAINER_PROP_KEBAB } from './constants';

/**
 * Context that provides the container in which overlays can be injected and where keyboard
 * listeners will be attached for current overlays.
 * @param children
 * @return {*}
 * @constructor
 */
function OverlayContainer({ children }) {
  /**
   * List of callbacks to be invoked when handling keydown events from overlays.
   * @type {React.MutableRefObject<{ id: string, callback: function }[]>}
   */
  const currentListeners = React.useRef([]);

  /**
   * Whether the document listener has been attached.
   * @type {React.MutableRefObject<boolean>}
   */
  const listenerAttached = React.useRef(false);

  /**
   * Callback function that's invoked when multiple overlays are present
   * @type {Function}
   */
  const keydownListener = React.useCallback((event) => {
    const listeners = currentListeners.current;

    for (let i = listeners.length - 1; i > -1; i--) {
      // Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
      // We want to target the most recent overlay, rather than trying to match where the event came
      // from, because some components might open an overlay, but keep focus on a trigger element
      // (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
      // because we don't want overlays that don't handle keyboard events to block the ones below
      // them that do.
      if (typeof listeners[i].callback === 'function') {
        listeners[i].callback(event);
        break;
      }
    }
  }, []);

  /**
   * Remove a function listener from the list of overlay listeners.
   * @type {function(id: string)}
   */
  const removeKeyDownListener = React.useCallback((id) => {
    const overlayExists = currentListeners.current.findIndex(entry => entry.id === id);

    if (overlayExists > -1) {
      currentListeners.current.splice(overlayExists, 1);
    }

    if (currentListeners.current.length === 0 && listenerAttached.current) {
      document.body.removeEventListener('keydown', keydownListener);
      listenerAttached.current = false;
    }
  }, [keydownListener]);

  /**
   * Add a function listener to the list of available overlay listeners.
   * @type {function(id: string, listener: function)}
   */
  const addKeyDownListener = React.useCallback((id, listener) => {
    // Lazily start the dispatcher once the first overlay is pushed.
    if (!listenerAttached.current) {
      document.body.addEventListener('keydown', keydownListener);
      listenerAttached.current = true;
    }

    const overlayExists = currentListeners.current.findIndex(entry => entry.id === id);

    if (overlayExists > -1) {
      // We want to replace the listener if it exists already
      currentListeners.current[overlayExists].callback = listener;
    } else {
      currentListeners.current.push({ id, callback: listener });
    }
  }, [keydownListener]);

  /**
   * Whether the root element has been attached.
   * @type {[?boolean, React.Dispatch<React.SetStateAction<?boolean>>]}
   */
  const [attached, setAttached] = React.useState(false);

  /**
   * The element in which overlays will be injected.
   * @type {React.MutableRefObject<?HTMLElement>}
   */
  const rootElementInstance = React.useRef(null);

  const createContainer = React.useCallback(() => {
    if (attached) return;
    const existingRoots = document.body.querySelectorAll(
      `div[data-${OVERLAY_CONTAINER_PROP_KEBAB}]`
    );

    // Remove any existing old containers. Can happen when transitioning from server to client.
    for (let i = 0; i < existingRoots.length; i++) {
      const node = existingRoots[i];
      // GC any existing React components at the previous roots
      ReactDOM.unmountComponentAtNode(node);
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }

    const root = document.createElement('div');
    root.dataset[OVERLAY_CONTAINER_PROP_CAMEL] = 'true';

    document.body.appendChild(root);

    rootElementInstance.current = root;
    setAttached(true);
  }, [attached]);

  React.useEffect(() => {
    return () => {
      const container = rootElementInstance.current;
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        setAttached(false);
      }
    };
  }, []);

  // Cleanup event listener for keydown.
  React.useEffect(() => {
    return () => {
      if (listenerAttached.current) {
        document.body.removeEventListener('keydown', keydownListener);
        listenerAttached.current = false;
      }
    };
  }, [keydownListener]);

  const getContainer = React.useCallback(() => {
    if (!rootElementInstance.current) {
      createContainer();
    }

    return rootElementInstance.current;
  }, [createContainer, attached]);

  // Internal method used for testing. Not exposed to public API.
  const getCurrentListeners = React.useCallback(() => (
    currentListeners.current
  ), []);

  const provider = React.useMemo(() => ({
    getContainer,
    addKeyDownListener,
    removeKeyDownListener,
    getCurrentListeners,
  }), [getContainer, addKeyDownListener, removeKeyDownListener, getCurrentListeners]);

  return (
    <OverlayContainerContext.Provider value={provider}>
      { children }
    </OverlayContainerContext.Provider>
  );
}

export default OverlayContainer;
