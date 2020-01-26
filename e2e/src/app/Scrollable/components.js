import * as React from 'react';
import styled from 'styled-components';
import useScrollable from '../../../../src/cdk/Scrolling/useScrollable';

const ScrollContainerRoot = styled.div`
  height: 100px;
  width: 100px;
  overflow: auto;
`;

export const RowRoot = styled.div`
  display: flex;
  flex-direction: row;
`;

export const CellRoot = styled.div`
  flex: none;
  width: 100px;
  height: 100px;
`;

export function ScrollContainer(props) {
  const [mounted, setMounted] = React.useState(false);
  const root = React.useRef(null);

  const scrollable = useScrollable(root.current);

  React.useEffect(() => {
    window.__scrollable__ = scrollable;
  }, [scrollable]);

  React.useEffect(() => {
    return () => {
      delete window.__scrollable__;
    };
  }, []);

  React.useEffect(() => {
    if (!mounted) {
      // Update so that all of the elements are properly there
      setMounted(true);
    }
  }, [mounted]);

  return (
    <ScrollContainerRoot ref={root} {...props} />
  );
}
