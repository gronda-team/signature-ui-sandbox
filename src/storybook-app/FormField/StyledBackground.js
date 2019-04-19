import React from 'react';
import styled from 'styled-components';
import {FormField, Label} from '../../lib/form-field';
import { Input } from '../../lib/input';
import { GREY } from '../../cdk/theme/colors';

/**
 * Target the `data-hook=form-field-bar` to get the appropriate div and then you can apply
 * background styling.
 *
 * This is no different from declaring `.form-field .form-field-bar` CSS style.
 */
const BackgroundFormField = styled(FormField)`
  && [data-hook=form-field-bar] {
    background-color: white;
  }
`;

const BackgroundInput = styled(Input)`
  && { color: green; }
`;

class StyledBackground extends React.Component {
  constructor() {
    super();

    this.state = { value: '' };
  }

  updateText = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
        padding: '40px 20px 0',
        margin: '100px auto',
        backgroundColor: GREY[100],
      }}>
        <BackgroundFormField>
          <Label>Superhero</Label>
          <BackgroundInput
            is="select"
            value={this.state.value}
            onChange={this.updateText}
            placeholder="Favorite Marvel superhero"
          >
            <option value="">Select</option>
            <option value="iron-man">Iron Man</option>
            <option value="hulk">Incredible Hulk</option>
            <option value="thor">Thor</option>
            <option value="black-widow">Black Widow</option>
            <option value="cap">Captain America</option>
          </BackgroundInput>
        </BackgroundFormField>
      </div>
    );
  }
}

export default StyledBackground;
