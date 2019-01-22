import * as React from 'react';
import _ from 'lodash';
import { Checkbox } from '../../../lib/checkbox';
import { Fieldset, Legend } from './../user-settings/styles/index';
import { SlideToggle } from '../../../lib/slide-toggle';

const EMAIL_NOTIFICATIONS = [
  {
    text: 'Job requests and applications',
    key: 'jobUpdates',
  },
  {
    text: 'New messages',
    key: 'messages',
  },
  {
    text: 'New job opportunities for your career',
    key: 'opportunities',
  },
  {
    text: 'Important tips & news',
    key: 'tips',
  },
  {
    text: 'Followers',
    key: 'followers',
  },
  {
    text: 'Activity on your story',
    key: 'storyActivity',
  },
  {
    text: 'New followers',
    key: 'newFollowers',
  },
];

const PRIVACY_NOTIFICATIONS = [
  {
    text: 'Show my profile in the Network',
    key: 'profileIsPublic',
  },
  {
    text: 'Show my profile in the team page of my connected company/companies',
    key: 'profileOnTeam',
  },
];

export default class Notifications extends React.Component {
  constructor() {
    super();
    
    this.state = {
      jobUpdates: false,
      messages: false,
      opportunities: false,
      tips: false,
      followers: false,
      storyActivity: false,
      newFollowers: false,
      mobileService: false,
      mobileNumber: '',
      profileIsPublic: true,
      profileOnTeam: true,
    };
  }
  
  changeNotification = (type) => () => {
    this.setState(state => ({
      [type]: !state[type],
    }));
  };
  
  changeMobileService = () => {
    this.setState(state => {
      const newService = !state.mobileService;
      return {
        mobileService: newService,
        mobileNumber: newService ? state.mobileNumber : '',
      };
    })
  };
  
  notificationToCheckmark = notification => (
    <Checkbox
      key={notification.key}
      onChange={this.changeNotification(notification.key)}
      checked={this.state[notification.key]}
      value={_.kebabCase(notification.key)}
    >
      { notification.text }
    </Checkbox>
  );
  
  render() {
    return (
      <React.Fragment>
        <Fieldset>
          <Legend>Email notifications</Legend>
          <p>What would you like to be informed about?</p>
          { EMAIL_NOTIFICATIONS.map(this.notificationToCheckmark)}
        </Fieldset>
        <Fieldset>
          <Legend>Mobile notifications</Legend>
          <p>Don’t miss any job offer with this cool service.</p>
          <SlideToggle
            checked={this.state.mobileService}
            onChange={this.changeMobileService}
          >
            Write me
          </SlideToggle>
        </Fieldset>
        <Fieldset>
          <Legend>Privacy</Legend>
          <p>Click <a>here</a> to inquire about your privacy rights.</p>
          { PRIVACY_NOTIFICATIONS.map(this.notificationToCheckmark)}
        </Fieldset>
      </React.Fragment>
    );
  }
}
