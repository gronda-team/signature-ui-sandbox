import React from 'react';
import { Button } from '../../src/lib/Button';
import { ButtonRow } from './styles';

export default function Overview() {
  return (
    <React.Fragment>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Default buttons</div>
        <Button appearance="default">Default</Button>
        <Button appearance="default" color="primary">Primary</Button>
        <Button appearance="default" color="accent">Accent</Button>
        <Button appearance="default" color="warn">Warn</Button>
      </ButtonRow>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Basic buttons</div>
        <p data-sui-typography="body2">
          Basic buttons apply hover and active styles, while default buttons do not.
        </p>
        <Button appearance="basic">Default</Button>
        <Button appearance="basic" color="primary">Primary</Button>
        <Button appearance="basic" color="accent">Accent</Button>
        <Button appearance="basic" color="warn">Warn</Button>
      </ButtonRow>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Fill buttons</div>
        <Button appearance="fill">Default</Button>
        <Button appearance="fill" color="primary">Primary</Button>
        <Button appearance="fill" color="accent">Accent</Button>
        <Button appearance="fill" color="warn">Warn</Button>
      </ButtonRow>
      <ButtonRow>
        <div data-sui-typography="h2" data-sui-font-weight="demibold">Stroked buttons</div>
        <Button appearance="stroked">Default</Button>
        <Button appearance="stroked" color="primary">Primary</Button>
        <Button appearance="stroked" color="accent">Accent</Button>
        <Button appearance="stroked" color="warn">Warn</Button>
      </ButtonRow>
    </React.Fragment>
  );
}
