import React from 'react';
import _ from 'lodash';
import { ButtonToggle, ButtonToggleGroup } from '../../src/lib/ButtonToggle';
import { Centered } from '../styles';

export default function Overview() {
  const [textState, setTextState] = React.useState(null);

  const onToggleChange = React.useCallback(({ added }) => {
    setTextState(_.head(added));
  }, [setTextState]);

  return (
    <Centered data-size="large">
      <h1 data-sui-typography="h2">Button toggles</h1>
      <p>Button toggles are groups of buttons that behave as a radio group (exclusive selection) or checkbox
        {' '}group (multiple selection).</p>
      <p>These come in many variants like the <b>button</b> components.</p>
      <ButtonToggleGroup
        appearance="fill"
        color="primary"
        value={textState}
        onChange={onToggleChange}
      >
        <ButtonToggle value="bold">Bold</ButtonToggle>
        <ButtonToggle value="italic">Italic</ButtonToggle>
        <ButtonToggle value="underline">Underline</ButtonToggle>
      </ButtonToggleGroup>
    </Centered>
  );
}
