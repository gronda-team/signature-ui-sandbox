import * as React from 'react';
import _ from 'lodash';
import Sex from './../user-settings/personal-data/Sex';
import Name from './../user-settings/personal-data/Name';
import Website from './../user-settings/personal-data/Website';
import SearchStatus from './../user-settings/personal-data/SearchStatus';
import Description from './../user-settings/personal-data/Description';
import { Fieldset, Legend } from './../user-settings/styles/index';

export default class PersonalData extends React.Component {
  constructor() {
    super();
    
    this.state = {
      sex: null,
      firstName: '',
      lastName: '',
      website: '',
      description: '',
    };
  }
  
  changeSex = ({ added = [] }) => {
    this.setState({ sex: _.head(added) });
  };
  
  changeSearchStatus = ({ added = [] }) => {
    this.setState({ searchStatus: _.head(added) });
  };
  
  changeTextState = which => (event) => {
    this.setState({ [which]: event.target.value });
  };
  
  render() {
    return (
      <React.Fragment>
        <Sex value={this.state.sex} onChange={this.changeSex} />
        <Name
          firstName={this.state.firstName}
          lastName={this.state.lastName}
          onChangeFirstName={this.changeTextState('firstName')}
          onChangeLastName={this.changeTextState('lastName')}
        />
        <Fieldset>
          <Legend>Bio</Legend>
          <Website value={this.state.website} onChange={this.changeTextState('website')} />
          <Description value={this.state.description} onChange={this.changeTextState('description')} />
        </Fieldset>
        <SearchStatus value={this.state.searchStatus} onChange={this.changeSearchStatus}/>
      </React.Fragment>
    );
  }
}
