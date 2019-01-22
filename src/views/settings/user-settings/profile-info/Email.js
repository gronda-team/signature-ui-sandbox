import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormField } from '../../../../lib/form-field/index';
import Input from '../../../../lib/input/Input';

export default function Email(props) {
  return (
    <FormField label={props.label} style={{ display: 'block' }}>
      <Input
        type="email"
        value={props.value}
        onChange={props.onChange}
        required={props.required}
        name="email"
        autocomplete="email"
      />
    </FormField>
  )
}

Email.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func,
};

Email.defaultProps = {
  label: 'Email',
  value: '',
  required: false,
  onChange: _.noop,
};
