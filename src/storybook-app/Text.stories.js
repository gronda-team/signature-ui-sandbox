import React from 'react';
import { storiesOf } from '@storybook/react';
import TextOverview from './Text/Overview';
import { CenteredDecorator } from './styles';

storiesOf('Text', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add(
    'Overview',
    () => <TextOverview />,
  );
