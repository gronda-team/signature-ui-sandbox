import React from 'react';
import { storiesOf } from '@storybook/react';
import { CenteredDecorator } from './styles';
import RadioOverview from './Radio/Overview';

storiesOf('Radio Button', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <RadioOverview />);
