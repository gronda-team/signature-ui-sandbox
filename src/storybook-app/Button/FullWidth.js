import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../lib/button';
import { FormField, Label, Suffix } from '../../lib/form-field';
import { Input } from '../../lib/input';
import { GREY } from '../../cdk/theme/colors';

const FormWrapper = styled.div`
width: 300px;
margin: 0 auto;
padding: 20px;
border: solid 1px ${GREY[300]};
`;

class FullWidth extends React.Component {
  constructor() {
    super();

    this.state = { password: '', username: '', type: 'password' };
  }

  updateText = key => (event) => {
    this.setState({ [key]: event.target.value });
  };

  toggleInputType = () => {
    this.setState(state => ({
      type: state.type === 'password' ?
        'text' :
        'password'
    }));
  };

  render() {
    return (
      <FormWrapper>
        <div style={{ margin: '16px 0 24px' }}>
          <FormField style={{ width: '100%' }}>
            <Label>Username</Label>
            <Input
              required
              value={this.state.username}
              onChange={this.updateText('username')}
              placeholder="Enter username"
            />
          </FormField>
          <FormField style={{ width: '100%' }}>
            <Label>Password</Label>
            <Input
              required
              type={this.state.type}
              value={this.state.password}
              onChange={this.updateText('password')}
              placeholder="Enter your password"
            />
            <Suffix>
              <FontAwesomeIcon
                style={{ cursor: 'pointer' }}
                onClick={this.toggleInputType}
                icon={this.state.type === 'password' ? 'eye' : 'eye-slash'}
              />
            </Suffix>
          </FormField>
        </div>
        <Button
          size="full"
          appearance="fill"
          disabled={!this.state.username || !this.state.password}
        >
          Submit
        </Button>
      </FormWrapper>
    );
  }
}

export default FullWidth;
