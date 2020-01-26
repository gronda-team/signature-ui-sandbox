import * as React from 'react';
import styled from 'styled-components';
import { Overlay, useBlockScrollStrategy } from '../../../../src/cdk/Overlay';
import { useViewportRuler } from '../../../../src/cdk/Scrolling';

// Default width and height of the overlay and origin panels throughout these tests.
export const DEFAULT_HEIGHT = 30;
export const DEFAULT_WIDTH = 60;

export const TestId = {
  ORIGIN: 'origin',
};

const TestOverlay = styled.div`
  width: ${DEFAULT_WIDTH}px;
  height: ${DEFAULT_HEIGHT}px;
  background-color: palevioletred;
  z-index: 100;
`;

const VeryLargeElement = styled.div`
  height: 3000px;
  width: 100px;
  background-color: grey;
  
  &[data-hide="true"] {
    display: none;
  }
  
  &[data-axis="x"] {
    width: 3000px;
    height: 100px;
  }
`;

function BlockSuite() {
  const vr = useViewportRuler();
  const [largeElementHidden, setHidden] = React.useState(false);
  const [config, setConfig] = React.useState({});
  const [scrollAxis, setScrollAxis] = React.useState('y');

  const bindStateToWindow = React.useCallback(({ state, dispatch }) => {
    window.__overlay__ = { ...(window.__overlay__ || {}), state, dispatch };
  }, []);

  React.useEffect(() => {
    window.__overlay__ = {
      ...(window.__overlay__ || {}),
      setConfig,
      setHidden,
      setScrollAxis,
    };

    return () => {
      delete window.__overlay__;
    };
  }, []);

  React.useEffect(() => {
    window.__vr__ = vr;
    return () => {
      delete window.__vr__;
    };
  }, [vr]);

  return (
    <React.Fragment>
      <VeryLargeElement data-hide={largeElementHidden} data-axis={scrollAxis} />
      <Overlay
        onStateChange={bindStateToWindow}
        useScrollStrategy={useBlockScrollStrategy}
        scrollStrategyConfig={config}
      >
        <TestOverlay />
      </Overlay>
    </React.Fragment>
  )
}

export default BlockSuite;
