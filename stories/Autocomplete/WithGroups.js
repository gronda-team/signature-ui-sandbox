import React from 'react';
import { FormField, Label } from '../../src/lib/FormField';
import { Input } from '../../src/lib/Input';
import { Autocomplete } from '../../src/lib/Autocomplete';
import { OptGroup, Option } from '../../src/lib/core';
import { Centered } from '../styles';

const filterByName = (namesArray, value) => {
  const filterValue = value.toLowerCase();
  return namesArray.filter(name => name.toLowerCase().indexOf(filterValue) === 0);
};

function WithGroups() {
  const [value, setValue] = React.useState('');
  /**
   * @type {React.MutableRefObject<{ letter: string, names: string[] }[]>}
   */
  const stateGroups = React.useRef([{
    letter: 'A',
    names: ['Alabama', 'Alaska', 'Arizona', 'Arkansas']
  }, {
    letter: 'C',
    names: ['California', 'Colorado', 'Connecticut']
  }, {
    letter: 'D',
    names: ['Delaware']
  }, {
    letter: 'F',
    names: ['Florida']
  }, {
    letter: 'G',
    names: ['Georgia']
  }, {
    letter: 'H',
    names: ['Hawaii']
  }, {
    letter: 'I',
    names: ['Idaho', 'Illinois', 'Indiana', 'Iowa']
  }, {
    letter: 'K',
    names: ['Kansas', 'Kentucky']
  }, {
    letter: 'L',
    names: ['Louisiana']
  }, {
    letter: 'M',
    names: ['Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana']
  }, {
    letter: 'N',
    names: ['Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota']
  }, {
    letter: 'O',
    names: ['Ohio', 'Oklahoma', 'Oregon']
  }, {
    letter: 'P',
    names: ['Pennsylvania']
  }, {
    letter: 'R',
    names: ['Rhode Island']
  }, {
    letter: 'S',
    names: ['South Carolina', 'South Dakota']
  }, {
    letter: 'T',
    names: ['Tennessee', 'Texas']
  }, {
    letter: 'U',
    names: ['Utah']
  }, {
    letter: 'V',
    names: ['Vermont', 'Virginia']
  }, {
    letter: 'W',
    names: ['Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
  }]);

  const filteredStates = React.useMemo(() => (
    value ?
      stateGroups.current
        .map(group => ({ letter: group.letter, names: filterByName(group.names, value) }))
        .filter(group => group.names.length > 0) :
      stateGroups.current
  ), [value]);

  const onChange = React.useCallback((event) => {
    setValue(event.target.value);
  }, [setValue]);

  return (
    <Centered data-size="large">
      <FormField style={{ width: '400px' }}>
        <Label>Favorite state</Label>
        <Input value={value} onChange={onChange} placeholder="States group" data-sui-autocomplete />
        <Autocomplete>
          { filteredStates.map(group => (
            <OptGroup data-list-key={group.letter} label={group.letter} key={group.letter}>
              { group.names.map(state => (
                <Option data-list-key={state} value={state} key={state}>
                  <span>{ state }</span>
                </Option>
              )) }
            </OptGroup>
          )) }
        </Autocomplete>
      </FormField>
    </Centered>
  );
}

export default WithGroups;
