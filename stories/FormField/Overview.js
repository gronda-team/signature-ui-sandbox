import React from 'react';
import { Input } from '../../src/lib/Input';
import { FormField, Hint, Label } from '../../src/lib/FormField';

export default function Overview() {
  const [defaultValue, setDefaultValue] = React.useState('');
  const [strokedValue, setStrokedValue] = React.useState('');

  const onChangeDefaultValue = React.useCallback((event) => {
    setDefaultValue(event.target.value);
  }, [setDefaultValue]);

  const onChangeStrokedValue = React.useCallback((event) => {
    setStrokedValue(event.target.value);
  }, [setStrokedValue]);

  return (
    <div style={{ width: '100%', maxWidth: '300px' }}>
      <FormField style={{ display: 'block' }}>
        <Label>Username</Label>
        <Input
          value={defaultValue}
          onChange={onChangeDefaultValue}
        />
        <Hint align="start">6 characters minimum</Hint>
      </FormField>
      <FormField appearance="stroked" style={{ display: 'block' }}>
        <Label>Username</Label>
        <Input
          value={strokedValue}
          onChange={onChangeStrokedValue}
          required
        />
        <Hint align="start">6 characters minimum</Hint>
      </FormField>
    </div>
  );
}
