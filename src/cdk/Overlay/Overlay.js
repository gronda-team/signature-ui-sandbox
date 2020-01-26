import * as React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';
import {
  useOverlayContainer,
  OverlayStateContext,
  OverlayActionContext,
  overlayReducer,
  STATE_CONTEXT_INIT, OverlayActions, useKeyboardDispatcher,
} from './context';
import OverlayHost from './OverlayHost';
import { OverlayBackdrop, OverlayPaneRoot } from './styles';
import { Directionality } from '../Bidi';

function Overlay(props) {
  const {
    dir, onKeyDown, onAttached, onDetached, backdropShade, children, onBackdropClick,
    usePositionStrategy, width, height, minWidth, minHeight, maxWidth, maxHeight,
    onStateChange, positionStrategyConfig, useScrollStrategy, scrollStrategyConfig,
    ...restProps
  } = props;
  const finalId = React.useRef(uniqueId('sui-overlay:'));

  const previousAttachedState = React.useRef(false);

  /** Whether or not we can apply the position strategy; invoked during position strategy check */
  const [canApplyFromSwapPosition, setCanApply] = React.useState(false);

  const [state, dispatch] = React.useReducer(overlayReducer, STATE_CONTEXT_INIT);
  const getContainer = useOverlayContainer();
  const { addKeyDownListener, removeKeyDownListener } = useKeyboardDispatcher();
  const container = React.useMemo(getContainer, [getContainer]);

  /**
   * Reference to the div element that connects the overlay to the overlay container
   * @type {React.MutableRefObject<?HTMLElement>}
   */
  const anchor = React.useRef(null);

  const plainHostRef = React.useCallback((el) => {
    if (el) {
      dispatch({ type: OverlayActions.SET_CREATED_STATE, data: true });
      dispatch({ type: OverlayActions.SET_HOST, data: el });
    }
  }, []);

  const plainBackdropRef = React.useCallback((el) => {
    if (el) {
      dispatch({ type: OverlayActions.SET_BACKDROP_EL, data: el });
    }
  }, []);

  const plainPaneRef = React.useCallback((el) => {
    if (el) {
      dispatch({ type: OverlayActions.SET_PANE, data: el });
    }
  }, []);

  // Handling the position strategy
  const position = usePositionStrategy(state, dispatch);
  const previousPositionStrategy = React.useRef(position);

  React.useLayoutEffect(() => {
    const prevStrategy = previousPositionStrategy.current;
    if (position === prevStrategy) return;

    if (prevStrategy && prevStrategy.detach) {
      prevStrategy.detach();
    }

    previousPositionStrategy.current = position;

    if (state.attached && position && position.attach) {
      position.attach();
      if (position.apply && !canApplyFromSwapPosition) {
        // We must apply it on the next tick because the pane may not be available with its
        // final applied dimensions.
        setCanApply(true);
      }
    }
  }, [
    position, position && position.apply, position && position.attach, state.attached,
    canApplyFromSwapPosition,
  ]);

  // Handling the scroll strategy
  const scroll = useScrollStrategy(state, dispatch);
  const previousScrollStrategy = React.useRef(scroll);

  const disposeScrollStrategy = React.useCallback(() => {
    if (scroll) {
      scroll.disable();

      if (scroll.detach) {
        scroll.detach();
      }
    }
  }, [scroll, scroll && scroll.disable, scroll && scroll.detach]);

  React.useLayoutEffect(() => {
    const prevStrategy = previousScrollStrategy.current;
    if (scroll === prevStrategy) return;

    disposeScrollStrategy();

    previousScrollStrategy.current = scroll;

    if (state.attached && scroll && scroll.attach) {
      scroll.attach();
      scroll.enable();
    }
  }, [scroll, disposeScrollStrategy, scroll && scroll.attach, scroll && scroll.enable, state.attached]);

  React.useEffect(() => {
    // By this time the overlay pane should have all of the dimensions, which means it can
    // be properly measured without having to rely on `window.requestAnimationFrame`, which would
    // require all of the Overlay tests to be turned into `async`.
    if (canApplyFromSwapPosition) {
      position.apply();
      setCanApply(false);
    }
  }, [position && position.apply, canApplyFromSwapPosition]);

  // Create the anchor that binds the overlay to the overlay container.
  React.useEffect(() => {
    anchor.current = document.createElement('div');

    return () => {
      if (anchor.current && anchor.current.parentNode) {
        anchor.current.parentNode.removeChild(anchor.current);
      }
    };
  }, []);

  // Setting the shade for the backdrop (but not setting if it's visible or not)
  React.useEffect(() => {
    dispatch({ type: OverlayActions.SET_BACKDROP_SHADE, data: backdropShade });
  }, [backdropShade]);

  // Setting the shade for the backdrop (but not setting if it's visible or not)
  React.useEffect(() => {
    dispatch({ type: OverlayActions.SET_BACKDROP_CLICK, data: onBackdropClick });
  }, [onBackdropClick]);

  const attachBackdrop = React.useCallback(() => {
    if (backdropShade != null) {
      if (typeof window.requestAnimationFrame !== 'undefined') {
        window.requestAnimationFrame(() => {
          dispatch({ type: OverlayActions.SET_BACKDROP_VISIBILITY, data: true });
        });
      } else {
        dispatch({ type: OverlayActions.SET_BACKDROP_VISIBILITY, data: true });
      }
    }
  }, [backdropShade]);

  /**
   * Detaches the backdrop associated with the overlay.
   * @type {Function}
   */
  const detachBackdrop = React.useCallback(() => {
    const backdropToDetach = state.backdrop;
    if (!backdropToDetach) return;

    let timeoutId;
    const finishDetach = () => {
      if (backdropToDetach) {
        backdropToDetach.removeEventListener('transitionend', finishDetach);
      }

      // It is possible that a new portal has been attached to this overlay since we started
      // removing the backdrop. If that is the case, only clear the backdrop reference if it
      // is still the same instance that we started to remove.
      if (backdropToDetach === state.backdrop) {
        dispatch({ type: OverlayActions.SET_BACKDROP_EL, data: null });
      }

      window.clearTimeout(timeoutId);
    };

    dispatch({ type: OverlayActions.SET_BACKDROP_VISIBILITY, data: false });
    backdropToDetach.addEventListener('transitionend', finishDetach);

    // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
    // In this case we make it unclickable and we try to remove it after a delay.
    dispatch({ type: OverlayActions.SET_BACKDROP_STYLES, data: { pointerEvents: 'none' } });
    timeoutId = window.setTimeout(finishDetach, 500);
  }, [backdropShade, state.backdrop, state.backdropActive]);

  const attachOverlay = React.useCallback(() => {
    if (anchor.current) {
      container.appendChild(anchor.current);
    }

    if (position && position.attach) {
      position.attach();
    }

    if (scroll && scroll.enable) {
      scroll.enable();
    }

    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: { pointerEvents: 'auto' },
    });

    attachBackdrop();

    // Add current overlay to the dispatcher
    addKeyDownListener(finalId.current, onKeyDown);

    onAttached();
    previousAttachedState.current = true;
  }, [
    onAttached,
    container,
    attachBackdrop,
    get(scroll, 'attach'),
    get(position, 'attach'),
    addKeyDownListener,
    onKeyDown,
  ]);

  const detachOverlay = React.useCallback(() => {
    detachBackdrop();
    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: { pointerEvents: 'none' },
    });

    disposeScrollStrategy();

    removeKeyDownListener(finalId.current);

    if (anchor.current && anchor.current.parentNode) {
      anchor.current.parentNode.removeChild(anchor.current);
    }

    onDetached();
    previousAttachedState.current = false;
  }, [
    onDetached,
    detachBackdrop,
    removeKeyDownListener,
    disposeScrollStrategy,
  ]);

  // Attach the overlay to the DOM
  React.useEffect(() => {
    if (!previousAttachedState.current && state.attached) {
      attachOverlay();
    } else if (previousAttachedState.current && !state.attached) {
      detachOverlay();
    }
  }, [attachOverlay, detachOverlay, state.attached]);

  // Invoke the apply function when everything is ready on the DOM.
  React.useLayoutEffect(() => {
    if (state.attached && position && position.apply) {
      position.apply();
    }
  }, [state.attached, get(position, 'apply')]);

  // Update position strategy config when changed
  React.useEffect(() => {
    dispatch({
      type: OverlayActions.UPDATE_POSITION_STRATEGY_CONFIG,
      data: positionStrategyConfig,
    });
  }, [positionStrategyConfig]);

  // Update scroll strategy config when changed
  React.useEffect(() => {
    dispatch({
      type: OverlayActions.UPDATE_SCROLL_STRATEGY_CONFIG,
      data: scrollStrategyConfig,
    });
  }, [scrollStrategyConfig]);

  // Update the dimensions from props
  React.useEffect(() => {
    const style = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight']
      .reduce((acc, property) => {
        acc[property] = props[property];
        return acc;
      }, {});

    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: style,
    });
  }, [
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  ]);

  // Update keydown listener when it changes
  React.useEffect(() => {
    addKeyDownListener(finalId.current, onKeyDown);

    return () => {
      removeKeyDownListener(finalId.current);
    };
  }, [onKeyDown]);

  // Remove keydown listener completely from overlay dispatcher
  React.useEffect(() => {
    return () => {
      removeKeyDownListener(finalId.current);
    };
  }, []);

  // Update directionality changes
  React.useEffect(() => {
    dispatch({
      type: OverlayActions.SET_DIRECTIONALITY,
      data: dir,
    });
  }, [dir]);

  // Add a listener for outside components to invoke dispatch or read state.
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({ state, dispatch });
    }
  }, [state, onStateChange]);

  return anchor.current ? ReactDOM.createPortal(

    <OverlayActionContext.Provider value={dispatch}>
      <OverlayStateContext.Provider value={state}>
        { state.backdropShade != null ? (
          <OverlayBackdrop
            {...state.backdropAttributes}
            onClick={state.onBackdropClick}
            style={state.backdropStyles}
            data-shade={state.backdropShade}
            data-showing={state.backdropActive}
            data-sui-tree="overlay:backdrop"
            ref={plainBackdropRef}
          />
        ) : null }
        <Directionality dir={dir}>
          <OverlayHost
            {...restProps}
            {...state.hostAttributes}
            style={{...state.hostStyles}}
            data-sui-tree="overlay:host"
            ref={plainHostRef}
          >
            <OverlayPaneRoot
              {...state.paneAttributes}
              style={state.paneStyles}
              data-sui-tree="overlay:pane"
              ref={plainPaneRef}
            >
              { children }
            </OverlayPaneRoot>
          </OverlayHost>
        </Directionality>
      </OverlayStateContext.Provider>
    </OverlayActionContext.Provider>,
    anchor.current,
  ) : null;
}

Overlay.propTypes = {
  // Keydown listener for the overlay itself
  onKeyDown: PropTypes.func,
  // Directionality
  dir: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
  // Called when the overlay has been attached
  onAttached: PropTypes.func,
  // Called when the overlay has been detached
  onDetached: PropTypes.func,
  // The shade for the backdrop
  backdropShade: PropTypes.string,
  // Callback for when the user clicks the backdrop
  onBackdropClick: PropTypes.func,
  // Callback for each time state is updated
  onStateChange: PropTypes.func,
  // Hook to include position strategy
  usePositionStrategy: PropTypes.func,
  // Hook to include position strategy
  useScrollStrategy: PropTypes.func,
  // Config for position strategy
  positionStrategyConfig: PropTypes.object,
  // Config for scroll strategy
  scrollStrategyConfig: PropTypes.object,
  // Dimensions
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Overlay.defaultProps = {
  // Must be null because the keyboard dispatcher logic is based on the onKeyDown listener
  // type.
  onKeyDown: null,
  dir: 'ltr',
  onAttached: noop,
  onDetached: noop,
  backdropShade: null,
  onBackdropClick: noop,
  usePositionStrategy: noop,
  useScrollStrategy: noop,
  positionStrategyConfig: {},
  scrollStrategyConfig: {},
  onStateChange: noop,
  width: null,
  height: null,
  minWidth: null,
  minHeight: null,
  maxWidth: null,
  maxHeight: null,
};

export default Overlay;
