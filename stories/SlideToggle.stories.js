import React from 'react';
import Overview from './SlideToggle/Overview';

export default {
  title: 'Slide toggle',
};

export const toStorybook = () => <Overview />;

toStorybook.story = {
  name: 'Overview',
};
