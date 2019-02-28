import React from 'react';
import { storiesOf } from '@storybook/react';
import DialogExample from './Dialog/Overview';
import dialogOverview from './Dialog/notes/DialogOverview.md';

storiesOf('Dialog', module)
  .add(
    'Overview',
    () => <DialogExample />,
    { notes: { markdown: dialogOverview } },
  );
