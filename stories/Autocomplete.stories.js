import React from 'react';
import Overview from './Autocomplete/Overview';
import WithGroups from './Autocomplete/WithGroups';

export default {
  title: 'Autocomplete',
};

// Demonstrates simple implementation of an Autocomplete
export const overview = () => <Overview />;
overview.story = {
  name: 'Overview'
};

// Simple example with groups
export const withGroups = () => <WithGroups />;
withGroups.story = {
  name: 'with groups'
};
