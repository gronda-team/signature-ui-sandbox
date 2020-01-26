import * as React from 'react';
import { SuiteRoot } from '../styles';
import { logCalls } from '../../util';
import { Checkbox } from '../../../../src/lib/Checkbox';

const TestId = {
  CHECKBOX: 'checkbox',
};

function CheckboxSuite() {
  const [checked, setChecked] = React.useState(false);

  const handleCheckChange = React.useCallback((event) => {
    setChecked(event.target.checked);
  }, [setChecked]);

  return (
    <React.Fragment>
      <h1>Checkbox</h1>
      <p>Simple checkbox end-to-end testing.</p>
      <SuiteRoot>
        <Checkbox
          spy={logCalls}
          checked={checked}
          onChange={handleCheckChange}
          data-testid={TestId.CHECKBOX}
        >Check me!</Checkbox>
      </SuiteRoot>
    </React.Fragment>
  );
}

export default CheckboxSuite;
