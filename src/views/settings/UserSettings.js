import * as React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import {
  Accordion, ExpansionPanelHeader, ExpansionPanel,
  ExpansionPanelTitle, ExpansionPanelActionRow
} from '../../lib/expansion';
import { Button } from '../../lib/button';
import PersonalData from './user-settings/PersonalData';
import Notifications from './user-settings/Notifications';
import ProfileInfo from './user-settings/ProfileInfo';
import Language from './user-settings/preferences/Language';

const View = styled.div`
height: 69px;
`;

export default class UserSettings extends React.Component {
  constructor() {
    super();
    
    this.state = {
      // accordion
      active: null,
      view: true,
      language: 'de',
    };
    
    this.FORM_IDS = {
      PERSONAL_DATA: 'user-settings/personal-data',
      CONTACT: 'user-settings/contact',
      PROFILE_INFO: 'user-settings/profile-info',
      NOTIFICATIONS: 'user-settings/notifications',
    };
  }
  
  componentDidMount() {
    _.delay(() => {
      this.setState({ view: false });
    }, 2000);
  }
  
  getView = (view) => {
    this.VIEW = view;
  };
  
  onSelect = (event) => {
    this.setState({
      active: event.opened || null,
    });
  };
  
  onChangeLanguage = (value) => {
    console.log(value);
  };
  
  submitForm = (event) => {
    event.preventDefault();
  };
  
  render() {
    return (
      <React.Fragment>
        <Language value={this.state.language} onSelect={this.onChangeLanguage} />
        <Accordion onSelect={this.onSelect} expanded={this.state.active}>
          <ExpansionPanel>
            <ExpansionPanelHeader>
              <ExpansionPanelTitle>Personal data</ExpansionPanelTitle>
            </ExpansionPanelHeader>
            <form id={this.FORM_IDS.PERSONAL_DATA} onSubmit={this.submitForm}>
              <PersonalData />
            </form>
            <ExpansionPanelActionRow>
              <Button color={'secondary'} type={'stroked'}>Cancel</Button>
              <Button type="submit" color={'primary'} form={this.FORM_IDS.NOTIFICATIONS}>Save</Button>
            </ExpansionPanelActionRow>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelHeader>
              <ExpansionPanelTitle>Profile information</ExpansionPanelTitle>
            </ExpansionPanelHeader>
            <form id={this.FORM_IDS.PROFILE_INFO} onSubmit={this.submitForm}>
              <ProfileInfo />
            </form>
            <ExpansionPanelActionRow>
              <Button color={'secondary'} type={'stroked'}>Cancel</Button>
              <Button type="submit" color={'primary'} form={this.FORM_IDS.PROFILE_INFO}>Save</Button>
            </ExpansionPanelActionRow>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelHeader>
              <ExpansionPanelTitle>Notifications</ExpansionPanelTitle>
            </ExpansionPanelHeader>
            <form id={this.FORM_IDS.NOTIFICATIONS} onSubmit={this.submitForm}>
              <Notifications />
              { this.state.view ? <View innerRef={this.getView} /> : null }
            </form>
            <ExpansionPanelActionRow>
              <Button color={'secondary'} type={'stroked'}>Cancel</Button>
              <Button type="submit" color={'primary'} form={this.FORM_IDS.NOTIFICATIONS}>Save</Button>
            </ExpansionPanelActionRow>
          </ExpansionPanel>
        </Accordion>
      </React.Fragment>
    );
  }
}
