import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Button } from '../../lib/button';
import spinner from '../../../public/icons/loading_light.png';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const spinAnimation = css`
${spin} 1s infinite steps(8)
`;
const Loader = styled.img.attrs({
  src: spinner,
  alt: 'Loading',
})`
height: 24px;
width: 24px;
display: inline-block;
margin-bottom: 4px;
vertical-align: middle;
animation: ${spinAnimation};
`;

class WithLoading extends React.Component {
  constructor() {
    super();

    this.state = { loading: false };
  }

  toggleLoading = () => {
    this.setState({ loading: true });
    this.LOADING_ID = window.setTimeout(() => {
      this.setState({ loading: false });
    }, 1000);
  };

  componentWillUnmount() {
    window.clearTimeout(this.LOADING_ID);
  }

  render() {
    return (
      <Button
        appearance="fill"
        onClick={this.toggleLoading}
        disabled={this.state.loading}
      >
        { this.state.loading ? (
          <Loader />
        ) : 'Submit'}
      </Button>
    );
  }
}

export default WithLoading;
