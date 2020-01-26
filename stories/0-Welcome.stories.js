import React from 'react';
import { Welcome } from '@storybook/react/demo';
import { Centered } from './styles';

export default {
  title: 'Welcome',
};

function SignatureUISplash() {
  return (
    <Centered data-size="large" data-sui-typography>
      <h1>Welcome to Signature UI&nbsp;<sup>v3</sup></h1>
      <p>Signature UI has several UI components ready to use.</p>
      <p>Version 3 is currently in <b>active development</b>. Please check out some component demos
        {' '}in the sidebar.</p>
    </Centered>
  );
}

export const toStorybook = () => <SignatureUISplash />;

toStorybook.story = {
  name: 'About',
};
