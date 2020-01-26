import * as React from 'react';
import styled from 'styled-components';
import { OverlayStateContext } from '../../../../src/cdk/Overlay';

const TestOverlayRoot = styled.div`
  width: 60px;
  height: 30px;
  background-color: lightgrey;
`;

export default function TestOverlay() {
  const state = React.useContext(OverlayStateContext);

  return (
    <TestOverlayRoot
      className="transform-origin"
      style={{ transformOrigin: state.transformOriginStyle }}
    />
  );
}
