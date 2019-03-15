import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../lib/button';
import styled from 'styled-components';

const ButtonRow = styled.div`
& > button {
  margin: 0 8px;
}
`;

function IconButtons() {
  return (
    <ButtonRow>
      <Button appearance="stroked" color="secondary">
        View profile
      </Button>
      <Button appearance="stroked" size="icon" color="secondary">
        <FontAwesomeIcon icon="pencil-alt" />
      </Button>
      <Button appearance="stroked" size="icon" color="secondary">
        <FontAwesomeIcon icon="trash" />
      </Button>
    </ButtonRow>
  );
}

export default IconButtons;
