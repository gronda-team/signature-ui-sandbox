import * as React from 'react';
import _ from 'lodash';
import Field from '../components/form/FormField/Field';
import Select from '../components/form/select/Select';
import Option from '../components/core/options/components/Option';
import ELEMENTS from './select-form/elements';
import OptGroup from '../components/core/options/components/OptGroup';
import Hint from '../components/form/FormField/Hint';


export default class SelectForm extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: [57],
    };
    
    this.KEY_ELEMENTS = _.keyBy(ELEMENTS.lanthanides, 'number');
  }
  
  onSelect = ({ added, removed }) => {
    this.setState(state => ({
      selected: added ? [...state.selected, added] : _.without(state.selected, removed),
    }));
  };
  
  renderHints = () => (
    <Hint>Radioactive elements only.</Hint>
  );
  
  render() {
    return (
      <Field label={'Favorite element'} hint={this.renderHints()}>
        <Select multiple onChange={console.log} value={this.state.selected} placeholder={'Favorite element'}>
          { _.entries(ELEMENTS).map(([type, elements]) => (
            <OptGroup label={type} key={type}>
              { elements.map(element => (
                <Option label={element.name} key={element.number} value={element.number}>{ element.name }</Option>
              )) }
            </OptGroup>
          ))}
        </Select>
      </Field>
    )
  }
};