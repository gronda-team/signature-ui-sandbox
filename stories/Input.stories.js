import React from 'react';
import Basic from './Input/Basic';
import TextareaAutosize from './Input/Autosize';

export default {
  title: 'Input',
};

export const toStorybook = () => <Basic />;

toStorybook.story = {
  name: 'Basic inputs',
};

export const textareaAutosize = () => <TextareaAutosize />;

textareaAutosize.story = {
  name: 'Textarea autosize',
};
