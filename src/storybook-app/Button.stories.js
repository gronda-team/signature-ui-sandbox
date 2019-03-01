import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '../lib/button';
import ButtonOverview from './Button/Overview';
import ButtonAnchorTag from './Button/AnchorTag';
import ButtonFullWidth from './Button/FullWidth';
import ButtonInlineForm from './Button/InlineForm';
import ButtonIcons from './Button/IconButtons';
import { CenteredDecorator } from './styles';

storiesOf('Button', module)
  .addDecorator(story => <CenteredDecorator>{ story() }</CenteredDecorator>)
  .add('Overview', () => <ButtonOverview />)
  .add('as <a /> tags', () => <ButtonAnchorTag />)
  .add('as full width', () => <ButtonFullWidth />)
  .add('as icons', () => <ButtonIcons />)
  .add('with inline form fields', () => <ButtonInlineForm />);
