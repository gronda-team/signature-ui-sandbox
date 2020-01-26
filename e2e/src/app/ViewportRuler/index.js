import * as React from 'react';
import styled from 'styled-components';
import { useViewportRuler } from '../../../../src/cdk/Scrolling';

// Forces the page to be scrollable
const VeryLargeElement = styled.div`
  width: 6000px;
  height: 6000px;
  background-color: palevioletred;
`;

function ViewportRulerSuite() {
  const vr = useViewportRuler();

  React.useEffect(() => {
    if (window.Cypress) {
      window.ruler = vr;
    }

    return () => {
      delete window.ruler;
    }
  }, []);

  return (
    <VeryLargeElement />
  );
}

export default ViewportRulerSuite;
