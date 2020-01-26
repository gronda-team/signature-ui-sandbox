import React from 'react';
import styled from 'styled-components';
import { Button } from '../../src/lib/Button';
import { Centered } from '../styles';
import { FormField, Label } from '../../src/lib/FormField';
import { Input } from '../../src/lib/Input';

const InlineForm = styled.div`
  [data-sui="form-field"] + [data-sui="button"] {
    margin-left: 12px;
    margin-right: auto;
  }
  
  [dir="rtl"] & [data-sui="form-field"] + [data-sui="button"] {
    margin-left: auto;
    margin-right: 12px;
  } 
`;

export default function InlineButton() {
  const [email, setEmail] = React.useState('');

  const handleEmailChange = React.useCallback((event) => {
    setEmail(event.target.value);
  }, [setEmail]);

  return (
    <Centered data-size="large">
      <h1 data-sui-typography="h2">
        Inline buttons and form fields
      </h1>
      <p>This demonstrates how <b>button</b> components can inline nicely with <b>form field</b> components without any extra effort.</p>
      <InlineForm>
        <FormField>
          <Label>Email</Label>
          <Input required value={email} type="email" onChange={handleEmailChange} />
        </FormField>
        <Button appearance="fill" color="primary">
          Invite
        </Button>
      </InlineForm>
    </Centered>
  );
}
