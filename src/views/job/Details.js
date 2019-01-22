import * as React from 'react';
import _ from 'lodash';
import ELEMENTS from '../select-form/elements';
import FormField from '../../lib/form-field/FormField';
import Select from '../../lib/select/Select';
import Option from '../../lib/core/option/Option';

export default class Details extends React.Component {
  constructor() {
    super();
    
    this.state = {
      value: 58,
    };
  }
  
  onChange = ({ added }) => {
    this.setState({
      value: _.head(added),
    });
  };
  
  render() {
    return (
      <FormField label={'Favorite element'}>
        <Select onChange={this.onChange} value={this.state.value} placeholder={'Lanthanide'}>
          { ELEMENTS.lanthanides.map(element => (
            <Option viewValue={element.name} key={element.number} value={element.number}>{ element.name }</Option>
          )) }
        </Select>
      </FormField>
    );
  }
}
