import React from 'react';
import { storiesOf } from '@storybook/react';
import ButtonToggleOverview from './ButtonToggle/Overview';
import { CenteredDecorator } from './styles';

storiesOf('ButtonToggle', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <ButtonToggleOverview />);
