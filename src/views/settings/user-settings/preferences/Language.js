import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormField } from '../../../../lib/form-field/index';
import { Hint } from '../../../../lib/form-field/exports';
import Select from '../../../../lib/select/Select';
import Option from '../../../../lib/core/option/Option';

const LANGUAGES = [
  { value: 'en', text: 'English' },
  { value: 'de', text: 'Deutsch' },
  { value: 'sp', text: 'Español' },
  { value: 'fr', text: 'Français' },
  { value: 'it', text: 'Italiano' },
  { value: 'hu', text: 'Magyar' },
].map(language => ({
  ...language,
  id: _.uniqueId('language:'),
}));

export default function Language(props) {
  return (
    <FormField style={{ display: 'block', width: '400px' }} label={'User language'}>
      <Select
        value={props.value}
        onSelect={props.onSelect}
      >
        { LANGUAGES.map(language => (
          <Option key={language.id} viewValue={language.text}>{ language.text }</Option>
        ))}
      </Select>
      <Hint>In beta</Hint>
    </FormField>
  )
}

Language.propTypes = {
  value: PropTypes.string,
  onSelect: PropTypes.func,
};

Language.defaultProps = {
  value: '',
  onSelect: _.noop,
};
