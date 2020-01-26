import React from 'react';
import { FormField, Label } from '../../src/lib/FormField';
import { Input } from '../../src/lib/Input';
import { Autocomplete } from '../../src/lib/Autocomplete';
import { Option } from '../../src/lib/core';
import { Centered } from '../styles';

function Overview() {
  const [value, setValue] = React.useState('');
  /**
   * @type {React.MutableRefObject<{ code: string, name: string }[]>}
   */
  const states = React.useRef([
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ]);

  const filteredStates = React.useMemo(() => (
    value ?
      states.current.filter(state => state.name.match(new RegExp(value, 'gi'))) :
      states.current
  ), [value]);

  const displayFn = React.useCallback((state) => {
    return state ? state.name : state;
  }, []);

  const onChange = React.useCallback((event) => {
    setValue(event.target.value);
  }, [setValue]);

  return (
    <Centered data-size="large">
      <FormField style={{ width: '400px' }}>
        <Label>Favorite state</Label>
        <Input
          value={value}
          onChange={onChange}
          data-sui-autocomplete
        />
        <Autocomplete displayWith={displayFn}>
          { filteredStates.map(state => (
            <Option key={state.code} data-list-key={state.code} value={state}>
              <span>{ state.code }: { state.name }</span>
            </Option>
          )) }
        </Autocomplete>
      </FormField>
    </Centered>
  );
}

export default Overview;
