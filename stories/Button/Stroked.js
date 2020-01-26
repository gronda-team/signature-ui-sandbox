import React from 'react';
import { Button } from '../../src/lib/Button';
import { ButtonRow } from './styles';

export default function StrokedButtons() {
  return (
    <React.Fragment>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Thin stroke</div>
        <Button appearance="stroked">Default</Button>
        <Button appearance="stroked" color="primary">Primary</Button>
        <Button appearance="stroked" color="accent">Accent</Button>
        <Button appearance="stroked" color="warn">Warn</Button>
      </ButtonRow>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Thick stroke</div>
        <Button stroke="thick" appearance="stroked">Default</Button>
        <Button stroke="thick" appearance="stroked" color="primary">Primary</Button>
        <Button stroke="thick" appearance="stroked" color="accent">Accent</Button>
        <Button stroke="thick" appearance="stroked" color="warn">Warn</Button>
      </ButtonRow>
    </React.Fragment>
  );
}
