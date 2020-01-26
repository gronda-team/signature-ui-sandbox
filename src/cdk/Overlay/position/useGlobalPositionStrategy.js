import * as React from 'react';
import get from 'lodash/get';
import { OverlayActions } from '../context';

const extractRef = ref => ref.current;

/**
 * List of prop keys that are associated with the configuration for this overlay.
 * @type {string[]}
 */
const GLOBAL_STRATEGY_PROP_KEYS = [
  'left', 'top', 'right', 'bottom', 'centerVertically', 'centerHorizontally',
];

const DEFAULT_CONFIGS = {
  left: null,
  top: null,
  right: null,
  bottom: null,
  centerVertically: null,
  centerHorizontally: null,
};

function useGlobalPositionStrategy(state, dispatch) {
  const cssPosition = React.useRef('static');
  const topOffset = React.useRef('');
  const bottomOffset = React.useRef('');
  const leftOffset = React.useRef('');
  const rightOffset = React.useRef('');
  const alignItems = React.useRef('');
  const justifyContent = React.useRef('');

  /**
   * @type {Object}
   */
  const config = React.useMemo(
    () => {
      const { positionStrategyConfig: config } = state;

      const mappedConfig = GLOBAL_STRATEGY_PROP_KEYS.reduce((acc, key) => {
        acc[key] = config[key];
        return acc;
      }, {});

      return {
        ...DEFAULT_CONFIGS,
        ...mappedConfig,
      };
    },
    GLOBAL_STRATEGY_PROP_KEYS
      .map(key => get(state, ['positionStrategyConfig', key]))
  );

  const attach = React.useCallback(() => {
    dispatch({
      type: OverlayActions.ADD_HOST_ATTRIBUTES,
      data: { 'data-overlay-position-strategy': 'global' },
    });
  }, []);

  // Handle all of the offsets here in effect hooks
  // Set the top position of the overlay.
  React.useEffect(() => {
    topOffset.current = config.top;
    alignItems.current = 'flex-start';
  }, [config.top]);

  // Set the left position of the overlay.
  React.useEffect(() => {
    leftOffset.current = config.left;
    justifyContent.current = 'flex-start';
  }, [config.left]);

  // Set the bottom position of the overlay.
  React.useEffect(() => {
    bottomOffset.current = config.bottom;
    alignItems.current = 'flex-end';
  }, [config.bottom]);

  // Set the right position of the overlay.
  React.useEffect(() => {
    rightOffset.current = config.right;
    justifyContent.current = 'flex-end';
  }, [config.right]);

  // Set the horizontal positioning + offset.
  React.useEffect(() => {
    leftOffset.current = config.centerHorizontally;
    justifyContent.current = 'center';
  }, [config.centerHorizontally]);

  // Set the vertical positioning + offset.
  React.useEffect(() => {
    topOffset.current = config.centerVertically;
    alignItems.current = 'center';
  }, [config.centerVertically]);

  const apply = React.useCallback(() => {
    if (!state.attached) return;

    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: {
        position: extractRef(cssPosition),
        marginLeft: state.paneStyles.width === '100%' ? 0 : extractRef(leftOffset),
        marginTop: state.paneStyles.height === '100%' ? 0 : extractRef(topOffset),
        marginBottom: extractRef(bottomOffset),
        marginRight: extractRef(rightOffset),
      },
    });

    let parentJustifyContent = '';
    const currentJustifyContent = extractRef(justifyContent);
    if (state.paneStyles.width === '100%') {
      parentJustifyContent = 'flex-start';
    } else if (currentJustifyContent === 'center') {
      parentJustifyContent = 'center';
    } else if (state.dir === 'rtl') {
      // In RTL the browser will invert `flex-start` and `flex-end` automatically, but we
      // don't want that because our positioning is explicitly `left` and `right`, hence
      // why we do another inversion to ensure that the overlay stays in the same position.
      // TODO: reconsider this if we add `start` and `end` methods.
      if (currentJustifyContent === 'flex-start') {
        parentJustifyContent = 'flex-end';
      } else if (currentJustifyContent === 'flex-end') {
        parentJustifyContent = 'flex-start';
      }
    } else {
      parentJustifyContent = currentJustifyContent;
    }

    dispatch({
      type: OverlayActions.ADD_HOST_STYLES,
      data: {
        justifyContent: parentJustifyContent,
        alignItems: state.paneStyles.height === '100%' ? 'flex-start' : extractRef(alignItems),
      },
    });
  }, [
    state.paneStyles.width,
    state.paneStyles.height,
    state.attached,
    state.dir,
    config,
  ]);

  const detach = React.useCallback(() => {
    dispatch({
      type: OverlayActions.ADD_HOST_ATTRIBUTES,
      data: { 'data-overlay-position-strategy': null },
    });

    dispatch({
      type: OverlayActions.ADD_PANE_STYLES,
      data: {
        position: '',
        marginLeft: '',
        marginTop: '',
        marginBottom: '',
        marginRight: '',
      },
    });

    dispatch({
      type: OverlayActions.ADD_HOST_STYLES,
      data: {
        justifyContent: '',
        alignItems: '',
      },
    });
  }, []);

  return React.useMemo(() => ({
    attach,
    apply,
    detach,
  }), [apply, attach, detach]);
}

export default useGlobalPositionStrategy;
