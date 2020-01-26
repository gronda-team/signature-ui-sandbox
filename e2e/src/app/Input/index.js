import * as React from 'react';
import { TestId } from './constants';
import AutosizeSuite from './Autosize';

function InputSuite() {
  return (
    <React.Fragment>
      <h1>Input</h1>
      <p>Input with end to end testing.</p>
      <section data-testid={TestId.TEXTAREA_AUTOSIZE}>
        <h2>Textarea Autosize</h2>
        <AutosizeSuite />
      </section>
    </React.Fragment>
  );
}

export default InputSuite;
