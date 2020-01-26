import * as React from 'react';
import { CellRoot, RowRoot, ScrollContainer } from './components';
import { Directionality } from '../../../../src/cdk/Bidi';

export const TestId = {
  SCROLL_CONTAINER: 'scroll-container',
  FIRST_ROW_START: 'first-row-start',
  FIRST_ROW_END: 'first-row-end',
  LAST_ROW_START: 'last-row-start',
  LAST_ROW_END: 'last-row-end',
};

export default function ScrollableSuite() {
  const [dir, setDir] = React.useState('ltr');

  React.useEffect(() => {
    window.__suite__ = { setDir };

    return () => {
      delete window.__suite__;
    };
  }, []);

  return (
    <Directionality dir={dir}>
      <ScrollContainer dir={dir} data-testid={TestId.SCROLL_CONTAINER}>
        <RowRoot>
          <CellRoot data-testid={TestId.FIRST_ROW_START} />
          <CellRoot data-testid={TestId.FIRST_ROW_END} />
        </RowRoot>
        <RowRoot>
          <CellRoot data-testid={TestId.LAST_ROW_START} />
          <CellRoot data-testid={TestId.LAST_ROW_END} />
        </RowRoot>
      </ScrollContainer>
    </Directionality>
  );
}
