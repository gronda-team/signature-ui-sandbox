import React from 'react';
import { Input } from '../../src/lib/Input';
import { FormField, Hint, Label } from '../../src/lib/FormField';

export default function Basic() {
  const [value, setValue] = React.useState('');

  const onChangeValue = React.useCallback((event) => {
    setValue(event.target.value);
  }, [setValue]);

  return (
    <FormField>
      <Label>Username</Label>
      <Input
        value={value}
        onChange={onChangeValue}
      />
      <Hint align="start">6 characters minimum</Hint>
    </FormField>
  );
}
