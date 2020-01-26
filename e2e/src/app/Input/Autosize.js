import * as React from 'react';
import { Input } from '../../../../src/lib/Input';
import { FormField } from '../../../../src/lib/FormField';
import { TestId } from './constants';

function AutosizeSuite() {
  const [autosizeText, setAutosizeText] = React.useState('');
  const [{ mounted, ...autosizeProps }, setAutosizeProps] = React.useState({
    mounted: true,
    autosizeEnabled: true,
    autosizeMinRows: null,
    autosizeMaxRows: null,
  });

  const onChange = React.useCallback((event) => {
    setAutosizeText(event.target.value);
  }, [setAutosizeText]);

  React.useEffect(() => {
    if (window.Cypress) {
      window.setAutosizeProps = setAutosizeProps;
    }

    return () => {
      delete window.setAutosizeProps;
    };
  }, []);

  return mounted ? (
    <FormField data-testid={TestId.TEXTAREA_AUTOSIZE}>
      <Input
        as="textarea"
        onChange={onChange}
        name="autosize"
        value={autosizeText}
        {...autosizeProps}
      />
    </FormField>
  ) : <div />;
}

export default AutosizeSuite;
