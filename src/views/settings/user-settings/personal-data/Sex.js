import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ButtonToggleGroup, ButtonToggle } from '../../../../lib/button-toggle/index';
import { Fieldset, Legend } from '../styles/index';

export default function Sex(props) {
  return (
    <Fieldset>
      <Legend>Sex</Legend>
      <ButtonToggleGroup
        value={props.value}
        onChange={props.onChange}
      >
        <ButtonToggle value={'M'}>Male</ButtonToggle>
        <ButtonToggle value={'F'}>Female</ButtonToggle>
        <ButtonToggle value={'X'}>Prefer not to say</ButtonToggle>
      </ButtonToggleGroup>
    </Fieldset>
  )
}

Sex.propTypes = {
  value: PropTypes.oneOf(['M', 'F', 'X']),
  onChange: PropTypes.func,
};

Sex.defaultProps = {
  value: null,
  onChange: _.noop,
};
