import React from 'react';
import Overview from './Button/Overview';
import IconButtons from './Button/Icon';
import StrokedButton from './Button/Stroked';
import ButtonWeights from './Button/Weights';
import FullWidthButtons from './Button/FullWidth';
import InlineButtons from './Button/Inline';

export default {
  title: 'Button',
};

// Demonstrates all of the button appearances
export const overview = () => <Overview />;
overview.story = {
  name: 'Overview'
};

// Demonstrates icon buttons
export const icon = () => <IconButtons />;
icon.story = {
  name: 'Icon buttons',
};

// Demonstrates stroked buttons
export const strokedButtons = () => <StrokedButton />;
strokedButtons.story = {
  name: 'Stroked buttons',
};

// Demonstrates font weights for buttons
export const buttonWeights = () => <ButtonWeights />;
buttonWeights.story = {
  name: 'Button text weights',
};

// Demonstrates buttons at full width
export const fullWidthButtons = () => <FullWidthButtons />;
fullWidthButtons.story = {
  name: 'Full width button',
};

// Demonstrates buttons inline with form fields
export const inlineButtons = () => <InlineButtons />;
inlineButtons.story = {
  name: 'Inline buttons',
};
