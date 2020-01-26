import * as React from 'react';
import noop from 'lodash/noop';
import invoke from 'lodash/invoke';
import { useScrollDispatcher, useViewportRuler } from '../../Scrolling';
import { OverlayActions } from '../context';
import { isElementScrolledOutsideView } from '../position/util';

function useRepositionScrollStrategy(state, dispatch) {
  const scroll = useScrollDispatcher();
  const vr = useViewportRuler();

  /**
   * Cleanup function returned from subscribing to the scroll dispatcher
   * @type {React.MutableRefObject<null | Function>}
   */
  const removeListener = React.useRef(null);

  /**
   * Config props provided by the Overlay component.
   * @type {{ scrollThrottle: ?number, autoClose: ?boolean }}
   */
  const config = React.useMemo(
    () => {
      const { scrollStrategyConfig: config } = state;
      if (config && (config.scrollThrottle != null || config.autoClose != null)) {
        return config;
      }

      return { scrollThrottle: null, autoClose: null };
    },
    [
      state.scrollStrategyConfig,
      state.scrollStrategyConfig && state.scrollStrategyConfig.scrollThrottle,
      state.scrollStrategyConfig && state.scrollStrategyConfig.autoClose,
    ],
  );

  const attach = noop;

  /** Disables repositioning of the attached overlay on scroll. */
  const disable = React.useCallback(() => {
    if (typeof removeListener.current === 'function') {
      invoke(removeListener, 'current');
      removeListener.current = null;
    }
  }, []);

  const detach = disable;

  const onHandleScroll = React.useCallback(() => {
    if (state.position.apply) {
      state.position.apply();
    }

    if (config.autoClose) {
      const overlayRect = state.pane.getBoundingClientRect();
      const { width, height } = vr.getViewportSize();

      const parentRects = [{
        width, height, bottom: height, right: width, top: 0, left: 0,
      }];

      if (isElementScrolledOutsideView(overlayRect, parentRects)) {
        disable();
        dispatch({
          type: OverlayActions.SET_ATTACHED_STATE,
          data: false,
        });
      }
    }
  }, [state.position.apply, state.pane, vr.getViewportSize, config, disable]);

  const enable = React.useCallback(() => {
    if (typeof removeListener.current === 'function') return;

    const throttle = config.scrollThrottle || 0;
    removeListener.current = scroll.onScroll(onHandleScroll, throttle);
  }, [scroll.onScroll, onHandleScroll, config]);

  // Replace listener when the listeners have changed
  React.useEffect(() => {
    invoke(removeListener, 'current');

    const throttle = config.scrollThrottle || 0;
    removeListener.current = scroll.onScroll(onHandleScroll, throttle);
  }, [onHandleScroll, scroll.onScroll, config]);

  return React.useMemo(() => ({
    attach, enable, disable, detach,
  }), [attach, enable, disable, detach]);
}

export default useRepositionScrollStrategy;
