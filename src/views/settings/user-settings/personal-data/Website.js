import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormField, Hint } from '../../../../lib/form-field/index';
import Input from '../../../../lib/input/Input';

export default function Website(props) {
  return (
    <FormField label={'Website'} style={{ width: '400px', display: 'block' }}>
      <Input value={props.value} onChange={props.onChange} placeholder={'http://gronda.eu'} />
      <Hint>Link to your Facebook, Instagram, or your own personal website.</Hint>
    </FormField>
  )
}

Website.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

Website.defaultProps = {
  value: '',
  onChange: _.noop,
};
