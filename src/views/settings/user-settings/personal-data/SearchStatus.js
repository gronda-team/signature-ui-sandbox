import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ButtonToggleGroup, ButtonToggle } from '../../../../lib/button-toggle/index';
import { Fieldset, Legend } from '../styles/index';

export default function SearchStatus(props) {
  return (
    <Fieldset>
      <Legend>Search status for jobs</Legend>
      <p>
        Your search status determines whether or not you’ll be shown to companies, and if you’ll receive job offers.
        By selecting <b>Not available</b>, you won’t receive job offers from companies directly, but you can still apply to job postings as normal.
      </p>
      <ButtonToggleGroup
        value={props.value}
        onChange={props.onChange}
      >
        <ButtonToggle value={'M'}>Actively looking</ButtonToggle>
        <ButtonToggle value={'F'}>Open for offers</ButtonToggle>
        <ButtonToggle value={'X'}>Not available</ButtonToggle>
      </ButtonToggleGroup>
    </Fieldset>
  )
}

SearchStatus.propTypes = {
  value: PropTypes.oneOf([1, 2, 3]),
  onChange: PropTypes.func,
};

SearchStatus.defaultProps = {
  value: null,
  onChange: _.noop,
};
