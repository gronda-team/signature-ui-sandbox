import * as React from 'react';
import styled from 'styled-components';
import { Overlay, useFlexibleConnectedPositionStrategy } from '../../../../src/cdk/Overlay';
import TestOverlay from './TestOverlay';

// Default width and height of the overlay and origin panels throughout these tests.
export const DEFAULT_HEIGHT = 30;
export const DEFAULT_WIDTH = 60;

export const TestId = {
  ORIGIN: 'origin',
};

const BlockElement = styled.div`
  width: ${DEFAULT_WIDTH}px;
  height: ${DEFAULT_HEIGHT}px;
  background-color: palevioletred;
  z-index: 100;
  
  &[data-position="absolute"] {
    position: absolute;
  }
`;

const VeryLargeElement = styled.div`
  height: 4000px;
  width: 4000px;
  
  &[data-overflow-y="true"] {
    height: 2000px
    width: 100%;
  }
`;

function FCPSSuite() {
  const [miscProps, setMiscProps] = React.useState({});
  const [absolutelyPositioned, setAbsolutelyPositioned] = React.useState(false);
  const [config, setConfig] = React.useState({});
  const [originStyle, setOriginStyle] = React.useState({});

  const bindStateToWindow = React.useCallback(({ state, dispatch }) => {
    window.__overlay__ = { ...(window.__overlay__ || {}), state, dispatch };
  }, []);

  React.useEffect(() => {
    window.__overlay__ = {
      ...(window.__overlay__ || {}),
      setConfig,
      setOriginStyle,
      setAbsolutelyPositioned,
      setMiscProps,
    };

    return () => {
      delete window.__overlay__;
    };
  }, []);

  return (
    <React.Fragment>
      { miscProps.showLargeElement ? (
        <VeryLargeElement data-overflow-y={miscProps.overflowY} />
      ) : null }
      <BlockElement
        style={originStyle}
        data-testid={TestId.ORIGIN}
        data-position={absolutelyPositioned ? 'absolute' : null}
      />
      <Overlay
        onStateChange={bindStateToWindow}
        usePositionStrategy={useFlexibleConnectedPositionStrategy}
        positionStrategyConfig={config}
        maxWidth={miscProps.maxWidth}
        width={miscProps.width}
        dir={miscProps.dir}
      >
        <TestOverlay />
      </Overlay>
    </React.Fragment>
  )
}

export default FCPSSuite;
