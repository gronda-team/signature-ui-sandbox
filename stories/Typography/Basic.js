import * as React from 'react';

export default function Basic() {
  return (
    <React.Fragment>
      <header>
        <h1 data-sui-typography="display1">Typography</h1>
      </header>
      <section data-sui-typography="true">
        <p data-sui-typography="display4">
          Documentation and examples for Signature UI typography.
        </p>
        <h2 data-sui-font-weight="bold">Global settings</h2>
        <p>Signature UI sets basic global display, typography, and link styles. When more control
        is needed, check out the textual utility classes.</p>
      </section>
    </React.Fragment>
  );
}
