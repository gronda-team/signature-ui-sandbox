import React from 'react';
import { storiesOf } from '@storybook/react';
import InputOverview from './Input/Overview';
import InputPrefixSuffix from './Input/PrefixSuffix';
import InputHints from './Input/Hints';
import { CenteredDecorator } from './styles';
// import inputOverview from './Input/notes/InputOverview.md';

storiesOf('Input', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add(
    'Overview',
    () => <InputOverview />,
    // { notes: { markdown: inputOverview } },
  )
  .add('with prefixes and suffixes', () => <InputPrefixSuffix />)
  .add('with hints', () => <InputHints />);
