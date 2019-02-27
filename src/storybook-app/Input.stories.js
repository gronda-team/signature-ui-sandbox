import React from 'react';
import { storiesOf } from '@storybook/react';
import InputOverview from './Input/Overview';
import { CenteredDecorator } from './styles';
// import inputOverview from './Input/notes/InputOverview.md';

storiesOf('Input', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add(
    'Overview',
    () => <InputOverview />,
    // { notes: { markdown: inputOverview } },
  );
