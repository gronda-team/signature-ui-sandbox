import * as React from 'react';
import _ from 'lodash';
import Password from './password-reset/Password';

export default class PasswordReset extends React.Component {
  constructor() {
    super();
    
    this.state = {
      old: '',
      verify: '',
    };
  }
  
  setPassword = (type) => (event) => {
    this.setState({
      [type]: event.target.value,
    });
  };
  
  render() {
    return (
      <div>
        <Password
          key={'old'}
          label={'Old password'}
          value={this.state.old}
          onChange={this.setPassword('old')}
        />
        <Password
          key={'verify'}
          label={'New password'}
          value={this.state.verify}
          onChange={this.setPassword('verify')}
        />
      </div>
    );
  }
}
