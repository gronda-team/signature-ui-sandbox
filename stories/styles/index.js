import styled from 'styled-components';

export const Centered = styled.div`
  margin: 32px auto;
  width: 300px;
  
  &[data-size="large"] {
    width: 500px;
  }
`;
