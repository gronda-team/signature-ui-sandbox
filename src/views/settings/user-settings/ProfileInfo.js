import * as React from 'react';
import { Fieldset, Legend } from './../user-settings/styles/index';
import Password from './profile-info/Password';
import Email from './profile-info/Email';

export default class ProfileInfo extends React.Component {
  constructor() {
    super();
    
    this.state = {
      changeEmailPWField: '',
      changeEmailNewEmailField: '',
      changePasswordCurrentField: '',
      changePasswordNewField: '',
    };
  }
  
  changeTextState = which => (event) => {
    this.setState({ [which]: event.target.value });
  };
  
  render() {
    return (
      <React.Fragment>
        <Fieldset style={{ width: '200px' }}>
          <Legend>Update email</Legend>
          <Password
            label={'Current password'}
            type={'current'}
            value={this.state.changeEmailPWField}
            onChange={this.changeTextState('changeEmailPWField')}
          />
          <Email
            label={'New email'}
            value={this.state.changeEmailNewEmailField}
            onChange={this.changeTextState('changeEmailNewEmailField')}
          />
        </Fieldset>
        <Fieldset style={{ width: '200px' }}>
          <Legend>Update password</Legend>
          <Password
            label={'Current password'}
            type={'current'}
            value={this.state.changePasswordCurrentField}
            onChange={this.changeTextState('changePasswordCurrentField')}
          />
          <Password
            label={'New password'}
            type={'new'}
            value={this.state.changePasswordNewField}
            onChange={this.changeTextState('changePasswordNewField')}
          />
        </Fieldset>
      </React.Fragment>
    );
  }
}
