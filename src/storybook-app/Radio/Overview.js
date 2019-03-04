import React from 'react';
import styled from 'styled-components';
import { RadioGroup, Radio } from '../../lib/radio';

const StyledRadio = styled(Radio)``;

const Wrapper = styled.div`
${StyledRadio} ~ ${StyledRadio} {
  margin-left: 16px;
}
`;

class RadioOverview extends React.Component {
  constructor() {
    super();

    this.state = { value: null };
  }

  changeValue = (event) => {
    this.setState({ value: event.target.value });
  };

  render() {
    return (
      <Wrapper>
        <RadioGroup value={this.state.value} onChange={this.changeValue}>
          <StyledRadio value="1">Option 1</StyledRadio>
          <StyledRadio value="2">Option 2</StyledRadio>
        </RadioGroup>
      </Wrapper>
    );
  }
}

export default RadioOverview;
