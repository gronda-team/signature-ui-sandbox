import React from 'react';
import { storiesOf } from '@storybook/react';
import CheckboxOverview from './Checkbox/Overview';
import { CenteredDecorator } from './styles';

storiesOf('Checkbox', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <CheckboxOverview />);
