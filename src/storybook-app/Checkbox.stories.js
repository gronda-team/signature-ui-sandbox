import React from 'react';
import { storiesOf } from '@storybook/react';
import { CenteredDecorator } from './styles';
import CheckboxOverview from './Checkbox/Overview';
import CheckboxConfiguration from './Checkbox/Configuration';

storiesOf('Checkbox', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <CheckboxOverview />)
  .add('with configurations', () => <CheckboxConfiguration />);
