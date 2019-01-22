import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Fieldset, InlineFormField, Legend } from '../styles/index';
import { FormField } from '../../../../lib/form-field/index';
import Input from '../../../../lib/input/Input';

export default function Name(props) {
  return (
    <Fieldset spellCheck={false}>
      <Legend>Name</Legend>
      <InlineFormField>
        <FormField label={'First name'}>
          <Input name="fname" autocomplete="given-name" required value={props.firstName} onChange={props.onChangeFirstName} placeholder={'Johnny'} />
        </FormField>
      </InlineFormField>
      <InlineFormField>
        <FormField label={'Last name'}>
          <Input name="lname" autocomplete="family-name" required value={props.lastName} onChange={props.onChangeLastName} placeholder={'Grondaman'} />
        </FormField>
      </InlineFormField>
    </Fieldset>
  )
}

Name.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  onChangeFirstName: PropTypes.func,
  onChangeLastName: PropTypes.func,
};

Name.defaultProps = {
  firstName: '',
  lastName: '',
  onChangeFirstName: _.noop,
  onChangeLastName: _.noop,
};
