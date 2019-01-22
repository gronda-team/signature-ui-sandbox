import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormField } from '../../../../lib/form-field/index';
import { TextArea } from '../../../../lib/input/Input';
import { Hint } from '../../../../lib/form-field/exports';

export default function Description(props) {
  return (
    <FormField style={{ display: 'block', width: '400px' }} label={'About me'}>
      <TextArea value={props.value} onChange={props.onChange} placeholder={'Star chef'} />
      <Hint>Briefly describe yourself in one or two sentences.</Hint>
    </FormField>
  )
}

Description.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

Description.defaultProps = {
  value: '',
  onChange: _.noop,
};
