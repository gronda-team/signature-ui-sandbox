import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PasswordReset from './views/settings/PasswordReset';
import UserSettings from './views/settings/UserSettings';
import Details from './views/job/Details';
import CreateStory from './views/story/CreateStory';
import JobPanels from './views/job/JobPanels';

class App extends Component {
  render() {
    return (
      <div className="App">
        <UserSettings />
      </div>
    );
  }
}

export default App;
