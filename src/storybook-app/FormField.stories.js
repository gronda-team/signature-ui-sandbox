import React from 'react';
import { storiesOf } from '@storybook/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormField, Suffix, Label, Hint } from '../lib/form-field';
import { Input } from '../lib/input';
import PrefixSuffix from './FormField/PrefixSuffix';
import AutofillExample from './FormField/AutofillExample';

storiesOf('FormField', module)
  .add('Available styles', () => (
    <div style={{ margin: '100px 20px' }}>
      <p>
        <FormField>
          <Label>Standard (default) form field</Label>
          <Input placeholder="Placeholder" />
          <Suffix>
            <FontAwesomeIcon icon="hand-point-left" />
          </Suffix>
          <Hint>Hint</Hint>
        </FormField>
      </p>
      <p>
        <FormField appearance="fill">
          <Label>Fill form field</Label>
          <Input placeholder="Placeholder" />
          <Suffix>
            <FontAwesomeIcon icon="hand-point-left" />
          </Suffix>
          <Hint>Hint</Hint>
        </FormField>
      </p>
    </div>
  ))
  .add('Prefixes and suffixes', () => (
    <PrefixSuffix />
  ))
  .add('Autofill monitor example', () => <AutofillExample />);
