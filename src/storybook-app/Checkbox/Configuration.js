import React from 'react';
import styled from 'styled-components';
import { Checkbox } from '../../lib/checkbox';
import { ButtonToggle, ButtonToggleGroup } from '../../lib/button-toggle';
import { Divider } from '../../lib/divider';

const FormSection = styled.div`
margin: 16px 0;
`;

class CheckboxConfiguration extends React.Component {
  constructor() {
    super();

    this.state = {
      labelPosition: 'after',
      status: 'unchecked',
    };
  }

  handleCheckedState = ({ value }) => {
    this.setState({ status: value });
  };

  handleAlign = ({ value }) => {
    this.setState({ labelPosition: value });
  };

  toggle = () => {
    this.setState(state => ({
      status: state.status === 'checked' ?
        'unchecked' : 'checked'
    }));
  };

  render() {
    return (
      <div>
        <b>Checkbox configuration</b>
        <FormSection>
          <ButtonToggleGroup value={this.state.status} onChange={this.handleCheckedState}>
            <ButtonToggle value="unchecked">
              Unchecked
            </ButtonToggle>
            <ButtonToggle value="checked">
              Checked
            </ButtonToggle>
            <ButtonToggle value="indeterminate">
              Indeterminate
            </ButtonToggle>
          </ButtonToggleGroup>
        </FormSection>
        <FormSection>
          <ButtonToggleGroup value={this.state.labelPosition} onChange={this.handleAlign}>
            <ButtonToggle value="after">
              After
            </ButtonToggle>
            <ButtonToggle value="before">
              Before
            </ButtonToggle>
          </ButtonToggleGroup>
        </FormSection>
        <Divider />
        <Checkbox
          onChange={this.toggle}
          checked={this.state.status === 'checked'}
          indeterminate={this.state.status === 'indeterminate'}
          labelPosition={this.state.labelPosition}
        >
          I’m a checkbox
        </Checkbox>
      </div>
    );
  }
}

export default CheckboxConfiguration;
