import React from 'react';
import styled from 'styled-components';
import { Button } from '../../lib/button';
import { FormField, Label } from '../../lib/form-field';
import { Input } from '../../lib/input';

const FormWrapper = styled.div`
width: 300px;
margin: 0 auto;
`;

class InlineForm extends React.Component {
  constructor() {
    super();

    this.state = { name: '' };
  }

  updateText = key => (event) => {
    this.setState({ [key]: event.target.value });
  };

  render() {
    return (
      <FormWrapper>
        <FormField style={{ marginTop: '20px', width: '200px' }}>
          <Label>Name</Label>
          <Input
            value={this.state.name}
            onChange={this.updateText('name')}
            placeholder="Johnny Appleseed"
          />
        </FormField>
        <Button
          appearance="fill"
          style={{ marginLeft: '8px' }}
        >
          Invite
        </Button>
      </FormWrapper>
    );
  }
}

export default InlineForm;
