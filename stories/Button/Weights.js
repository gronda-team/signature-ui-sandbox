import React from 'react';
import { Button } from '../../src/lib/Button';
import { ButtonRow } from './styles';

export default function ButtonWeights() {
  return (
    <React.Fragment>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Default</div>
        <Button appearance="stroked">Default</Button>
        <Button appearance="stroked" color="primary">Primary</Button>
        <Button appearance="stroked" color="accent">Accent</Button>
        <Button appearance="stroked" color="warn">Warn</Button>
      </ButtonRow>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Demibold</div>
        <Button weight="demibold" stroke="thick" appearance="stroked">Default</Button>
        <Button weight="demibold" stroke="thick" appearance="stroked" color="primary">Primary</Button>
        <Button weight="demibold" stroke="thick" appearance="stroked" color="accent">Accent</Button>
        <Button weight="demibold" stroke="thick" appearance="stroked" color="warn">Warn</Button>
      </ButtonRow>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Bold</div>
        <Button weight="bold" stroke="thick" appearance="stroked">Default</Button>
        <Button weight="bold" stroke="thick" appearance="stroked" color="primary">Primary</Button>
        <Button weight="bold" stroke="thick" appearance="stroked" color="accent">Accent</Button>
        <Button weight="bold" stroke="thick" appearance="stroked" color="warn">Warn</Button>
      </ButtonRow>
    </React.Fragment>
  );
}
