import * as React from 'react';
import PlainButtonSuite from './PlainButton';
import { SuiteRoot } from '../styles';
import { logCalls } from '../../util';

const TestId = {
  PLAIN_BUTTON: 'plain-button',
};

function FocusMonitorSuite() {
  return (
    <React.Fragment>
      <h1>Focus monitor</h1>
      <p>Set of tests for the focus monitor.</p>
      <article>
        <h2>Plain button</h2>
        <SuiteRoot>
          <div data-testid="previous-focusable" tabIndex={-1}>
            Previously focusable
          </div>
          <PlainButtonSuite
            spy={logCalls}
            data-testid={TestId.PLAIN_BUTTON}
          />
        </SuiteRoot>
      </article>
    </React.Fragment>
  );
}

export default FocusMonitorSuite;
