import React from 'react';
import { storiesOf } from '@storybook/react';
import Overview from './Tags/Overview';
import WithAutocomplete from './Tags/WithAutocomplete';
import { CenteredDecorator } from './styles';

storiesOf('Tags', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <Overview />)
  .add('With <Autocomplete> panel', () => <WithAutocomplete />);
