import React from 'react';
import Field from '../components/form/FormField/Field';
import Select from '../components/form/select/Select';
import ELEMENTS from './select-form/elements';
import Option from '../components/core/options/components/Option';

export default () => (
  <Field label={'A select'}>
    <Select value={58} placeholder={'Favorite element'}>
      { ELEMENTS.lanthanides.map(element => (
        <Option label={element.name} key={element.number} value={element.number}>{ element.name }</Option>
      )) }
    </Select>
  </Field>
);
