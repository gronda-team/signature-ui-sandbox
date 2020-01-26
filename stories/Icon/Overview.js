import React from 'react';
import { Input } from '../../src/lib/Input';
import { Button } from '../../src/lib/Button';
import { FormField, Hint, Label } from '../../src/lib/FormField';
import { useIconRegistry, Icon } from '../../src/lib/Icon';

export default function Overview() {
  const registry = useIconRegistry();

  React.useEffect(() => {
    registry.addSvgIconSetInNamespace('round', '/icons/icons.svg');
  }, []);

  const [strokedValue, setStrokedValue] = React.useState('');
  const [inputType, setInputType] = React.useState('password');

  const onChangeStrokedValue = React.useCallback((event) => {
    setStrokedValue(event.target.value);
  }, [setStrokedValue]);

  const iconName = React.useMemo(() => (
    `round:${inputType === 'password' ? 'lock-close' : 'lock-open'}`
  ), [inputType]);

  const clickIcon = React.useCallback(() => {
    setInputType(type => type === 'password' ? 'text' : 'password');
  }, [setInputType]);

  return (
    <div style={{ width: '100%', maxWidth: '300px' }}>
      <FormField
        appearance="stroked"
        style={{ display: 'block' }}
        suffix={
          <Button size="small" onClick={clickIcon} type="icon" color="grey">
            <Icon aria-hidden={false} name={iconName} />
          </Button>
        }
      >
        <Label>Password</Label>
        <Input
          type={inputType}
          value={strokedValue}
          onChange={onChangeStrokedValue}
          required
        />
        <Hint align="start">6 characters minimum</Hint>
      </FormField>
    </div>
  );
}
