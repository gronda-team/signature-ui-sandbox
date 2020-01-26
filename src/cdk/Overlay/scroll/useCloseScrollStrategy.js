import * as React from 'react';
import noop from 'lodash/noop';
import invoke from 'lodash/invoke';
import { useScrollDispatcher, useViewportRuler } from '../../Scrolling';
import { OverlayActions } from '../context';

function useCloseScrollStrategy(state, dispatch) {
  const scroll = useScrollDispatcher();
  const vr = useViewportRuler();
  /**
   * Scroll position at the time the scroll strategy was enabled
   * @type {React.MutableRefObject<number>}
   */
  const initialScrollPosition = React.useRef(0);

  /**
   * Cleanup function returned from subscribing to the scroll dispatcher
   * @type {React.MutableRefObject<null | Function>}
   */
  const removeListener = React.useRef(null);

  /**
   * Config props provided by the Overlay component.
   * @type {{ threshold: number }}
   */
  const config = React.useMemo(
    () => {
      const { scrollStrategyConfig: config } = state;
      if (config && config.threshold != null) {
        return config;
      }

      return { threshold: 0 };
    },
    state.scrollStrategyConfig && state.scrollStrategyConfig.threshold,
  );

  const attach = noop;

  const disable = React.useCallback(() => {
    if (typeof removeListener.current === 'function') {
      invoke(removeListener, 'current');
      removeListener.current = null;
    }
  }, []);

  const detach = React.useCallback(() => {
    disable();
    if (state.attached) {
      dispatch({
        type: OverlayActions.SET_ATTACHED_STATE,
        data: false,
      });
    }
  }, [disable, state.attached]);

  const onHandleScroll = React.useCallback(() => {
    if (config.threshold > 0) {
      const scrollPosition = vr.getViewportScrollPosition().top;

      if (Math.abs(scrollPosition - initialScrollPosition.current) > config.threshold) {
        detach();
      } else if (state.position.apply) {
        state.position.apply();
      }
    } else {
      detach();
    }
  }, [config.threshold, detach, vr.getViewportScrollPosition, state.position.apply]);

  const enable = React.useCallback(() => {
    if (typeof removeListener.current === 'function') return;

    initialScrollPosition.current = vr.getViewportScrollPosition().top;

    removeListener.current = scroll.onScroll(onHandleScroll, 0);
  }, [scroll.onScroll, vr.getViewportScrollPosition, onHandleScroll]);

  return React.useMemo(() => ({
    attach, enable, disable,
  }), [attach, enable, disable]);
}

export default useCloseScrollStrategy;
