import React from 'react';
import { Input } from '../../src/lib/Input';
import { FormField, Hint, Label } from '../../src/lib/FormField';

export default function TextareaAutosize() {
  const [value, setValue] = React.useState('');

  const onChangeValue = React.useCallback((event) => {
    setValue(event.target.value);
  }, [setValue]);

  return (
    <FormField style={{ width: '300px' }}>
      <Label>Review</Label>
      <Input
        as="textarea"
        autosizeEnabled
        autosizeMinRows={2}
        autosizeMaxRows={4}
        value={value}
        onChange={onChangeValue}
        required
      />
    </FormField>
  );
}
