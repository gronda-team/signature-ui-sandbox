import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Field from '../lib/form-field/FormField';
import Hint from '../lib/form-field/Hint';
import Input from '../lib/input/Input';

export default class Form extends React.Component {
  constructor() {
    super();
    this.state = {
      value: 'a',
      firstRequired: true,
      lastRequired: true,
    };
  }
  
  onChangeRequired = which => () => {
    this.setState((state) => {
      const key = which === 'first' ? 'firstRequired' : 'lastRequired';
      return {
        [key]: !state[key],
      };
    });
  };
  
  onChange = (event) => {
    this.setState({ value: event.target.value });
  };
  
  render() {
    return (
      <Field
        appearance={'outline'}
        label={'Cost per kg'}
        prefix={<FontAwesomeIcon onClick={this.onChangeRequired('first')} icon="dollar-sign" />}
      >
        <Input
          value={this.state.value}
          onChange={this.onChange}
          required={this.state.firstRequired}
          placeholder={'3.00'}
        />
        <Hint>Including SafePack™ weight</Hint>
      </Field>
    )
  }
};