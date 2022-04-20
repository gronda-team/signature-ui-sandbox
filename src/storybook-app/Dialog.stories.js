import React from 'react';
import { storiesOf } from '@storybook/react';
import dialogOverview from './Dialog/notes/DialogOverview.md';

storiesOf('Dialog', module)
  .add(
    'Overview',
    () => <div>To be done</div>,
    { notes: { markdown: dialogOverview } },
  );
