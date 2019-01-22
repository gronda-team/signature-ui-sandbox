import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { TAB, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, PAGE_DOWN, PAGE_UP, HOME, END } from '../core/keys';

export default class Card extends React.Component {
  onKeyDown = (event) => {
    const { key } = event;
    switch (key) {
      case ARROW_DOWN:
      case PAGE_DOWN:
      
    }
  };
  
  render() {
  
  }
}