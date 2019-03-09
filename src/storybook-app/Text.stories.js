import React from 'react';
import { storiesOf } from '@storybook/react';
import TextOverview from './Text/Overview';

storiesOf('Text', module)
  .add(
    'Overview',
    () => <TextOverview />,
  );
