import React from 'react';
import styled from 'styled-components';
import { Button } from '../../src/lib/Button';
import { Centered } from '../styles';
import { FormField, Label } from '../../src/lib/FormField';
import { Input } from '../../src/lib/Input';
import { Icon, useIconRegistry } from '../../src/lib/Icon';

const Panel = styled(Centered)`
  padding: 20px;
  border: solid 1px;
  border-radius: 8px;
  
  border-color: #F0F0F0;
  
  [data-sui-tree="form-field:root"] {
    display: block;
  }
`;

export default function FullWidthButtons() {
  const registry = useIconRegistry();

  React.useEffect(() => {
    registry.addSvgIconSetInNamespace('round', '/icons/icons.svg');
  }, []);

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordType, setPasswordType] = React.useState('password');

  const handleInputChange = React.useCallback((event) => {
    const target = event.target;
    switch (target.name) {
      case 'name':
        setUsername(target.value);
        break;
      case 'password':
        setPassword(target.value);
        break;
      default: break;
    }
  }, [setUsername, setPassword]);

  const togglePasswordType = React.useCallback(() => {
    setPasswordType(type => type === 'password' ? 'text' : 'password');
  }, [setPasswordType]);

  const iconName = React.useMemo(() => {
    if (passwordType === 'password') return 'round:lock-close';
    return 'round:lock-open';
  }, [passwordType]);

  return (
    <Panel>
      <FormField>
        <Label>Username</Label>
        <Input
          value={username}
          onChange={handleInputChange}
          name="name"
          required
        />
      </FormField>
      <FormField
        suffix={
          <Button type="icon" onClick={togglePasswordType}>
            <Icon name={iconName} />
          </Button>
        }
      >
        <Label>Password</Label>
        <Input
          value={password}
          onChange={handleInputChange}
          type={passwordType}
          name="password"
          required
        />
      </FormField>
      <Button full color="primary" appearance="fill">
        Log in
      </Button>
    </Panel>
  );
}
